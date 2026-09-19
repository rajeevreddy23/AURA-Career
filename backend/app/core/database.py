from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from .config import settings

def get_db_url() -> str:
    url = settings.database_url or ""
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+asyncpg://", 1)
    elif url.startswith("postgresql://") and not url.startswith("postgresql+asyncpg://"):
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
    return url

_db_url = get_db_url()

engine = (
    create_async_engine(
        _db_url,
        echo=settings.debug,
        pool_pre_ping=True,
        pool_recycle=300,
    )
    if _db_url
    else None
)

async_session = (
    async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    if engine
    else None
)

class Base(DeclarativeBase):
    pass

async def get_db():
    if not async_session:
        yield None
        return
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

async def init_db():
    if not engine:
        return
    from ..models import database_models  # noqa: F401
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
