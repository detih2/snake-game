"""
Pydantic схемы для валидации данных API.

Зачем нужны схемы?
-----------------
1. Валидация входящих данных (проверка типов, ограничений)
2. Сериализация исходящих данных (преобразование в JSON)
3. Автоматическая документация API (OpenAPI/Swagger)

Разница между Model и Schema:
----------------------------
- Model (SQLAlchemy) — описывает структуру ТАБЛИЦЫ в базе данных
- Schema (Pydantic) — описывает структуру JSON для API запросов/ответов

Один и тот же объект может иметь разные схемы:
- GameResultCreate — что принимаем при создании (без id, без played_at)
- GameResultResponse — что возвращаем в ответе (с id, с played_at)
"""

from datetime import datetime
from pydantic import BaseModel, Field, field_validator


# === Схемы для GameResult ===

class GameResultCreate(BaseModel):
    """
    Схема для создания результата игры.
    
    Что приходит от frontend после окончания игры.
    id и played_at — НЕ нужны, они создаются автоматически.
    """
    
    player_name: str = Field(
        default="Player",
        max_length=50,
        description="Имя игрока"
    )
    
    score: int = Field(
        ...,  # ... означает "обязательное поле"
        ge=0,  # ge = greater or equal (больше или равно 0)
        description="Набранные очки"
    )
    
    duration: float = Field(
        ...,
        ge=0,
        description="Длительность игры в секундах"
    )
    
    max_length: int = Field(
        default=1,
        ge=1,
        description="Максимальная длина змейки"
    )
    
    food_eaten: int = Field(
        default=0,
        ge=0,
        description="Количество съеденной еды"
    )
    
    bonuses_eaten: int = Field(
        default=0,
        ge=0,
        description="Количество съеденных бонусов"
    )
    
    @field_validator("player_name")
    @classmethod
    def validate_player_name(cls, v: str) -> str:
        """
        Валидация имени игрока.
        
        Убираем лишние пробелы и проверяем что имя не пустое.
        """
        v = v.strip()
        if not v:
            return "Player"
        return v


class GameResultResponse(BaseModel):
    """
    Схема ответа с результатом игры.
    
    Что возвращаем клиенту после сохранения.
    Включает id и played_at, которые создались в базе.
    """
    
    id: int = Field(description="Уникальный ID записи")
    player_name: str = Field(description="Имя игрока")
    score: int = Field(description="Набранные очки")
    duration: float = Field(description="Длительность игры в секундах")
    max_length: int = Field(description="Максимальная длина змейки")
    food_eaten: int = Field(description="Количество съеденной еды")
    bonuses_eaten: int = Field(description="Количество съеденных бонусов")
    played_at: datetime = Field(description="Дата и время игры")
    
    # Позволяет создавать схему из SQLAlchemy модели
    model_config = {"from_attributes": True}


# === Схемы для Leaderboard ===

class LeaderboardEntry(BaseModel):
    """
    Одна запись в таблице лидеров.
    
    Содержит только ключевую информацию для отображения.
    """
    
    rank: int = Field(description="Место в рейтинге (1, 2, 3...)")
    player_name: str = Field(description="Имя игрока")
    score: int = Field(description="Лучший результат")
    played_at: datetime = Field(description="Когда был достигнут")
    
    model_config = {"from_attributes": True}


class LeaderboardResponse(BaseModel):
    """
    Полный ответ таблицы лидеров.
    
    Содержит список лидеров и метаинформацию.
    """
    
    entries: list[LeaderboardEntry] = Field(
        description="Список лидеров (TOP-N)"
    )
    total_games: int = Field(
        description="Общее количество сыгранных игр"
    )
    total_players: int = Field(
        description="Количество уникальных игроков"
    )


# === Схемы для статистики ===

class PlayerStats(BaseModel):
    """
    Статистика игрока.
    
    Агрегированные данные по всем играм игрока.
    """
    
    player_name: str = Field(description="Имя игрока")
    total_games: int = Field(description="Всего игр сыграно")
    best_score: int = Field(description="Лучший результат")
    average_score: float = Field(description="Средний результат")
    total_time_played: float = Field(description="Общее время игры (секунды)")
    total_food_eaten: int = Field(description="Всего еды съедено")
    total_bonuses_eaten: int = Field(description="Всего бонусов съедено")
    longest_snake: int = Field(description="Самая длинная змейка")


# === Общие схемы ===

class MessageResponse(BaseModel):
    """Простой ответ с сообщением."""
    
    message: str = Field(description="Текст сообщения")
    success: bool = Field(default=True, description="Успешность операции")


class HealthResponse(BaseModel):
    """Ответ проверки здоровья сервиса."""
    
    status: str = Field(default="healthy", description="Статус сервиса")
    version: str = Field(default="1.0.0", description="Версия API")
