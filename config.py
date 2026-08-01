import os

from dotenv import load_dotenv
load_dotenv()


DB_USER = os.getenv("DB_USER")
DB_HOST = os.getenv("DB_HOST")
DB_NAME = os.getenv("DB_NAME")
DB_PORT = os.getenv("DB_PORT")
DB_PASSWORD = os.getenv("DB_PASSWORD")

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL")
OLLAMA_API_KEY = os.getenv("OLLAMA_API_KEY")

GOOGLE_CLOUD_PROJECT = os.getenv("GOOGLE_CLOUD_PROJECT")

API_DATABASE_URL = os.getenv("API_DATABASE_URL")


def get_api_database_url() -> str:
    """Return the API database URL or fail with an actionable configuration error."""
    if not API_DATABASE_URL:
        raise RuntimeError("API_DATABASE_URL must be set in .env before starting the API.")

    return API_DATABASE_URL
