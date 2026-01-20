/**
 * Menu — компонент главного меню игры.
 * 
 * Отображает:
 * - Название игры с анимацией
 * - Кнопку "Начать игру"
 * - Информацию об управлении
 * - Ссылку на таблицу лидеров
 */

import { motion } from 'framer-motion';
import styles from './Menu.module.css';

// Анимация для букв заголовка
const letterVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.5,
      ease: 'easeOut',
    },
  }),
};

// Анимация для змейки в логотипе
const snakeVariants = {
  animate: {
    x: [0, 10, 0, -10, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

/**
 * Компонент главного меню.
 */
function Menu({ onStartGame, onShowLeaderboard, highScore }) {
  const title = 'ЗМЕЙКА';
  
  return (
    <motion.div 
      className={styles.menuContainer}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Анимированный заголовок */}
      <div className={styles.titleContainer}>
        <motion.div 
          className={styles.snakeIcon}
          variants={snakeVariants}
          animate="animate"
        >
          🐍
        </motion.div>
        
        <h1 className={styles.title}>
          {title.split('').map((letter, index) => (
            <motion.span
              key={index}
              custom={index}
              variants={letterVariants}
              initial="hidden"
              animate="visible"
              className={styles.letter}
            >
              {letter}
            </motion.span>
          ))}
        </h1>
        
        <motion.p 
          className={styles.subtitle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Классическая аркадная игра
        </motion.p>
      </div>
      
      {/* Рекорд */}
      {highScore > 0 && (
        <motion.div 
          className={styles.highScore}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
        >
          <span className={styles.highScoreLabel}>Лучший результат</span>
          <span className={styles.highScoreValue}>{highScore}</span>
        </motion.div>
      )}
      
      {/* Кнопки */}
      <motion.div 
        className={styles.buttons}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <motion.button
          className={styles.playButton}
          onClick={onStartGame}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className={styles.playIcon}>▶</span>
          Играть
        </motion.button>
        
        <motion.button
          className={`${styles.secondaryButton} secondary`}
          onClick={onShowLeaderboard}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          🏆 Таблица лидеров
        </motion.button>
      </motion.div>
      
      {/* Управление */}
      <motion.div 
        className={styles.controls}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        <h3 className={styles.controlsTitle}>Управление</h3>
        <div className={styles.controlsGrid}>
          <div className={styles.controlItem}>
            <span className={styles.controlKey}>↑↓←→</span>
            <span className={styles.controlLabel}>Движение</span>
          </div>
          <div className={styles.controlItem}>
            <span className={styles.controlKey}>WASD</span>
            <span className={styles.controlLabel}>Альтернатива</span>
          </div>
          <div className={styles.controlItem}>
            <span className={styles.controlKey}>Пробел</span>
            <span className={styles.controlLabel}>Пауза</span>
          </div>
        </div>
      </motion.div>
      
      {/* Подсказка */}
      <motion.p 
        className={styles.hint}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 1, duration: 1 }}
      >
        Нажмите Enter или кнопку "Играть" для начала
      </motion.p>
    </motion.div>
  );
}

export default Menu;
