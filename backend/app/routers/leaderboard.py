"""
API роутер для таблицы лидеров.

Таблица лидеров показывает лучших игроков по набранным очкам.
Это мотивирует играть снова и улучшать свой результат!
"""

from fastapi import APIRouter, Depends
from sqlalchemy import select, func, distinct
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_async_session
from ..models import GameResult
from ..schemas import LeaderboardEntry, LeaderboardResponse

import sys
sys.path.insert(0, '../..')
from settings import settings

# Создаём роутер
router = APIRouter(
    prefix="/api/leaderboard",
    tags=["leaderboard"],
)


@router.get(
    "",
    response_model=LeaderboardResponse,
    summary="Получить таблицу лидеров",
    description="Возвращает TOP-N игроков по лучшему результату.",
)
async def get_leaderboard(
    limit: int = None,
    session: AsyncSession = Depends(get_async_session),
) -> LeaderboardResponse:
    """
    Получить таблицу лидеров.
    
    Возвращает список лучших результатов.
    Если один игрок имеет несколько игр — показываем только лучший результат.
    
    Алгоритм:
    1. Группируем по имени игрока
    2. Берём максимальный score для каждого игрока
    3. Сортируем по убыванию score
    4. Ограничиваем количество записей
    
    Args:
        limit: Количество записей (по умолчанию из настроек)
        session: Сессия базы данных
    
    Returns:
        Таблица лидеров с метаинформацией
    """
    # Используем limit из настроек если не передан
    if limit is None:
        limit = settings.game.leaderboard_size
    
    # Ограничиваем максимальное значение
    limit = min(limit, 100)
    
    # === Подзапрос: лучший результат каждого игрока ===
    # Это как "для каждого игрока найди его лучшую игру"
    subquery = (
        select(
            GameResult.player_name,
            func.max(GameResult.score).label("best_score"),
        )
        .group_by(GameResult.player_name)
        .subquery()
    )
    
    # === Основной запрос: детали лучших игр ===
    # Присоединяем подзапрос чтобы получить полную информацию об игре
    query = (
        select(GameResult)
        .join(
            subquery,
            (GameResult.player_name == subquery.c.player_name) &
            (GameResult.score == subquery.c.best_score)
        )
        .order_by(GameResult.score.desc())
        .limit(limit)
    )
    
    result = await session.execute(query)
    games = result.scalars().all()
    
    # Формируем записи таблицы лидеров с рангом (местом)
    entries = [
        LeaderboardEntry(
            rank=idx + 1,  # Место: 1, 2, 3...
            player_name=game.player_name,
            score=game.score,
            played_at=game.played_at,
        )
        for idx, game in enumerate(games)
    ]
    
    # === Считаем общую статистику ===
    
    # Общее количество игр
    total_games_query = select(func.count(GameResult.id))
    total_games_result = await session.execute(total_games_query)
    total_games = total_games_result.scalar() or 0
    
    # Количество уникальных игроков
    total_players_query = select(func.count(distinct(GameResult.player_name)))
    total_players_result = await session.execute(total_players_query)
    total_players = total_players_result.scalar() or 0
    
    return LeaderboardResponse(
        entries=entries,
        total_games=total_games,
        total_players=total_players,
    )


@router.get(
    "/position",
    summary="Узнать позицию игрока",
    description="Возвращает место игрока в рейтинге по его лучшему результату.",
)
async def get_player_position(
    player_name: str = "Player",
    session: AsyncSession = Depends(get_async_session),
) -> dict:
    """
    Узнать позицию игрока в таблице лидеров.
    
    Args:
        player_name: Имя игрока
        session: Сессия базы данных
    
    Returns:
        Позиция и лучший результат игрока
    """
    # Находим лучший результат игрока
    best_score_query = (
        select(func.max(GameResult.score))
        .where(GameResult.player_name == player_name)
    )
    best_score_result = await session.execute(best_score_query)
    best_score = best_score_result.scalar()
    
    if best_score is None:
        return {
            "player_name": player_name,
            "position": None,
            "best_score": None,
            "message": "Игрок ещё не играл",
        }
    
    # Считаем сколько игроков имеют результат лучше
    # Позиция = количество игроков с лучшим результатом + 1
    better_players_query = (
        select(func.count(distinct(GameResult.player_name)))
        .where(GameResult.score > best_score)
    )
    better_result = await session.execute(better_players_query)
    better_count = better_result.scalar() or 0
    
    position = better_count + 1
    
    return {
        "player_name": player_name,
        "position": position,
        "best_score": best_score,
        "message": f"Вы на {position} месте с результатом {best_score}",
    }
