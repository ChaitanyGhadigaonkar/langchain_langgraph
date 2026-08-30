from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
import uuid
import json
from typing import Annotated
from fastapi.responses import StreamingResponse
from langchain_core.messages import AIMessage, ToolMessage

from api.db import get_db_instance, Session
from api.exceptions import NotFoundError
from api.models import Conversation
from api.models import Message as DBMessage
from api.schema.conversations import ConversationSchema, GetConversationsResponse, CreateConversationResponse, GetConversationResponse
from api.schema.messages import SendMessageRequest


router = APIRouter(prefix="/c", tags=["conversations"])


@router.get("/", response_model=GetConversationsResponse)
async def get_conversations(req: Request, db: Annotated[AsyncSession, Depends(get_db_instance)]):
    user_id = req.headers.get("user_id")
    result = await db.execute(select(Conversation).where(Conversation.user_id == user_id).order_by(Conversation.updated_at.desc()))
    return GetConversationsResponse(
        success=True,
        message="Conversations retrieved successfully",
        conversations=result.scalars().all()
    )


@router.get("/{conversation_id}", response_model=GetConversationResponse)
async def get_conversation(conversation_id: uuid.UUID, db: Annotated[AsyncSession, Depends(get_db_instance)]):
    stmt = select(Conversation).where(Conversation.id == conversation_id).options(
        selectinload(Conversation.messages))
    result = await db.execute(stmt)
    conversation = result.scalar_one_or_none()

    if not conversation:
        raise NotFoundError("Conversation not found")

    # Sort messages by created_at to ensure correct order
    sorted_messages = sorted(conversation.messages, key=lambda m: m.created_at)

    return GetConversationResponse(
        success=True,
        message="Conversation loaded successfully",
        conversation=conversation,
        messages=sorted_messages
    )


@router.post("/", response_model=CreateConversationResponse, status_code=201)
async def create_conversation(req: Request, db: Annotated[AsyncSession, Depends(get_db_instance)]):
    user_id = req.headers.get("user_id")
    new_conversation = Conversation(
        user_id=user_id,
        title=None
    )
    # raise HTTPException(status_code=400, detail="Form Error")
    db.add(new_conversation)
    await db.commit()
    await db.refresh(new_conversation)

    return CreateConversationResponse(
        success=True,
        message="Conversation created successfully",
        conversation=new_conversation
    )


def extract_text_from_langchain_content(content) -> str:
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for block in content:
            if isinstance(block, str):
                parts.append(block)
            elif isinstance(block, dict):
                if block.get("type") == "text" and "text" in block:
                    parts.append(block["text"])
                elif "text" in block:
                    parts.append(str(block["text"]))
        return "".join(parts)
    return str(content) if content else ""


@router.post("/{conversation_id}/messages")
async def send_message(
    conversation_id: uuid.UUID,
    payload: SendMessageRequest,
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db_instance)]
):
    user_msg = DBMessage(
        conversation_id=conversation_id,
        role="user",
        content={"text": payload.text}
    )
    db.add(user_msg)
    await db.commit()
    await db.refresh(user_msg)

    agent_graph = request.app.state.agent_graph

    async def event_generator():
        config = {"configurable": {"thread_id": str(conversation_id)}}

        initial_state = await agent_graph.aget_state(config=config)
        existing_msg_count = len(initial_state.values.get(
            "messages", [])) if initial_state and initial_state.values else 0

        inputs = {"messages": [("user", payload.text)], "llm_calls": 0}

        try:
            async for event in agent_graph.astream_events(inputs, config=config, version="v1"):
                kind = event["event"]
                sse_data = {"event": kind}

                if kind == "on_chat_model_stream":
                    chunk = event["data"]["chunk"]
                    text = extract_text_from_langchain_content(chunk.content)
                    if text:
                        sse_data["content"] = text
                    if chunk.tool_call_chunks:
                        sse_data["tool_calls"] = [
                            {"id": tc.get("id"), "name": tc.get(
                                "name"), "args": tc.get("args")}
                            for tc in chunk.tool_call_chunks
                        ]
                    if not text and not chunk.tool_call_chunks:
                        continue

                elif kind == "on_tool_start":
                    sse_data["name"] = event["name"]
                    sse_data["input"] = event["data"].get("input")

                elif kind == "on_tool_end":
                    sse_data["name"] = event["name"]
                    # output is a ToolMessage, extract content if possible
                    tool_msg = event["data"].get("output")
                    if hasattr(tool_msg, 'content'):
                        sse_data["output"] = tool_msg.content
                    else:
                        sse_data["output"] = tool_msg
                else:
                    continue

                yield f"data: {json.dumps(sse_data, default=str)}\n\n"
        finally:
            # After streaming completes, persist the assistant and tool messages to DB
            final_state = await agent_graph.aget_state(config=config)
            if final_state and final_state.values:
                all_messages = final_state.values.get("messages", [])
                new_messages = all_messages[existing_msg_count:]

                async with Session() as session:
                    parent_id = user_msg.id
                    for msg in new_messages:
                        if isinstance(msg, AIMessage):
                            if msg.tool_calls:
                                tc_record = DBMessage(
                                    conversation_id=conversation_id,
                                    role="assistant",
                                    content={
                                        "tool_calls": [
                                            {
                                                "id": tc.get("id"),
                                                "name": tc.get("name"),
                                                "args": tc.get("args", {})
                                            }
                                            for tc in msg.tool_calls
                                        ]
                                    },
                                    parent_id=parent_id
                                )
                                session.add(tc_record)
                                await session.flush()
                                parent_id = tc_record.id
                            if msg.content:
                                text_content = extract_text_from_langchain_content(
                                    msg.content)
                                if text_content:
                                    ai_record = DBMessage(
                                        conversation_id=conversation_id,
                                        role="assistant",
                                        content={"text": text_content},
                                        parent_id=parent_id
                                    )
                                    session.add(ai_record)
                                    await session.flush()
                                    parent_id = ai_record.id
                        elif isinstance(msg, ToolMessage):
                            tool_record = DBMessage(
                                conversation_id=conversation_id,
                                role="tool",
                                content={
                                    "tool_call_id": msg.tool_call_id or "",
                                    "name": getattr(msg, "name", None) or "tool",
                                    "output": msg.content
                                },
                                parent_id=parent_id
                            )
                            session.add(tool_record)
                            await session.flush()
                            parent_id = tool_record.id

                    await session.commit()

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
