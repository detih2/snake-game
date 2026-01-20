/**
 * Leaderboard — компонент таблицы лидеров.
 * 
 * Отображает:
 * - Топ игроков по очкам
 * - Общую статистику (всего игр, игроков)
 * - Кнопку возврата в меню
 */

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import styles from './Leaderboard.module.css';

/**
 * Форматирование даты.
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Иконка для места в рейтинге.
 */
function RankIcon({ rank }) {
  switch (rank) {
    case 1:
      return <span className={styles.gold}>🥇</span>;
    case 2:
      return <span className={styles.silver}>🥈</span>;
    case 3:
      return <span className={styles.bronze}>🥉</span>;
    default:
      return <span className={styles.rankNumber}>{rank}</span>;
  }
}

/**
 * Компонент таблицы лидеров.
 */
function Leaderboard({ 
  leaderboard, 
  loading, 
  error, 
  onFetchLeaderboard,
  onBack,
}) {
  // Загружаем данные при монтировании
  useEffect(() => {
    onFetchLeaderboard();
  }, [onFetchLeaderboard]);
  
  return (
    <motion.div 
      className={styles.container}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {/* Заголовок */}
      <div className={styles.header}>
        <h1 className={styles.title}>
          <span className={styles.trophy}>🏆</span>
          Таблица лидеров
        </h1>
      </div>
      
      {/* Контент */}
      <div className={styles.content}>
        {/* Загрузка */}
        {loading && (
          <div className={styles.loading}>
            <span className={styles.spinner}>⏳</span>
            <span>Загрузка...</span>
          </div>
        )}
        
        {/* Ошибка */}
        {error && (
          <div className={styles.error}>
            <span>⚠️</span>
            <span>{error}</span>
            <button onClick={onFetchLeaderboard}>Повторить</button>
          </div>
        )}
        
        {/* Пустой список */}
        {!loading && !error && leaderboard?.entries?.length === 0 && (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🎮</span>
            <span>Пока нет результатов</span>
            <span className={styles.emptyHint}>Будьте первым!</span>
          </div>
        )}
        
        {/* Таблица */}
        {!loading && leaderboard?.entries?.length > 0 && (
          <motion.div className={styles.table}>
            {/* Заголовок таблицы */}
            <div className={styles.tableHeader}>
              <span className={styles.colRank}>#</span>
              <span className={styles.colName}>Игрок</span>
              <span className={styles.colScore}>Очки</span>
              <span className={styles.colDate}>Дата</span>
            </div>
            
            {/* Строки таблицы */}
            {leaderboard.entries.map((entry, index) => (
              <motion.div
                key={`${entry.player_name}-${entry.score}-${index}`}
                className={`${styles.tableRow} ${index < 3 ? styles.topThree : ''}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <span className={styles.colRank}>
                  <RankIcon rank={entry.rank} />
                </span>
                <span className={styles.colName}>
                  {entry.player_name}
                </span>
                <span className={styles.colScore}>
                  {entry.score}
                </span>
                <span className={styles.colDate}>
                  {formatDate(entry.played_at)}
                </span>
              </motion.div>
            ))}
          </motion.div>
        )}
        
        {/* Общая статистика */}
        {leaderboard && (
          <div className={styles.globalStats}>
            <div className={styles.stat}>
              <span className={styles.statValue}>{leaderboard.total_games}</span>
              <span className={styles.statLabel}>Всего игр</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{leaderboard.total_players}</span>
              <span className={styles.statLabel}>Игроков</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Кнопка назад */}
      <motion.button
        className="secondary"
        onClick={onBack}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        ← Назад в меню
      </motion.button>
    </motion.div>
  );
}

export default Leaderboard;
