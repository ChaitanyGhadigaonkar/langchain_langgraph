from typing_extensions import TypedDict, Annotated
import operator
from langgraph.graph.message import add_messages
from langchain.messages import AnyMessage


class MessagesState(TypedDict):
    messages: Annotated[list[AnyMessage], add_messages]
    llm_calls: int
