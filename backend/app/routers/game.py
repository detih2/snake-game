"""
API роутер для игровых операций.

Что такое роутер?
----------------
Роутер — это группа связанных API эндпоинтов (URL-путей).
Вместо того чтобы писать все эндпоинты в одном файле,
мы разбиваем их по логическим группам:
- /api/game/* — игровые операции (этот файл)
- /api/leaderboard — таблица лидеров

Это делает код организованным и легко поддерживаемым.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_async_session
from ..models import GameResult
from ..schemas import (
    GameResultCreate,
    GameResultResponse,
    PlayerStats,
    MessageResponse,
)

# Создаём роутер с префиксом /api/game
# Все эндпоинты в этом файле будут начинаться с /api/game
router = APIRouter(
    prefix="/api/game",
    tags=["game"],  # Группировка в Swagger документации
)


@router.post(
    "/result",
    response_model=GameResultResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Сохранить результат игры",
    description="Сохраняет результат завершённой игры в базу данных.",
)
async def save_game_result(
    result: GameResultCreate,
    session: AsyncSession = Depends(get_async_session),
) -> GameResultResponse:
    """
    Сохранить результат игры.
    
    Вызывается frontend'ом когда игра заканчивается (Game Over).
    
    Args:
        result: Данные о результате игры (очки, время, статистика)
        session: Сессия базы данных (инжектируется автоматически)
    
    Returns:
        Сохранённый результат с присвоенным ID
    
    Пример запроса:
        POST /api/game/result
        {
            "score": 42,
            "duration": 125.5,
            "max_length": 10,
            "food_eaten": 15,
            "bonuses_eaten": 2
        }
    """
    # Создаём новую запись в базе данных
    db_result = GameResult(
        player_name=result.player_name,
        score=result.score,
        duration=result.duration,
        max_length=result.max_length,
        food_eaten=result.food_eaten,
        bonuses_eaten=result.bonuses_eaten,
    )
    
    # Добавляем в сессию и сохраняем
    session.add(db_result)
    await session.commit()
    
    # Обновляем объект (чтобы получить сгенерированный id и played_at)
    await session.refresh(db_result)
    
    return db_result


@router.get(
    "/stats",
    response_model=PlayerStats,
    summary="Получить статистику игрока",
    description="Возвращает агрегированную статистику по всем играм.",
)
async def get_player_stats(
    player_name: str = "Player",
    session: AsyncSession = Depends(get_async_session),
) -> PlayerStats:
    """
    Получить статистику игрока.
    
    Собирает данные по всем играм конкретного игрока:
    - Лучший результат
    - Средний результат
    - Общее время
    - Всего съедено еды и бонусов
    
    Args:
        player_name: Имя игрока (по умолчанию "Player")
        session: Сессия базы данных
    
    Returns:
        Статистика игрока
    """
    # Запрос с агрегацией (считаем сумму, среднее, максимум)
    query = select(
        func.count(GameResult.id).label("total_games"),
        func.max(GameResult.score).label("best_score"),
        func.avg(GameResult.score).label("average_score"),
        func.sum(GameResult.duration).label("total_time"),
        func.sum(GameResult.food_eaten).label("total_food"),
        func.sum(GameResult.bonuses_eaten).label("total_bonuses"),
        func.max(GameResult.max_length).label("longest_snake"),
    ).where(GameResult.player_name == player_name)
    
    result = await session.execute(query)
    row = result.one_or_none()
    
    # Если игрок ещё не играл — возвращаем пустую статистику
    if row is None or row.total_games == 0:
        return PlayerStats(
            player_name=player_name,
            total_games=0,
            best_score=0,
            average_score=0.0,
            total_time_played=0.0,
            total_food_eaten=0,
            total_bonuses_eaten=0,
            longest_snake=0,
        )
    
    return PlayerStats(
        player_name=player_name,
        total_games=row.total_games or 0,
        best_score=row.best_score or 0,
        average_score=round(row.average_score or 0, 1),
        total_time_played=round(row.total_time or 0, 1),
        total_food_eaten=row.total_food or 0,
        total_bonuses_eaten=row.total_bonuses or 0,
        longest_snake=row.longest_snake or 0,
    )


@router.get(
    "/history",
    response_model=list[GameResultResponse],
    summary="История игр",
    description="Возвращает последние N игр.",
)
async def get_game_history(
    player_name: str = "Player",
    limit: int = 10,
    session: AsyncSession = Depends(get_async_session),
) -> list[GameResultResponse]:
    """
    Получить историю игр.
    
    Args:
        player_name: Имя игрока
        limit: Максимальное количество записей (по умолчанию 10)
        session: Сессия базы данных
    
    Returns:
        Список последних игр (от новых к старым)
    """
    # Ограничиваем limit разумным значением
    limit = min(limit, 100)
    
    query = (
        select(GameResult)
        .where(GameResult.player_name == player_name)
        .order_by(GameResult.played_at.desc())
        .limit(limit)
    )
    
    result = await session.execute(query)
    games = result.scalars().all()
    
    return games


@router.delete(
    "/history",
    response_model=MessageResponse,
    summary="Очистить историю",
    description="Удаляет все результаты игр.",
)
async def clear_history(
    player_name: str = "Player",
    session: AsyncSession = Depends(get_async_session),
) -> MessageResponse:
    """
    Очистить историю игр.
    
    ⚠️ Удаляет ВСЕ результаты игрока. Действие необратимо!
    
    Args:
        player_name: Имя игрока
        session: Сессия базы данных
    
    Returns:
        Сообщение об успехе
    """
    from sqlalchemy import delete
    
    # Удаляем все записи игрока
    query = delete(GameResult).where(GameResult.player_name == player_name)
    result = await session.execute(query)
    await session.commit()
    
    deleted_count = result.rowcount
    
    return MessageResponse(
        message=f"Удалено {deleted_count} записей",
        success=True,
    )
