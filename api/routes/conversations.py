from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
import uuid
import json
from typing import Annotated
from fastapi import Request
from fastapi.responses import StreamingResponse

from api.db import get_db_instance
from api.exceptions import NotFoundError
from api.models import Conversation
from api.models import Message as DBMessage
from api.schema.conversations import ConversationSchema, GetConversationsResponse, CreateConversationResponse, GetConversationResponse
from api.schema.messages import SendMessageRequest


router = APIRouter(prefix="/c", tags=["conversations"])


@router.get("/", response_model=GetConversationsResponse)
async def get_conversations(db: Annotated[AsyncSession, Depends(get_db_instance)]):
    result = await db.execute(select(Conversation).order_by(Conversation.updated_at.desc()))

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
async def create_conversation(db: Annotated[AsyncSession, Depends(get_db_instance)]):
    hardcoded_user_id = uuid.UUID("11111111-1111-1111-1111-111111111111")

    new_conversation = Conversation(
        user_id=hardcoded_user_id,
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

    agent_graph = request.app.state.agent_graph

    async def event_generator():
        config = {"configurable": {"thread_id": str(conversation_id)}}
        inputs = {"messages": [("user", payload.text)]}

        async for event in agent_graph.astream_events(inputs, config=config, version="v1"):
            kind = event["event"]
            sse_data = {"event": kind}

            if kind == "on_chat_model_stream":
                chunk = event["data"]["chunk"]
                if chunk.content:
                    sse_data["content"] = chunk.content
                if chunk.tool_call_chunks:
                    sse_data["tool_calls"] = chunk.tool_call_chunks

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

            yield f"data: {json.dumps(sse_data, default=str)}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
