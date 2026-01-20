/**
 * useGame — кастомный хук с логикой игры "Змейка".
 * 
 * Что такое хук (Hook)?
 * --------------------
 * Хук — это функция, которая позволяет использовать состояние и другие
 * возможности React без написания классов. Хуки начинаются с "use".
 * 
 * Почему выносим логику в отдельный хук?
 * -------------------------------------
 * 1. Разделение ответственности (логика отдельно от отображения)
 * 2. Можно использовать в разных компонентах
 * 3. Легче тестировать
 * 4. Код компонента становится чище
 * 
 * Как работает игра:
 * -----------------
 * 1. Игровое поле — это сетка ячеек (например 20x20)
 * 2. Змейка — массив координат [{x, y}, {x, y}, ...]
 * 3. Каждый "тик" (например 100ms) змейка двигается на одну ячейку
 * 4. Если голова змейки попадает на еду — она растёт
 * 5. Если голова касается стены или тела — Game Over
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// === Константы игры ===
const GRID_SIZE = 20;        // Размер поля 20x20
const INITIAL_SPEED = 150;   // Начальная скорость (ms между тиками)
const MIN_SPEED = 50;        // Максимальная скорость (минимальная задержка)
const SPEED_INCREMENT = 5;   // На сколько ускоряемся за каждые 5 очков
const BONUS_DURATION = 5000; // Бонус исчезает через 5 секунд
const BONUS_CHANCE = 0.15;   // 15% шанс появления бонуса вместо обычной еды

// Направления движения
const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

// Статусы игры
export const GAME_STATUS = {
  IDLE: 'idle',         // Начальный экран (меню)
  PLAYING: 'playing',   // Игра идёт
  PAUSED: 'paused',     // Пауза
  GAME_OVER: 'gameOver', // Игра окончена
};

/**
 * Генерирует случайную позицию на поле.
 * Проверяет что позиция не занята змейкой.
 */
function getRandomPosition(snake) {
  let position;
  do {
    position = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (snake.some(segment => segment.x === position.x && segment.y === position.y));
  return position;
}

/**
 * Создаёт начальную змейку в центре поля.
 */
function createInitialSnake() {
  const centerX = Math.floor(GRID_SIZE / 2);
  const centerY = Math.floor(GRID_SIZE / 2);
  return [
    { x: centerX, y: centerY },     // Голова
    { x: centerX - 1, y: centerY }, // Тело
    { x: centerX - 2, y: centerY }, // Хвост
  ];
}

/**
 * Главный хук игры.
 */
export function useGame() {
  // === Состояние игры ===
  const [status, setStatus] = useState(GAME_STATUS.IDLE);
  const [snake, setSnake] = useState(createInitialSnake);
  const [food, setFood] = useState(null);
  const [bonus, setBonus] = useState(null);
  const [direction, setDirection] = useState(DIRECTIONS.RIGHT);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    // Загружаем лучший результат из localStorage
    const saved = localStorage.getItem('snakeHighScore');
    return saved ? parseInt(saved, 10) : 0;
  });
  
  // Статистика текущей игры
  const [stats, setStats] = useState({
    foodEaten: 0,
    bonusesEaten: 0,
    maxLength: 3,
    startTime: null,
  });
  
  // Refs для хранения значений, которые не должны вызывать ре-рендер
  const directionRef = useRef(direction);
  const gameLoopRef = useRef(null);
  const bonusTimeoutRef = useRef(null);
  
  // Обновляем ref при изменении direction
  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);
  
  // === Вычисляемая скорость ===
  // Чем больше очков — тем быстрее игра
  const speed = Math.max(
    MIN_SPEED,
    INITIAL_SPEED - Math.floor(score / 5) * SPEED_INCREMENT
  );
  
  // === Функции управления игрой ===
  
  /**
   * Начать новую игру.
   */
  const startGame = useCallback(() => {
    // Сбрасываем всё в начальное состояние
    const newSnake = createInitialSnake();
    setSnake(newSnake);
    setFood(getRandomPosition(newSnake));
    setBonus(null);
    setDirection(DIRECTIONS.RIGHT);
    directionRef.current = DIRECTIONS.RIGHT;
    setScore(0);
    setStats({
      foodEaten: 0,
      bonusesEaten: 0,
      maxLength: 3,
      startTime: Date.now(),
    });
    setStatus(GAME_STATUS.PLAYING);
    
    // Очищаем таймер бонуса если был
    if (bonusTimeoutRef.current) {
      clearTimeout(bonusTimeoutRef.current);
    }
  }, []);
  
  /**
   * Поставить игру на паузу / снять с паузы.
   */
  const togglePause = useCallback(() => {
    if (status === GAME_STATUS.PLAYING) {
      setStatus(GAME_STATUS.PAUSED);
    } else if (status === GAME_STATUS.PAUSED) {
      setStatus(GAME_STATUS.PLAYING);
    }
  }, [status]);
  
  /**
   * Вернуться в главное меню.
   */
  const goToMenu = useCallback(() => {
    setStatus(GAME_STATUS.IDLE);
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }
    if (bonusTimeoutRef.current) {
      clearTimeout(bonusTimeoutRef.current);
    }
  }, []);
  
  /**
   * Изменить направление движения.
   * Проверяет что нельзя развернуться на 180°.
   */
  const changeDirection = useCallback((newDirection) => {
    const current = directionRef.current;
    
    // Нельзя развернуться на 180°
    // Например, если едем вправо — нельзя сразу влево
    const isOpposite = (
      (current === DIRECTIONS.UP && newDirection === DIRECTIONS.DOWN) ||
      (current === DIRECTIONS.DOWN && newDirection === DIRECTIONS.UP) ||
      (current === DIRECTIONS.LEFT && newDirection === DIRECTIONS.RIGHT) ||
      (current === DIRECTIONS.RIGHT && newDirection === DIRECTIONS.LEFT)
    );
    
    if (!isOpposite) {
      setDirection(newDirection);
    }
  }, []);
  
  /**
   * Создать бонусную еду.
   */
  const spawnBonus = useCallback((currentSnake) => {
    const bonusPosition = getRandomPosition(currentSnake);
    setBonus(bonusPosition);
    
    // Бонус исчезает через BONUS_DURATION
    bonusTimeoutRef.current = setTimeout(() => {
      setBonus(null);
    }, BONUS_DURATION);
  }, []);
  
  /**
   * Один "тик" игры — движение змейки.
   */
  const gameStep = useCallback(() => {
    setSnake((currentSnake) => {
      // Вычисляем новую позицию головы
      const head = currentSnake[0];
      const dir = directionRef.current;
      const newHead = {
        x: head.x + dir.x,
        y: head.y + dir.y,
      };
      
      // === Проверка столкновений ===
      
      // 1. Столкновение со стеной
      if (
        newHead.x < 0 ||
        newHead.x >= GRID_SIZE ||
        newHead.y < 0 ||
        newHead.y >= GRID_SIZE
      ) {
        setStatus(GAME_STATUS.GAME_OVER);
        return currentSnake;
      }
      
      // 2. Столкновение с собой
      if (currentSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        setStatus(GAME_STATUS.GAME_OVER);
        return currentSnake;
      }
      
      // === Движение ===
      // Создаём новую змейку: новая голова + старое тело (без хвоста)
      const newSnake = [newHead, ...currentSnake.slice(0, -1)];
      
      // === Проверка поедания еды ===
      setFood((currentFood) => {
        if (currentFood && newHead.x === currentFood.x && newHead.y === currentFood.y) {
          // Съели обычную еду!
          setScore((s) => s + 1);
          setStats((st) => ({
            ...st,
            foodEaten: st.foodEaten + 1,
            maxLength: Math.max(st.maxLength, newSnake.length + 1),
          }));
          
          // Добавляем хвост обратно (змейка растёт)
          newSnake.push(currentSnake[currentSnake.length - 1]);
          
          // С шансом BONUS_CHANCE появляется бонус
          if (Math.random() < BONUS_CHANCE && !bonus) {
            spawnBonus(newSnake);
          }
          
          // Генерируем новую еду
          return getRandomPosition(newSnake);
        }
        return currentFood;
      });
      
      // === Проверка поедания бонуса ===
      setBonus((currentBonus) => {
        if (currentBonus && newHead.x === currentBonus.x && newHead.y === currentBonus.y) {
          // Съели бонус!
          setScore((s) => s + 3);
          setStats((st) => ({
            ...st,
            bonusesEaten: st.bonusesEaten + 1,
            maxLength: Math.max(st.maxLength, newSnake.length + 3),
          }));
          
          // Змейка растёт на 3 сегмента
          for (let i = 0; i < 3; i++) {
            newSnake.push(currentSnake[currentSnake.length - 1]);
          }
          
          // Очищаем таймер бонуса
          if (bonusTimeoutRef.current) {
            clearTimeout(bonusTimeoutRef.current);
          }
          
          return null;
        }
        return currentBonus;
      });
      
      return newSnake;
    });
  }, [bonus, spawnBonus]);
  
  // === Игровой цикл ===
  useEffect(() => {
    if (status === GAME_STATUS.PLAYING) {
      // Запускаем интервал
      gameLoopRef.current = setInterval(gameStep, speed);
      
      return () => {
        clearInterval(gameLoopRef.current);
      };
    }
  }, [status, speed, gameStep]);
  
  // === Обработка клавиатуры ===
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Управление только во время игры или паузы
      if (status !== GAME_STATUS.PLAYING && status !== GAME_STATUS.PAUSED) {
        // Enter на экране меню или Game Over — начать игру
        if (e.key === 'Enter') {
          startGame();
        }
        return;
      }
      
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          changeDirection(DIRECTIONS.UP);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          changeDirection(DIRECTIONS.DOWN);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          changeDirection(DIRECTIONS.LEFT);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          changeDirection(DIRECTIONS.RIGHT);
          break;
        case ' ':
        case 'p':
        case 'P':
        case 'Escape':
          e.preventDefault();
          togglePause();
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, changeDirection, togglePause, startGame]);
  
  // === Обновление рекорда ===
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('snakeHighScore', score.toString());
    }
  }, [score, highScore]);
  
  // === Возвращаем состояние и функции ===
  return {
    // Состояние
    status,
    snake,
    food,
    bonus,
    score,
    highScore,
    speed,
    gridSize: GRID_SIZE,
    stats,
    direction,
    
    // Функции
    startGame,
    togglePause,
    goToMenu,
    changeDirection,
    
    // Константы для отображения
    DIRECTIONS,
  };
}

export default useGame;
