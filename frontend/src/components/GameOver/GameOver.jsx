/**
 * GameOver — компонент экрана окончания игры.
 */

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import styles from './GameOver.module.css';

/**
 * Форматирование времени из секунд в MM:SS.
 */
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Компонент экрана Game Over.
 */
function GameOver({ 
  score, 
  highScore, 
  stats, 
  onPlayAgain, 
  onGoToMenu,
  onSaveResult,
}) {
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Ref чтобы предотвратить повторное сохранение (StrictMode вызывает useEffect дважды)
  const saveAttemptedRef = useRef(false);
  
  // Вычисляем длительность игры ОДИН раз при монтировании
  const durationRef = useRef(
    stats.startTime ? (Date.now() - stats.startTime) / 1000 : 0
  );
  const duration = durationRef.current;
  
  // Проверяем новый рекорд
  useEffect(() => {
    if (score >= highScore && score > 0) {
      setIsNewHighScore(true);
    }
  }, [score, highScore]);
  
  // Сохраняем результат при монтировании (только один раз!)
  useEffect(() => {
    const saveResult = async () => {
      // Проверяем что ещё не пытались сохранить
      if (saveAttemptedRef.current) return;
      saveAttemptedRef.current = true;
      
      setIsSaving(true);
      try {
        await onSaveResult({
          score,
          duration,
          maxLength: stats.maxLength,
          foodEaten: stats.foodEaten,
          bonusesEaten: stats.bonusesEaten,
        });
        setSaved(true);
      } catch (error) {
        console.error('Ошибка сохранения:', error);
      } finally {
        setIsSaving(false);
      }
    };
    
    saveResult();
  }, [score, duration, stats.maxLength, stats.foodEaten, stats.bonusesEaten, onSaveResult]);
  
  return (
    <motion.div 
      className={styles.container}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
    >
      {/* Заголовок */}
      <motion.div 
        className={styles.header}
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.1, type: 'spring' }}
      >
        <h1 className={styles.title}>GAME OVER</h1>
        <span className={styles.skull}>💀</span>
      </motion.div>
      
      {/* Счёт */}
      <motion.div 
        className={styles.scoreContainer}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring' }}
      >
        <span className={styles.scoreLabel}>Ваш счёт</span>
        <motion.span 
          className={styles.scoreValue}
          animate={isNewHighScore ? { 
            scale: [1, 1.2, 1],
            color: ['#ffffff', '#fbbf24', '#ffffff'],
          } : {}}
          transition={{ duration: 0.5, repeat: isNewHighScore ? Infinity : 0, repeatDelay: 1 }}
        >
          {score}
        </motion.span>
        
        {isNewHighScore && (
          <motion.div 
            className={styles.newRecord}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            🏆 НОВЫЙ РЕКОРД! 🏆
          </motion.div>
        )}
      </motion.div>
      
      {/* Статистика */}
      <motion.div 
        className={styles.stats}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className={styles.statsTitle}>Статистика игры</h3>
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <span className={styles.statIcon}>⏱️</span>
            <span className={styles.statValue}>{formatTime(duration)}</span>
            <span className={styles.statLabel}>Время</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statIcon}>🐍</span>
            <span className={styles.statValue}>{stats.maxLength}</span>
            <span className={styles.statLabel}>Длина</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statIcon}>🍎</span>
            <span className={styles.statValue}>{stats.foodEaten}</span>
            <span className={styles.statLabel}>Еда</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statIcon}>⭐</span>
            <span className={styles.statValue}>{stats.bonusesEaten}</span>
            <span className={styles.statLabel}>Бонусы</span>
          </div>
        </div>
      </motion.div>
      
      {/* Кнопки */}
      <motion.div 
        className={styles.buttons}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <motion.button
          className={styles.playAgainButton}
          onClick={onPlayAgain}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🔄 Играть снова
        </motion.button>
        
        <motion.button
          className="secondary"
          onClick={onGoToMenu}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          🏠 В меню
        </motion.button>
      </motion.div>
      
      {/* Индикатор сохранения */}
      <motion.div 
        className={styles.saveStatus}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {isSaving && <span>💾 Сохранение результата...</span>}
        {saved && <span className={styles.saved}>✅ Результат сохранён</span>}
      </motion.div>
      
      {/* Подсказка */}
      <motion.p 
        className={styles.hint}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 0.6 }}
      >
        Нажмите Enter для новой игры
      </motion.p>
    </motion.div>
  );
}

export default GameOver;
