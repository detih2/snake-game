/**
 * App — главный компонент приложения.
 * 
 * Отвечает за:
 * - Управление состоянием игры (меню, игра, game over)
 * - Переключение между экранами
 * - Интеграцию с backend API
 * 
 * Структура экранов:
 * - IDLE: Главное меню
 * - PLAYING/PAUSED: Игровой процесс
 * - GAME_OVER: Экран окончания игры
 * - LEADERBOARD: Таблица лидеров (дополнительный экран)
 */

import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';

// Хуки
import { useGame, GAME_STATUS } from './hooks/useGame';
import { useLeaderboard } from './hooks/useLeaderboard';

// Компоненты
import Menu from './components/Menu';
import Game from './components/Game';
import GameOver from './components/GameOver';
import Leaderboard from './components/Leaderboard';

// Дополнительные экраны (не относятся к GAME_STATUS)
const SCREENS = {
  GAME: 'game',
  LEADERBOARD: 'leaderboard',
};

/**
 * Главный компонент приложения.
 */
function App() {
  // Состояние текущего экрана (для таблицы лидеров)
  const [screen, setScreen] = useState(SCREENS.GAME);
  
  // Хук игровой логики
  const {
    status,
    snake,
    food,
    bonus,
    score,
    highScore,
    gridSize,
    stats,
    startGame,
    togglePause,
    goToMenu,
  } = useGame();
  
  // Хук таблицы лидеров
  const {
    leaderboard,
    loading: leaderboardLoading,
    error: leaderboardError,
    fetchLeaderboard,
    saveResult,
  } = useLeaderboard();
  
  // === Обработчики событий ===
  
  /**
   * Показать таблицу лидеров.
   */
  const showLeaderboard = useCallback(() => {
    setScreen(SCREENS.LEADERBOARD);
  }, []);
  
  /**
   * Вернуться к игре (из таблицы лидеров).
   */
  const backToGame = useCallback(() => {
    setScreen(SCREENS.GAME);
  }, []);
  
  /**
   * Начать игру (из меню или после Game Over).
   */
  const handleStartGame = useCallback(() => {
    setScreen(SCREENS.GAME);
    startGame();
  }, [startGame]);
  
  /**
   * Вернуться в главное меню.
   */
  const handleGoToMenu = useCallback(() => {
    setScreen(SCREENS.GAME);
    goToMenu();
  }, [goToMenu]);
  
  /**
   * Сохранить результат игры.
   */
  const handleSaveResult = useCallback(async (gameResult) => {
    return await saveResult(gameResult);
  }, [saveResult]);
  
  // === Рендеринг ===
  
  // Экран таблицы лидеров
  if (screen === SCREENS.LEADERBOARD) {
    return (
      <Leaderboard
        leaderboard={leaderboard}
        loading={leaderboardLoading}
        error={leaderboardError}
        onFetchLeaderboard={fetchLeaderboard}
        onBack={backToGame}
      />
    );
  }
  
  // Основные экраны игры
  return (
    <AnimatePresence mode="wait">
      {/* Главное меню */}
      {status === GAME_STATUS.IDLE && (
        <Menu
          key="menu"
          onStartGame={handleStartGame}
          onShowLeaderboard={showLeaderboard}
          highScore={highScore}
        />
      )}
      
      {/* Игра (включая паузу) */}
      {(status === GAME_STATUS.PLAYING || status === GAME_STATUS.PAUSED) && (
        <Game
          key="game"
          snake={snake}
          food={food}
          bonus={bonus}
          score={score}
          highScore={highScore}
          status={status}
          gridSize={gridSize}
          onPause={togglePause}
        />
      )}
      
      {/* Game Over */}
      {status === GAME_STATUS.GAME_OVER && (
        <GameOver
          key="gameover"
          score={score}
          highScore={highScore}
          stats={stats}
          onPlayAgain={handleStartGame}
          onGoToMenu={handleGoToMenu}
          onSaveResult={handleSaveResult}
        />
      )}
    </AnimatePresence>
  );
}

export default App;
