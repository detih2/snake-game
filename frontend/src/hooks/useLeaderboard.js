/**
 * useLeaderboard — хук для работы с таблицей лидеров.
 * 
 * Отвечает за:
 * - Загрузку таблицы лидеров с сервера
 * - Сохранение результатов игры
 * - Кэширование данных
 */

import { useState, useCallback } from 'react';
import { getLeaderboard, saveGameResult, getPlayerStats } from '../services/api';

/**
 * Хук для работы с таблицей лидеров.
 */
export function useLeaderboard() {
  const [leaderboard, setLeaderboard] = useState(null);
  const [playerStats, setPlayerStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  /**
   * Загрузить таблицу лидеров.
   * 
   * @param {number} limit - количество записей
   */
  const fetchLeaderboard = useCallback(async (limit = 10) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getLeaderboard(limit);
      setLeaderboard(data);
    } catch (err) {
      console.error('Ошибка загрузки таблицы лидеров:', err);
      setError('Не удалось загрузить таблицу лидеров');
      // Возвращаем пустые данные при ошибке (сервер может быть недоступен)
      setLeaderboard({
        entries: [],
        total_games: 0,
        total_players: 0,
      });
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * Загрузить статистику игрока.
   * 
   * @param {string} playerName - имя игрока
   */
  const fetchPlayerStats = useCallback(async (playerName = 'Player') => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getPlayerStats(playerName);
      setPlayerStats(data);
    } catch (err) {
      console.error('Ошибка загрузки статистики:', err);
      setError('Не удалось загрузить статистику');
      setPlayerStats(null);
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * Сохранить результат игры.
   * 
   * @param {Object} gameResult - результат игры
   * @returns {Promise<Object|null>} - сохранённый результат или null при ошибке
   */
  const saveResult = useCallback(async (gameResult) => {
    setError(null);
    
    try {
      const saved = await saveGameResult(gameResult);
      // После сохранения обновляем таблицу лидеров
      await fetchLeaderboard();
      return saved;
    } catch (err) {
      console.error('Ошибка сохранения результата:', err);
      setError('Не удалось сохранить результат');
      // Не выбрасываем ошибку — игра должна работать даже без сервера
      return null;
    }
  }, [fetchLeaderboard]);
  
  return {
    // Данные
    leaderboard,
    playerStats,
    loading,
    error,
    
    // Функции
    fetchLeaderboard,
    fetchPlayerStats,
    saveResult,
  };
}

export default useLeaderboard;
