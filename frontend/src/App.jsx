/**
 * App — главный компонент приложения.
 * 
 * Отвечает за:
 * - Управление состоянием игры (меню, игра, game over)
 * - Переключение между экранами
 * - Хранение имени игрока
 * - Интеграцию с backend API
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
import PlayerNameInput from './components/PlayerNameInput';

// Дополнительные экраны
const SCREENS = {
  GAME: 'game',
  LEADERBOARD: 'leaderboard',
};

/**
 * Главный компонент приложения.
 */
function App() {
  // Состояние текущего экрана
  const [screen, setScreen] = useState(SCREENS.GAME);
  
  // Показывать ли окно ввода имени
  const [showNameInput, setShowNameInput] = useState(false);
  
  // Имя игрока (загружаем из localStorage)
  const [playerName, setPlayerName] = useState(() => {
    return localStorage.getItem('snakePlayerName') || 'Player';
  });
  
  // Хук игровой логики — передаём имя игрока для секретной фразы
  const {
    status,
    snake,
    food,
    bonus,
    score,
    highScore,
    gridSize,
    stats,
    secretPhrase,
    startGame,
    togglePause,
    goToMenu,
    changeDirection,
  } = useGame(playerName);
  
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
   * Вернуться к игре.
   */
  const backToGame = useCallback(() => {
    setScreen(SCREENS.GAME);
  }, []);
  
  /**
   * Показать окно ввода имени перед игрой.
   */
  const handlePlayClick = useCallback(() => {
    setShowNameInput(true);
  }, []);
  
  /**
   * Начать игру после ввода имени.
   */
  const handleNameSubmit = useCallback((name) => {
    setPlayerName(name);
    setShowNameInput(false);
    setScreen(SCREENS.GAME);
    startGame();
  }, [startGame]);
  
  /**
   * Отмена ввода имени.
   */
  const handleNameCancel = useCallback(() => {
    setShowNameInput(false);
  }, []);
  
  /**
   * Начать игру заново (после Game Over) — без ввода имени.
   */
  const handlePlayAgain = useCallback(() => {
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
    return await saveResult({
      ...gameResult,
      playerName: playerName,
    });
  }, [saveResult, playerName]);
  
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
    <>
      <AnimatePresence mode="wait">
        {/* Главное меню */}
        {status === GAME_STATUS.IDLE && (
          <Menu
            key="menu"
            onStartGame={handlePlayClick}
            onShowLeaderboard={showLeaderboard}
            highScore={highScore}
            playerName={playerName}
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
            onChangeDirection={changeDirection}
            playerName={playerName}
            secretPhrase={secretPhrase}
          />
        )}
        
        {/* Game Over или Victory */}
        {(status === GAME_STATUS.GAME_OVER || status === GAME_STATUS.VICTORY) && (
          <GameOver
            key="gameover"
            score={score}
            highScore={highScore}
            stats={stats}
            playerName={playerName}
            secretPhrase={secretPhrase}
            revealedLength={snake.length - 1}
            isVictory={status === GAME_STATUS.VICTORY}
            onPlayAgain={handlePlayAgain}
            onGoToMenu={handleGoToMenu}
            onSaveResult={handleSaveResult}
          />
        )}
      </AnimatePresence>
      
      {/* Модальное окно ввода имени */}
      <AnimatePresence>
        {showNameInput && (
          <PlayerNameInput
            key="name-input"
            onSubmit={handleNameSubmit}
            onCancel={handleNameCancel}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default App;
