"""
Модели базы данных (SQLAlchemy).

Что такое модель?
----------------
Модель — это Python класс, который описывает структуру таблицы в базе данных.
- Класс = Таблица
- Атрибут класса = Колонка в таблице
- Экземпляр класса = Строка в таблице

SQLAlchemy автоматически преобразует Python код в SQL запросы.
"""

from datetime import datetime
from sqlalchemy import Integer, String, DateTime, Float
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from .database import Base


class GameResult(Base):
    """
    Модель для хранения результатов игр.
    
    Таблица game_results:
    +----+-------------+-------+----------+---------------------+
    | id | player_name | score | duration | played_at           |
    +----+-------------+-------+----------+---------------------+
    | 1  | Player      | 42    | 125.5    | 2025-01-20 15:30:00 |
    | 2  | Player      | 67    | 180.2    | 2025-01-20 15:45:00 |
    +----+-------------+-------+----------+---------------------+
    
    Зачем хранить все игры, а не только лучший результат?
    ----------------------------------------------------
    1. Можно показать историю игр
    2. Можно считать статистику (средний счёт, общее время и т.д.)
    3. Можно строить графики прогресса
    """
    
    # Имя таблицы в базе данных
    __tablename__ = "game_results"
    
    # === Колонки таблицы ===
    
    # Уникальный идентификатор записи (первичный ключ)
    # autoincrement — автоматически увеличивается для каждой новой записи
    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
        comment="Уникальный ID записи"
    )
    
    # Имя игрока
    # Пока авторизации нет — используем дефолтное имя "Player"
    player_name: Mapped[str] = mapped_column(
        String(50),
        default="Player",
        nullable=False,
        comment="Имя игрока"
    )
    
    # Набранные очки
    score: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        comment="Набранные очки"
    )
    
    # Длительность игры в секундах
    # Float потому что может быть 125.5 секунд
    duration: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        comment="Длительность игры в секундах"
    )
    
    # Максимальная длина змейки (для статистики)
    max_length: Mapped[int] = mapped_column(
        Integer,
        default=1,
        nullable=False,
        comment="Максимальная длина змейки"
    )
    
    # Количество съеденной еды
    food_eaten: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
        comment="Количество съеденной еды"
    )
    
    # Количество съеденных бонусов
    bonuses_eaten: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
        comment="Количество съеденных бонусов"
    )
    
    # Дата и время игры
    # server_default=func.now() — база данных сама проставит текущее время
    played_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        comment="Дата и время игры"
    )
    
    def __repr__(self) -> str:
        """Строковое представление для отладки."""
        return f"<GameResult(id={self.id}, score={self.score}, player={self.player_name})>"
