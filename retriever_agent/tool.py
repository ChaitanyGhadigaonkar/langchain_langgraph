from langchain.tools import tool
from retriever_agent.vector_store import vector_store
from pydantic import BaseModel, Field


class RetrieveContextArgs(BaseModel):
    query: str = Field(description="User query")
    filter: dict | None = Field(
        default=None,
        description="""
        Optional Pinecone metadata filter. Dict of field: {operator: value} pairs.
        Operators: $eq, $ne, $gt, $gte, $lt, $lte, $in, $nin, $exists.
        Combine conditions with $and / $or.
        Example: {'source': {'$eq': 'papers/s41467-025-58527-6.pdf'},
            'page': {'$gte': 10}}
        (top-level fields are ANDed by default).
        Always use an operator — plain {'source': 'papers/s41467-025-58527-6.pdf'} is not valid.
        Omit or pass null if no filtering is needed.

        Available metadata fields:
        - author (str): document author, e.g. 'Gyeo-Re Han'
        - creationdate (str): PDF creation timestamp, e.g. '2025-04-02T18:09:35+05:30'
        - creator (str): tool/publisher that created the PDF, e.g. 'Springer'
        - doi (str): document DOI, e.g. '10.1038/s41467-025-58527-6'
        - keywords (str): document keywords
        - moddate (str): PDF last-modified timestamp
        - page (int): zero-indexed page number
        - page_label (str): human-readable page label, e.g. '33'
        - producer (str): PDF producer software
        - source (str): file path of the source document, e.g. 'papers/s41467-025-58527-6.pdf'
        - subject (str): document subject/journal info, e.g. 'Nature Communications, doi:...'
        - title (str): document title
        - total_pages (int): total number of pages in the document
    """)
    k: int = Field(
        description="total documents to be required. please set it accordingly with respect to user query.")


@tool(args_schema=RetrieveContextArgs)
def retrieve_context(query: str, filter: dict | None, k: int):
    """Retrieve information to help answer a query."""
    if filter and "page" in filter:
        for op, val in filter["page"].items():
            if isinstance(val, str) and val.isdigit():
                filter["page"][op] = int(val)
    retrieved_docs = vector_store.similarity_search(query, k=k, filter=filter)

    if not retrieved_docs:
        return f"No results found for query='{query}' with filter={filter}. Try a broader query or no filter."

    serialized = "\n\n".join(
        f"Source: {doc.metadata}\nContent: {doc.page_content}" for doc in retrieved_docs
    )
    return serialized


tools = [retrieve_context]

tools_by_name = {tool.name: tool for tool in tools}
