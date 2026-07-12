from config import DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME
from langgraph.graph import StateGraph, START
from langchain_core.messages import ToolMessage
from typing import Literal
from langgraph.graph import END
from psycopg.rows import dict_row
from psycopg.errors import DatabaseError
from psycopg_pool import AsyncConnectionPool
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from retriever_agent.tool import tools, tools_by_name
from retriever_agent.model import model
from retriever_agent.state import MessagesState

model = model.bind_tools(tools)


def model_node(state: MessagesState) -> MessagesState:
    """
        Model decides whether to call a tool or not
    """
    response = model.invoke(state["messages"])

    return {
        "messages": [response],
        "llm_calls": state["llm_calls"] + 1
    }


def tool_node(state: MessagesState) -> MessagesState:
    """
        Performs a tool call
    """

    result: list[ToolMessage] = []

    tool_calls = state["messages"][-1].tool_calls

    for tool_call in tool_calls:
        tool_name = tool_call["name"]

        tool = tools_by_name[tool_name]

        tool_result = tool.invoke(tool_call["args"])

        result.append(ToolMessage(
            content=tool_result, tool_call_id=tool_call["id"]))

    return {
        "messages": result
    }


def should_continue(state: MessagesState) -> Literal["tool_node", "__end__"]:
    """Decide if we should continue the loop or stop based upon whether the LLM made a tool call"""

    messages = state["messages"]
    last_message = messages[-1]

    if last_message.tool_calls:
        return "tool_node"

    return END


DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}?sslmode=require"


_app = None

_pool = None


def get_pool():
    global _pool

    if _pool is None:
        _pool = AsyncConnectionPool(
            conninfo=DATABASE_URL,
            kwargs={"autocommit": True, "row_factory": dict_row},
            max_size=10,
            min_size=4,
            open=False,
        )

    return _pool


async def get_app():
    try:
        global _app
        if _app is None:
            pool = get_pool()
            await pool.open(wait=True, timeout=10)

            checkpointer = AsyncPostgresSaver(conn=pool)
            await checkpointer.setup()

            graph = StateGraph(MessagesState)
            graph.add_node("llm_call", model_node)
            graph.add_node("tool_node", tool_node)
            graph.add_edge(START, "llm_call")
            graph.add_conditional_edges(
                "llm_call",
                should_continue,
                ["tool_node", END],
            )
            graph.add_edge("tool_node", "llm_call")

            _app = graph.compile(checkpointer=checkpointer)

        return _app
    except DatabaseError:
        raise ValueError("Error while connecting to database.")
    except Exception as e:
        print(str(e))
        raise ValueError("Something went's wrong")
