/**
 * MobileControls — кнопки управления для мобильных устройств.
 * 
 * Показываются только на устройствах с тачскрином (через CSS media query).
 * Кнопки со стрелками для управления змейкой.
 */

import { memo } from 'react';
import styles from './MobileControls.module.css';

/**
 * Компонент мобильного управления.
 */
function MobileControls({ onUp, onDown, onLeft, onRight, onPause }) {
  // Предотвращаем выделение и контекстное меню на кнопках
  const handleTouchStart = (callback) => (e) => {
    e.preventDefault();
    callback();
  };

  return (
    <div className={styles.container}>
      {/* Верхняя кнопка — вверх */}
      <div className={styles.row}>
        <button
          className={styles.button}
          onTouchStart={handleTouchStart(onUp)}
          onMouseDown={onUp}
          aria-label="Вверх"
        >
          ▲
        </button>
      </div>
      
      {/* Средний ряд — влево, пауза, вправо */}
      <div className={styles.row}>
        <button
          className={styles.button}
          onTouchStart={handleTouchStart(onLeft)}
          onMouseDown={onLeft}
          aria-label="Влево"
        >
          ◀
        </button>
        
        <button
          className={`${styles.button} ${styles.pauseButton}`}
          onTouchStart={handleTouchStart(onPause)}
          onMouseDown={onPause}
          aria-label="Пауза"
        >
          ⏸
        </button>
        
        <button
          className={styles.button}
          onTouchStart={handleTouchStart(onRight)}
          onMouseDown={onRight}
          aria-label="Вправо"
        >
          ▶
        </button>
      </div>
      
      {/* Нижняя кнопка — вниз */}
      <div className={styles.row}>
        <button
          className={styles.button}
          onTouchStart={handleTouchStart(onDown)}
          onMouseDown={onDown}
          aria-label="Вниз"
        >
          ▼
        </button>
      </div>
    </div>
  );
}

export default memo(MobileControls);
