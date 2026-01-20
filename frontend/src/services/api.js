/**
 * API клиент для общения с backend.
 * 
 * Что это?
 * -------
 * Этот файл содержит функции для отправки HTTP-запросов к нашему backend API.
 * Вместо того чтобы писать fetch() в каждом компоненте, мы создаём
 * централизованные функции.
 * 
 * Преимущества:
 * 1. Код не дублируется
 * 2. Легко менять базовый URL
 * 3. Единая обработка ошибок
 * 4. Удобно тестировать
 */

// Базовый URL API
// В development: запросы проксируются через Vite (см. vite.config.js)
// В production: используем переменную окружения VITE_API_URL
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Базовая функция для HTTP запросов.
 * 
 * @param {string} endpoint - путь к эндпоинту (например, '/game/result')
 * @param {Object} options - настройки fetch (method, body, etc.)
 * @returns {Promise<any>} - распарсенный JSON ответ
 * @throws {Error} - если запрос не удался
 */
async function fetchApi(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Настройки по умолчанию
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  // Объединяем настройки
  const finalOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };
  
  try {
    const response = await fetch(url, finalOptions);
    
    // Проверяем статус ответа
    if (!response.ok) {
      // Пытаемся получить сообщение об ошибке из ответа
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }
    
    // Парсим JSON
    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

// ===================================
// GAME API — операции с играми
// ===================================

/**
 * Сохранить результат игры.
 * 
 * Вызывается после Game Over.
 * 
 * @param {Object} gameResult - результат игры
 * @param {number} gameResult.score - набранные очки
 * @param {number} gameResult.duration - длительность игры в секундах
 * @param {number} gameResult.maxLength - максимальная длина змейки
 * @param {number} gameResult.foodEaten - количество съеденной еды
 * @param {number} gameResult.bonusesEaten - количество съеденных бонусов
 * @returns {Promise<Object>} - сохранённый результат с ID
 */
export async function saveGameResult(gameResult) {
  return fetchApi('/game/result', {
    method: 'POST',
    body: JSON.stringify({
      player_name: gameResult.playerName || 'Player',
      score: gameResult.score,
      duration: gameResult.duration,
      max_length: gameResult.maxLength,
      food_eaten: gameResult.foodEaten,
      bonuses_eaten: gameResult.bonusesEaten,
    }),
  });
}

/**
 * Получить статистику игрока.
 * 
 * @param {string} playerName - имя игрока (по умолчанию 'Player')
 * @returns {Promise<Object>} - статистика игрока
 */
export async function getPlayerStats(playerName = 'Player') {
  return fetchApi(`/game/stats?player_name=${encodeURIComponent(playerName)}`);
}

/**
 * Получить историю игр.
 * 
 * @param {string} playerName - имя игрока
 * @param {number} limit - максимальное количество записей
 * @returns {Promise<Array>} - список последних игр
 */
export async function getGameHistory(playerName = 'Player', limit = 10) {
  return fetchApi(`/game/history?player_name=${encodeURIComponent(playerName)}&limit=${limit}`);
}

// ===================================
// LEADERBOARD API — таблица лидеров
// ===================================

/**
 * Получить таблицу лидеров.
 * 
 * @param {number} limit - количество записей (по умолчанию 10)
 * @returns {Promise<Object>} - таблица лидеров
 */
export async function getLeaderboard(limit = 10) {
  return fetchApi(`/leaderboard?limit=${limit}`);
}

/**
 * Узнать позицию игрока в рейтинге.
 * 
 * @param {string} playerName - имя игрока
 * @returns {Promise<Object>} - позиция и лучший результат
 */
export async function getPlayerPosition(playerName = 'Player') {
  return fetchApi(`/leaderboard/position?player_name=${encodeURIComponent(playerName)}`);
}

// ===================================
// HEALTH API — проверка сервиса
// ===================================

/**
 * Проверить что backend работает.
 * 
 * @returns {Promise<Object>} - статус сервиса
 */
export async function checkHealth() {
  return fetchApi('/health');
}

// Экспортируем всё как объект (для удобства импорта)
export default {
  saveGameResult,
  getPlayerStats,
  getGameHistory,
  getLeaderboard,
  getPlayerPosition,
  checkHealth,
};
