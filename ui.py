import streamlit as st
from langchain.messages import HumanMessage
import uuid
import asyncio

from retriever_agent.graph import get_app

if "user_id" not in st.query_params:
    st.query_params.user_id = str(uuid.uuid4())

if "thread_id" not in st.query_params:
    st.query_params.thread_id = str(uuid.uuid4())

user_id = st.query_params.user_id
thread_id = st.query_params.thread_id

config = {
    "configurable": {
        "thread_id": thread_id,
        "user_id": user_id,
    }
}


@st.cache_resource
def get_event_loop():
    return asyncio.new_event_loop()


loop = get_event_loop()


@st.cache_resource
def get_cached_graph():
    async def _setup():
        return await get_app()
    return loop.run_until_complete(_setup())


app = get_cached_graph()


def load_history():
    """Fetch prior conversation for this thread_id/user_id from the checkpointer."""
    async def _get():
        state = await app.aget_state(config=config)
        if state and state.values:
            return state.values.get("messages", [])
        return []

    return loop.run_until_complete(_get())


if "messages" not in st.session_state:
    st.session_state.messages = load_history()

st.title("HelloGPT")

for msg in st.session_state.messages:
    role = "user" if isinstance(msg, HumanMessage) else "assistant"
    with st.chat_message(role):
        st.write(msg.content)

prompt = st.chat_input("Ask anything")

if prompt:
    with st.chat_message("user"):
        st.write(prompt)

    st.session_state.messages.append(HumanMessage(content=prompt))

    async def _invoke():
        return await app.ainvoke(
            {"messages": st.session_state.messages, "llm_calls": 0},
            config=config,
        )

    with st.chat_message("assistant"):
        with st.spinner("Thinking..."):
            result = loop.run_until_complete(_invoke())

        ai_message = result["messages"][-1]
        st.write(ai_message.content)

    st.session_state.messages = result["messages"]
