"""
API роутер для таблицы лидеров.

Таблица лидеров показывает 10 лучших результатов за все время.
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
    description="Возвращает TOP-10 лучших результатов за всё время.",
)
async def get_leaderboard(
    limit: int = None,
    session: AsyncSession = Depends(get_async_session),
) -> LeaderboardResponse:
    """
    Получить таблицу лидеров.
    
    Возвращает TOP-N лучших результатов за всё время (без группировки по игроку).
    Один игрок может появляться несколько раз если у него несколько хороших игр.
    
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
    
    # Просто берём TOP-N по очкам (без группировки)
    query = (
        select(GameResult)
        .order_by(GameResult.score.desc())
        .limit(limit)
    )
    
    result = await session.execute(query)
    games = result.scalars().all()
    
    # Формируем записи таблицы лидеров с рангом (местом)
    entries = [
        LeaderboardEntry(
            rank=idx + 1,
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
    
    # Считаем сколько результатов лучше
    better_results_query = (
        select(func.count(GameResult.id))
        .where(GameResult.score > best_score)
    )
    better_result = await session.execute(better_results_query)
    better_count = better_result.scalar() or 0
    
    position = better_count + 1
    
    return {
        "player_name": player_name,
        "position": position,
        "best_score": best_score,
        "message": f"Вы на {position} месте с результатом {best_score}",
    }
