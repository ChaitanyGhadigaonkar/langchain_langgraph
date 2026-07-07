from langchain_ollama import OllamaEmbeddings
from langchain_postgres import PGVector
from config import DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME


embeddings = OllamaEmbeddings(
    model="embeddinggemma:300m",
    dimensions=768
)

vector_store = PGVector(
    embeddings=embeddings,
    collection_name="documents",
    connection=f"postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}?sslmode=require"
)
