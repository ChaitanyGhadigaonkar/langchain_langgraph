
from langchain_ollama import ChatOllama
from config import OLLAMA_API_KEY, OLLAMA_BASE_URL


model = ChatOllama(
    base_url=OLLAMA_BASE_URL,
    model="gemma4:31b-cloud",
    temperature=0.7,
    client_kwargs={
        "headers": {
            "Authorization": f"Bearer {OLLAMA_API_KEY}"
        }}
)
