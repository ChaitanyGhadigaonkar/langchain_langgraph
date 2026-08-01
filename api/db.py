from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

from config import get_api_database_url


DATABASE_URL = get_api_database_url()
SQLALCHEMY_DATABASE_URL = DATABASE_URL.replace(
    "postgresql://", "postgresql+psycopg://", 1
)

engine = create_async_engine(SQLALCHEMY_DATABASE_URL)

Session = async_sessionmaker(bind=engine, expire_on_commit=False)


async def get_db_instance():
    async with Session() as session:
        yield session
