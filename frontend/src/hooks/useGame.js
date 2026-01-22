/**
 * useGame — кастомный хук с логикой игры "Змейка".
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// === Константы игры ===
const GRID_SIZE = 20;
const INITIAL_SPEED = 150;
const MIN_SPEED = 50;
const SPEED_INCREMENT = 5;
const BONUS_SOLID_DURATION = 5000;    // Фаза 1: 5 сек (5 очков)
const BONUS_BLINKING_DURATION = 5000; // Фаза 2: 5 сек (3 очка)
const BONUS_CHANCE = 0.15;

// Фазы бонуса
export const BONUS_PHASE = {
  SOLID: 'solid',
  BLINKING: 'blinking',
};

// Направления движения
const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

// Статусы игры
export const GAME_STATUS = {
  IDLE: 'idle',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAME_OVER: 'gameOver',
  VICTORY: 'victory',
};

/**
 * Генерирует секретную фразу с именем игрока.
 */
export function getSecretPhrase(playerName) {
  return `${playerName || 'Player'}, лови -20% в Я.Путешествиях! Код: PF-VIGODA-AH37X`;
}

/**
 * Генерирует случайную позицию на поле.
 */
function getRandomPosition(snake, food = null, bonus = null) {
  let position;
  let attempts = 0;
  do {
    position = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    attempts++;
    if (attempts > 1000) break;
  } while (
    snake.some(segment => segment.x === position.x && segment.y === position.y) ||
    (food && food.x === position.x && food.y === position.y) ||
    (bonus && bonus.x === position.x && bonus.y === position.y)
  );
  return position;
}

/**
 * Создаёт начальную змейку в центре поля.
 */
function createInitialSnake() {
  const centerX = Math.floor(GRID_SIZE / 2);
  const centerY = Math.floor(GRID_SIZE / 2);
  return [
    { x: centerX, y: centerY },
    { x: centerX - 1, y: centerY },
    { x: centerX - 2, y: centerY },
  ];
}

/**
 * Главный хук игры.
 * @param {string} playerName - Имя игрока для секретной фразы
 */
export function useGame(playerName = 'Player') {
  // Вычисляем секретную фразу и её длину
  const secretPhrase = getSecretPhrase(playerName);
  const phraseLength = secretPhrase.length;
  // === Состояние игры ===
  const [status, setStatus] = useState(GAME_STATUS.IDLE);
  const [snake, setSnake] = useState(createInitialSnake);
  const [food, setFood] = useState(null);
  const [bonus, setBonus] = useState(null);
  const [direction, setDirection] = useState(DIRECTIONS.RIGHT);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('snakeHighScore');
    return saved ? parseInt(saved, 10) : 0;
  });
  
  const [stats, setStats] = useState({
    foodEaten: 0,
    bonusesEaten: 0,
    maxLength: 3,
    startTime: null,
  });
  
  // Refs для значений которые нужны в gameStep без ре-рендера
  const directionRef = useRef(direction);
  const gameLoopRef = useRef(null);
  const bonusTimerRef = useRef(null);
  const growthRef = useRef(0);
  const phraseLengthRef = useRef(phraseLength);
  
  // Ref для актуальных значений food и bonus (чтобы избежать stale closure)
  const gameStateRef = useRef({ food: null, bonus: null });
  
  // Синхронизируем phraseLength при смене имени
  useEffect(() => {
    phraseLengthRef.current = phraseLength;
  }, [phraseLength]);
  
  // Синхронизируем refs
  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);
  
  useEffect(() => {
    gameStateRef.current.food = food;
  }, [food]);
  
  useEffect(() => {
    gameStateRef.current.bonus = bonus;
  }, [bonus]);
  
  // === Вычисляемая скорость ===
  const speed = Math.max(
    MIN_SPEED,
    INITIAL_SPEED - Math.floor(score / 5) * SPEED_INCREMENT
  );
  
  /**
   * Очистить таймер бонуса.
   */
  const clearBonusTimer = useCallback(() => {
    if (bonusTimerRef.current) {
      clearTimeout(bonusTimerRef.current);
      bonusTimerRef.current = null;
    }
  }, []);
  
  /**
   * Начать новую игру.
   */
  const startGame = useCallback(() => {
    const newSnake = createInitialSnake();
    const newFood = getRandomPosition(newSnake);
    
    clearBonusTimer();
    
    setSnake(newSnake);
    setFood(newFood);
    setBonus(null);
    setDirection(DIRECTIONS.RIGHT);
    directionRef.current = DIRECTIONS.RIGHT;
    gameStateRef.current = { food: newFood, bonus: null };
    growthRef.current = 0;
    setScore(0);
    setStats({
      foodEaten: 0,
      bonusesEaten: 0,
      maxLength: 3,
      startTime: Date.now(),
    });
    setStatus(GAME_STATUS.PLAYING);
  }, [clearBonusTimer]);
  
  /**
   * Поставить игру на паузу.
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
    clearBonusTimer();
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
  }, [clearBonusTimer]);
  
  /**
   * Изменить направление движения.
   * Проверяем противоположное направление по значениям x и y.
   */
  const changeDirection = useCallback((newDirection) => {
    const current = directionRef.current;
    
    // Проверяем противоположное направление по значениям (не по ссылке!)
    const isOpposite = (
      current.x + newDirection.x === 0 && 
      current.y + newDirection.y === 0
    );
    
    if (!isOpposite) {
      setDirection(newDirection);
      directionRef.current = newDirection;
    }
  }, []);
  
  /**
   * Создать бонус.
   */
  const spawnBonus = useCallback((snakePos, foodPos) => {
    clearBonusTimer();
    
    const bonusPosition = getRandomPosition(snakePos, foodPos);
    const newBonus = {
      x: bonusPosition.x,
      y: bonusPosition.y,
      phase: BONUS_PHASE.SOLID,
      id: Date.now(), // Уникальный ID для React key
    };
    
    gameStateRef.current.bonus = newBonus;
    setBonus(newBonus);
    
    // Таймер: через 5 сек переходим в BLINKING
    bonusTimerRef.current = setTimeout(() => {
      setBonus(prev => {
        if (prev && prev.id === newBonus.id) {
          const blinking = { ...prev, phase: BONUS_PHASE.BLINKING };
          gameStateRef.current.bonus = blinking;
          
          // Ещё через 5 сек удаляем
          bonusTimerRef.current = setTimeout(() => {
            gameStateRef.current.bonus = null;
            setBonus(null);
          }, BONUS_BLINKING_DURATION);
          
          return blinking;
        }
        return prev;
      });
    }, BONUS_SOLID_DURATION);
  }, [clearBonusTimer]);
  
  /**
   * Один "тик" игры.
   */
  const gameStep = useCallback(() => {
    setSnake((currentSnake) => {
      const head = currentSnake[0];
      const dir = directionRef.current;
      const newHead = {
        x: head.x + dir.x,
        y: head.y + dir.y,
      };
      
      // Столкновение со стеной
      if (
        newHead.x < 0 ||
        newHead.x >= GRID_SIZE ||
        newHead.y < 0 ||
        newHead.y >= GRID_SIZE
      ) {
        setStatus(GAME_STATUS.GAME_OVER);
        return currentSnake;
      }
      
      // Столкновение с собой
      const bodyToCheck = growthRef.current > 0 ? currentSnake : currentSnake.slice(0, -1);
      if (bodyToCheck.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        setStatus(GAME_STATUS.GAME_OVER);
        return currentSnake;
      }
      
      // Движение змейки
      let newSnake;
      if (growthRef.current > 0) {
        newSnake = [newHead, ...currentSnake];
        growthRef.current--;
      } else {
        newSnake = [newHead, ...currentSnake.slice(0, -1)];
      }
      
      // Проверяем еду
      const currentFood = gameStateRef.current.food;
      if (currentFood && newHead.x === currentFood.x && newHead.y === currentFood.y) {
        growthRef.current += 1;
        setScore(s => s + 1);
        
        const newMaxLength = Math.max(newSnake.length + growthRef.current, 3);
        setStats(st => ({
          ...st,
          foodEaten: st.foodEaten + 1,
          maxLength: Math.max(st.maxLength, newMaxLength),
        }));
        
        // Проверяем победу: голова + все буквы фразы
        const targetLength = phraseLengthRef.current + 1;
        if (newMaxLength >= targetLength) {
          setStatus(GAME_STATUS.VICTORY);
          return newSnake;
        }
        
        const currentBonus = gameStateRef.current.bonus;
        const newFood = getRandomPosition(newSnake, null, currentBonus);
        gameStateRef.current.food = newFood;
        setFood(newFood);
        
        // Шанс спавна бонуса
        if (Math.random() < BONUS_CHANCE && !currentBonus) {
          spawnBonus(newSnake, newFood);
        }
      }
      
      // Проверяем бонус
      const currentBonus = gameStateRef.current.bonus;
      if (currentBonus && newHead.x === currentBonus.x && newHead.y === currentBonus.y) {
        // Определяем очки по фазе
        const points = currentBonus.phase === BONUS_PHASE.SOLID ? 5 : 3;
        
        growthRef.current += points;
        setScore(s => s + points);
        
        const newMaxLength = Math.max(newSnake.length + growthRef.current, 3);
        setStats(st => ({
          ...st,
          bonusesEaten: st.bonusesEaten + 1,
          maxLength: Math.max(st.maxLength, newMaxLength),
        }));
        
        // Удаляем бонус СРАЗУ
        clearBonusTimer();
        gameStateRef.current.bonus = null;
        setBonus(null);
        
        // Проверяем победу
        const targetLength = phraseLengthRef.current + 1;
        if (newMaxLength >= targetLength) {
          setStatus(GAME_STATUS.VICTORY);
          return newSnake;
        }
      }
      
      return newSnake;
    });
  }, [spawnBonus, clearBonusTimer]);
  
  // === Игровой цикл ===
  useEffect(() => {
    if (status === GAME_STATUS.PLAYING) {
      gameLoopRef.current = setInterval(gameStep, speed);
      
      return () => {
        if (gameLoopRef.current) {
          clearInterval(gameLoopRef.current);
          gameLoopRef.current = null;
        }
      };
    }
  }, [status, speed, gameStep]);
  
  // === Обработка клавиатуры ===
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (status !== GAME_STATUS.PLAYING && status !== GAME_STATUS.PAUSED) {
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
  
  return {
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
    secretPhrase,
    startGame,
    togglePause,
    goToMenu,
    changeDirection,
    DIRECTIONS,
    BONUS_PHASE,
  };
}

export default useGame;
