"""
Конфигурация Backend приложения через Pydantic Settings.
"""

import os
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class DatabaseSettings(BaseSettings):
    """Настройки базы данных."""
    
    model_config = SettingsConfigDict(env_prefix="DB_")
    
    # URL подключения к базе данных
    # Render устанавливает DATABASE_URL при подключении PostgreSQL
    # Для локальной разработки используем SQLite
    @property
    def url(self) -> str:
        database_url = os.getenv("DATABASE_URL")
        
        if database_url:
            # Render даёт URL в формате postgres://, а SQLAlchemy нужен postgresql+asyncpg://
            if database_url.startswith("postgres://"):
                database_url = database_url.replace("postgres://", "postgresql+asyncpg://", 1)
            elif database_url.startswith("postgresql://"):
                database_url = database_url.replace("postgresql://", "postgresql+asyncpg://", 1)
            return database_url
        
        # Fallback для локальной разработки
        return "sqlite+aiosqlite:///./snake.db"


class GameSettings(BaseSettings):
    """Настройки игры."""
    
    model_config = SettingsConfigDict(env_prefix="GAME_")
    
    leaderboard_size: int = Field(
        default=10,
        description="Количество записей в таблице лидеров"
    )
    
    max_player_name_length: int = Field(
        default=20,
        description="Максимальная длина имени игрока"
    )


class Settings(BaseSettings):
    """Главный класс настроек приложения."""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )
    
    db: DatabaseSettings = DatabaseSettings()
    game: GameSettings = GameSettings()
    
    debug: bool = Field(
        default=False,
        description="Режим отладки"
    )
    
    app_name: str = Field(
        default="🐍 Snake Game API",
        description="Название приложения"
    )
    
    cors_origins: list[str] = Field(
        default=[
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:3000",
            "https://dist-lime-mu.vercel.app",
            "https://frontend-drab-ten-89.vercel.app",
            "https://snakepromo.ru",
            "https://www.snakepromo.ru",
        ],
        description="Разрешённые origins для CORS"
    )
    
    # Разрешить все origins для Vercel preview deployments
    cors_allow_all_vercel: bool = Field(
        default=True,
        description="Разрешить все *.vercel.app origins"
    )


settings = Settings()
