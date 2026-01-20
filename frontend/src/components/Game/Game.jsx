/**
 * Game — компонент игрового поля.
 * 
 * Отображает:
 * - Сетку игрового поля
 * - Змейку (голова + тело с буквами)
 * - Еду (обычную и бонусную)
 * - Счёт и рекорд
 * - Мобильное управление (на тачскринах)
 */

import { memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GAME_STATUS, BONUS_PHASE } from '../../hooks/useGame';
import MobileControls from '../MobileControls';
import styles from './Game.module.css';

// Секретная фраза, которая появляется на теле змейки
const SECRET_PHRASE = "Тихомиров-гений, самый классный и любимый!";

// Направления для мобильного управления
const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

/**
 * Компонент игрового поля.
 */
function Game({ 
  snake, 
  food, 
  bonus, 
  score, 
  highScore, 
  status, 
  gridSize,
  onPause,
  onChangeDirection,
  playerName,
}) {
  const isPaused = status === GAME_STATUS.PAUSED;
  
  // Определяем фазу бонуса для стилей
  const bonusPhase = bonus?.phase || BONUS_PHASE.SOLID;
  const isBlinking = bonusPhase === BONUS_PHASE.BLINKING;
  
  // Обработчики для мобильного управления
  const handleUp = useCallback(() => onChangeDirection(DIRECTIONS.UP), [onChangeDirection]);
  const handleDown = useCallback(() => onChangeDirection(DIRECTIONS.DOWN), [onChangeDirection]);
  const handleLeft = useCallback(() => onChangeDirection(DIRECTIONS.LEFT), [onChangeDirection]);
  const handleRight = useCallback(() => onChangeDirection(DIRECTIONS.RIGHT), [onChangeDirection]);
  
  return (
    <div className={styles.gameContainer}>
      {/* Панель счёта */}
      <div className={styles.scorePanel}>
        <div className={styles.scoreItem}>
          <span className={styles.scoreLabel}>Счёт</span>
          <motion.span 
            key={score}
            className={styles.scoreValue}
            initial={{ scale: 1.3, color: '#00ff88' }}
            animate={{ scale: 1, color: '#ffffff' }}
            transition={{ duration: 0.2 }}
          >
            {score}
          </motion.span>
        </div>
        <div className={styles.scoreItem}>
          <span className={styles.scoreLabel}>Рекорд</span>
          <span className={styles.scoreValue}>{highScore}</span>
        </div>
        <button 
          className={styles.pauseButton}
          onClick={onPause}
          title="Пауза (Пробел или P)"
        >
          {isPaused ? '▶' : '⏸'}
        </button>
      </div>
      
      {/* Имя игрока */}
      {playerName && (
        <div className={styles.playerName}>
          🎮 {playerName}
        </div>
      )}
      
      {/* Игровое поле */}
      <div 
        className={styles.gameBoard}
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize}, 1fr)`,
        }}
      >
        {/* Сетка фона */}
        {Array.from({ length: gridSize * gridSize }).map((_, index) => (
          <div 
            key={index} 
            className={styles.cell}
          />
        ))}
        
        {/* Змейка */}
        <AnimatePresence>
          {snake.map((segment, index) => {
            const isHead = index === 0;
            const letterIndex = index - 1;
            const letter = !isHead && letterIndex < SECRET_PHRASE.length 
              ? SECRET_PHRASE[letterIndex] 
              : null;
            
            return (
              <motion.div
                key={`snake-${index}`}
                className={`${styles.snakeSegment} ${isHead ? styles.snakeHead : ''}`}
                style={{
                  gridColumn: segment.x + 1,
                  gridRow: segment.y + 1,
                }}
                initial={isHead ? { scale: 0.8 } : false}
                animate={{ scale: 1 }}
                transition={{ duration: 0.1 }}
              >
                {isHead ? (
                  <div className={styles.snakeEyes}>
                    <div className={styles.eye} />
                    <div className={styles.eye} />
                  </div>
                ) : letter ? (
                  <span className={styles.snakeLetter}>{letter}</span>
                ) : null}
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {/* Обычная еда */}
        {food && (
          <motion.div
            className={styles.food}
            style={{
              gridColumn: food.x + 1,
              gridRow: food.y + 1,
            }}
            initial={{ scale: 0 }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ 
              duration: 0.3,
              repeat: Infinity,
              repeatDelay: 0.5,
            }}
          >
            🍎
          </motion.div>
        )}
        
        {/* Бонусная еда с фазами */}
        {bonus && (
          <div
            key={`bonus-${bonus.id}`}
            className={`${styles.bonus} ${isBlinking ? styles.bonusBlinking : ''}`}
            style={{
              gridColumn: bonus.x + 1,
              gridRow: bonus.y + 1,
            }}
          >
            ⭐
            <span className={styles.bonusPoints}>
              +{isBlinking ? 3 : 5}
            </span>
          </div>
        )}
        
        {/* Оверлей паузы */}
        <AnimatePresence>
          {isPaused && (
            <motion.div
              className={styles.pauseOverlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className={styles.pauseContent}>
                <span className={styles.pauseIcon}>⏸</span>
                <span className={styles.pauseText}>ПАУЗА</span>
                <span className={styles.pauseHint}>Нажмите Пробел или кнопку ⏸</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Подсказки управления — скрыты на мобильных */}
      <div className={styles.controls}>
        <span>↑↓←→ или WASD — движение</span>
        <span>Пробел — пауза</span>
      </div>
      
      {/* Мобильное управление — показывается только на тачскринах */}
      <MobileControls
        onUp={handleUp}
        onDown={handleDown}
        onLeft={handleLeft}
        onRight={handleRight}
        onPause={onPause}
      />
    </div>
  );
}

export default memo(Game);
