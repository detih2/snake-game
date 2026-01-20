"""
Настройка подключения к SQLite базе данных.

Что здесь происходит?
--------------------
1. Создаём "движок" (engine) для подключения к SQLite
2. Создаём фабрику сессий — через сессии мы общаемся с БД
3. Определяем базовый класс для моделей

Почему SQLite?
--------------
- Не требует установки отдельного сервера (в отличие от PostgreSQL, MySQL)
- Вся база данных — один файл (snake.db)
- Идеально для локальной разработки и небольших проектов
- При необходимости легко мигрировать на PostgreSQL

Почему асинхронный драйвер (aiosqlite)?
--------------------------------------
FastAPI — асинхронный фреймворк. Если использовать синхронный драйвер,
при каждом запросе к БД весь сервер будет "ждать" ответа.
Асинхронный драйвер позволяет обрабатывать другие запросы пока ждём БД.
"""

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

import sys
sys.path.insert(0, '..')
from settings import settings


# === Создаём асинхронный движок для SQLite ===
# echo=True — выводит SQL запросы в консоль (полезно для отладки)
engine = create_async_engine(
    settings.db.url,
    echo=settings.debug,  # Показывать SQL запросы только в режиме отладки
)


# === Фабрика сессий ===
# Сессия — это "разговор" с базой данных
# expire_on_commit=False — объекты остаются доступны после commit()
async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


# === Базовый класс для моделей ===
# Все модели (таблицы) будут наследоваться от этого класса
class Base(DeclarativeBase):
    """
    Базовый класс для всех моделей SQLAlchemy.
    
    Что такое модель?
    ----------------
    Модель — это Python класс, который описывает таблицу в базе данных.
    Каждый атрибут класса = колонка в таблице.
    """
    pass


async def create_db_and_tables() -> None:
    """
    Создать базу данных и все таблицы.
    
    Эта функция вызывается при старте приложения.
    Если таблицы уже существуют — ничего не произойдёт.
    """
    async with engine.begin() as conn:
        # Создаём все таблицы, которые описаны в моделях
        await conn.run_sync(Base.metadata.create_all)


async def get_async_session() -> AsyncSession:
    """
    Dependency для FastAPI — получить сессию базы данных.
    
    Что такое Dependency?
    --------------------
    Dependency Injection — это паттерн, когда FastAPI сам "вкалывает"
    нужные объекты в функции-обработчики.
    
    Пример использования:
        @app.get("/items")
        async def get_items(session: AsyncSession = Depends(get_async_session)):
            # session уже готова к использованию
            ...
    """
    async with async_session_maker() as session:
        yield session
