/**
 * Game — компонент игрового поля.
 * 
 * Отображает:
 * - Сетку игрового поля
 * - Змейку (голова + тело)
 * - Еду (обычную и бонусную)
 * - Счёт и рекорд
 * - Информацию о паузе
 */

import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GAME_STATUS } from '../../hooks/useGame';
import styles from './Game.module.css';

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
}) {
  const isPaused = status === GAME_STATUS.PAUSED;
  
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
                {isHead && (
                  <div className={styles.snakeEyes}>
                    <div className={styles.eye} />
                    <div className={styles.eye} />
                  </div>
                )}
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
        
        {/* Бонусная еда */}
        <AnimatePresence>
          {bonus && (
            <motion.div
              className={styles.bonus}
              style={{
                gridColumn: bonus.x + 1,
                gridRow: bonus.y + 1,
              }}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: 0,
              }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ 
                duration: 0.5,
                repeat: Infinity,
                repeatDelay: 0.3,
              }}
            >
              ⭐
            </motion.div>
          )}
        </AnimatePresence>
        
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
                <span className={styles.pauseHint}>Нажмите Пробел для продолжения</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Подсказки управления */}
      <div className={styles.controls}>
        <span>↑↓←→ или WASD — движение</span>
        <span>Пробел — пауза</span>
      </div>
    </div>
  );
}

// memo — оптимизация, компонент перерисовывается только при изменении props
export default memo(Game);
