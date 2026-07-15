import os
from langchain_groq import ChatGroq
from langchain_ollama import ChatOllama
from config import OLLAMA_API_KEY, OLLAMA_BASE_URL


model = ChatOllama(
    base_url=OLLAMA_BASE_URL,
    model="minimax-m3:cloud",
    temperature=0.7,
    client_kwargs={
        "headers": {
            "Authorization": f"Bearer {OLLAMA_API_KEY}"
        }}
)

os.environ["GROQ_API_KEY"] = os.getenv("GROQ_API_KEY")

model = ChatGroq(
    model="openai/gpt-oss-120b",
    temperature=0.5,
    max_tokens=None,
    timeout=None,
    max_retries=2,
)
