/**
 * PlayerNameInput — компонент для ввода имени игрока перед началом игры.
 * 
 * Сохраняет последнее введённое имя в localStorage,
 * чтобы не вводить заново каждый раз.
 */

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import styles from './PlayerNameInput.module.css';

/**
 * Компонент ввода имени игрока.
 */
function PlayerNameInput({ onSubmit, onCancel }) {
  // Загружаем последнее имя из localStorage
  const [name, setName] = useState(() => {
    return localStorage.getItem('snakePlayerName') || '';
  });
  
  const inputRef = useRef(null);
  
  // Фокус на поле ввода при открытии
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);
  
  // Обработка отправки формы
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Имя по умолчанию если пустое
    const finalName = name.trim() || 'Player';
    
    // Сохраняем в localStorage
    localStorage.setItem('snakePlayerName', finalName);
    
    // Вызываем callback
    onSubmit(finalName);
  };
  
  // Обработка клавиш
  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && onCancel) {
      onCancel();
    }
  };
  
  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className={styles.modal}
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 20 }}
        transition={{ type: 'spring', duration: 0.3 }}
      >
        <div className={styles.header}>
          <span className={styles.icon}>🎮</span>
          <h2 className={styles.title}>Введите ваше имя</h2>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            className={styles.input}
            placeholder="Player"
            maxLength={20}
            autoComplete="off"
          />
          
          <div className={styles.buttons}>
            <motion.button
              type="submit"
              className={styles.submitButton}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ▶ Начать игру
            </motion.button>
            
            {onCancel && (
              <motion.button
                type="button"
                className={styles.cancelButton}
                onClick={onCancel}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Отмена
              </motion.button>
            )}
          </div>
        </form>
        
        <p className={styles.hint}>
          Имя будет отображаться в таблице лидеров
        </p>
      </motion.div>
    </motion.div>
  );
}

export default PlayerNameInput;
