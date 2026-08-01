# Complete End to End Agentic RAG using langchain & langgraph

## Project Structure & Module Organization

- `retriever_agent/` contains the LangGraph RAG workflow: `graph.py` builds the graph and Postgres checkpointer, `model.py` configures the chat model, `tool.py` exposes retrieval, and `vector_store.py` configures embeddings and PGVector.
- `experiments/streamlit/ui.py` is the Streamlit chat interface used for testing and will be shifted to `next.js` for the frontend.
- `api/` contains an in-progress FastAPI interface and SQLAlchemy models. Root-level `config.py` loads environment settings; notebooks support ingestion and experimentation. Keep generated data and source PDFs in `papers/` (ignored by Git).
- `experiments/notebooks/` contains exploratory and testing notebooks.

## Setup, Run, and Validation

Use Python 3.13+ and `uv`; do not use `pip` for project dependencies. Create a local `.env` from the required variables in `config.py` (`DB_*`, `OLLAMA_*`, and any provider credentials). PostgreSQL and the Ollama embedding/chat services must be reachable before running the app.

```bash
uv sync                         # install locked dependencies
uv run streamlit run experiments/streamlit/ui.py  # start the chat UI
uv run python main.py           # run the CLI experiment
uv run python -c "import ast; ast.parse(open('experiments/streamlit/ui.py').read())"  # syntax check
```

There is no committed automated test suite yet. For changes to the graph or UI, run the syntax check, start Streamlit, ask a retrieval question, then ask a follow-up question to verify thread history. Add focused `pytest` tests under `tests/` as functionality becomes testable.

## Coding Style & Naming

Follow standard Python style: four-space indentation, `snake_case` for functions, variables, and modules, and `PascalCase` for classes. Keep type annotations on public functions and Pydantic/SQLAlchemy models. Put retrieval tools in `retriever_agent/tool.py` with `@tool` and an explicit argument schema. Preserve the LangGraph state contract: node updates append `messages`; they must not replace the conversation history.

## Architecture & Async Safety

The graph uses an async Postgres checkpointer. Initialize and invoke it on the same long-lived event loop; do not introduce `asyncio.run()` around an already initialized Streamlit graph. Use the session `thread_id` consistently so conversations remain isolated.

## Commits & Pull Requests

Recent commits use short, imperative lowercase subjects (for example, `added metadata-based filtering`). Keep each commit focused. Pull requests should describe the behavior change, list validation performed, link relevant issues, and include a Streamlit screenshot for visible UI changes. Never commit `.env`, credentials, or local PDFs.
