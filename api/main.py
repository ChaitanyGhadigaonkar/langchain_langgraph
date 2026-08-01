from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import DatabaseError as SQLAlchemyDatabaseError
from contextlib import asynccontextmanager

from psycopg_pool import AsyncConnectionPool
from psycopg.rows import dict_row
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Annotated


from langchain.messages import HumanMessage


from retriever_agent.graph import get_graph
from config import get_api_database_url
from api.db import engine, get_db_instance
from api.models import Base, Conversation
from api.routes.conversations import router as conversations_router
from api.exceptions import APIException


DB_URL = get_api_database_url()


pool = None
checkpointer = None
agent_graph = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global pool, checkpointer, agent_graph

    pool = AsyncConnectionPool(
        conninfo=DB_URL,
        min_size=5,
        max_size=20,
        max_idle=300.0,
        open=False,
        kwargs={
            "autocommit": True,
            "row_factory": dict_row,
            "prepare_threshold": None,
        },
    )

    await pool.open()

    checkpointer = AsyncPostgresSaver(pool)
    await checkpointer.setup()
    graph = get_graph()

    agent_graph = graph.compile(checkpointer=checkpointer)
    app.state.agent_graph = agent_graph
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()
    await pool.close()


app = FastAPI(lifespan=lifespan)

@app.exception_handler(APIException)
async def api_exception_handler(request: Request, exc: APIException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "message": exc.message}
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"success": False, "message": "Validation error"}
    )

@app.exception_handler(SQLAlchemyDatabaseError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyDatabaseError):
    return JSONResponse(
        status_code=500,
        content={"success": False, "message": "Database error occurred"}
    )

app.include_router(conversations_router)


@app.get("/health")
async def health_check():
    """Health check endpoint.

    Returns:
        dict: Health status information.
    """
    return {"status": "healthy", "version": "1.0.0"}


@app.get("/setup")
async def setup(db: Annotated[AsyncSession, Depends(get_db_instance)]):
    config = {
        "configurable": {
            "thread_id": "thread_id",
            "user_id": "user_id",
        }
    }

    conversations = await db.execute(select(Conversation).order_by(Conversation.id))

    response = await agent_graph.ainvoke(
        {"messages": [HumanMessage(content="Hi")], "llm_calls": 0},
        config=config,
    )

    return {
        "response": response["messages"],
        "conversations": conversations.scalars().all()
    }
