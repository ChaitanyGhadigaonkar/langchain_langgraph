from langchain.tools import tool
from retriever_agent.vector_store import vector_store


@tool
def retrieve_context(query: str):
    """
        Retrieve information to help answer a query.
    """

    retrieved_docs = vector_store.similarity_search(query, k=10)

    serialized = "\n\n".join(
        (f"Source: {doc.metadata}\nContent: {doc.page_content}") for doc in retrieved_docs
    )

    return serialized


tools = [retrieve_context]

tools_by_name = {tool.name: tool for tool in tools}
