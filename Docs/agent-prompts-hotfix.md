# Промпт для агента: Hotfix змейки

## Контекст

Ты — AI-агент в Cursor IDE. Твоя задача: исправить две проблемы в игре Snake Promo.

**Проект:** Браузерная игра "Змейка" с промокодом на теле змейки.
- **Frontend:** React + Vite (`frontend/`)
- **Backend:** Python + FastAPI + PostgreSQL (`backend/`)

---

## ⚠️ ОБЯЗАТЕЛЬНО СНАЧАЛА

**Прежде чем писать код — изучи проект:**
1. Прочитай `.cursorrules` — запомни правила кодирования.
2. Изучи `frontend/src/hooks/useGame.js` — основная логика игры.
3. Изучи `frontend/src/components/GameOver/GameOver.jsx` — экран окончания игры.
4. Изучи `backend/app/routers/leaderboard.py` — API лидерборда.
5. Проверь консоль браузера и логи бэкенда на ошибки.
6. **Только после этого приступай к исправлениям!**

---

## Проблема 1: Увеличить частоту появления бонусов

### Текущее поведение
Бонусные звёздочки появляются редко (случайно, с низкой вероятностью).

### Ожидаемое поведение
Бонусные звёздочки должны появляться **после каждых 2 съеденных обычных еды**.

Логика:
- Игрок съедает 1-ю обычную еду → ничего
- Игрок съедает 2-ю обычную еду → появляется бонусная звёздочка
- Игрок съедает 3-ю обычную еду → ничего
- Игрок съедает 4-ю обычную еду → появляется бонусная звёздочка
- И так далее...

### Где искать
- `frontend/src/hooks/useGame.js` — функция `spawnBonus` и логика появления бонусов

### Как исправить
1. Добавь счётчик съеденной обычной еды (например, `foodEatenCountRef`).
2. При съедании обычной еды увеличивай счётчик.
3. Если счётчик кратен 2 (`foodEatenCount % 2 === 0`), вызывай `spawnBonus()`.
4. При старте новой игры сбрасывай счётчик в 0.

### Проверка
- [ ] После 2 обычных еды появляется звёздочка
- [ ] После 4 обычных еды появляется звёздочка
- [ ] Звёздочка работает как раньше (5 сек +5 очков, 5 сек мигание +3 очка)

---

## Проблема 2: Исправить страницу рекордов (лидерборд)

### Текущее поведение
Страница рекордов не работает / не загружается / показывает ошибку.

### Ожидаемое поведение
- Таблица лидеров показывает TOP-10 лучших результатов
- Результаты сохраняются после игры
- Данные хранятся в PostgreSQL на Render.com

### Где искать
1. **Frontend:**
   - `frontend/src/hooks/useLeaderboard.js` — хук для работы с лидербордом
   - `frontend/src/components/Leaderboard/Leaderboard.jsx` — компонент отображения
   - `frontend/src/components/GameOver/GameOver.jsx` — сохранение результата
   - `frontend/src/services/api.js` — API клиент (проверь URL бэкенда)

2. **Backend:**
   - `backend/app/routers/leaderboard.py` — API эндпоинты
   - `backend/app/routers/game.py` — сохранение результатов
   - `backend/app/database.py` — подключение к БД
   - `backend/settings.py` — настройки (DB_URL)

### Как диагностировать
1. Открой консоль браузера (F12 → Console) — есть ли ошибки?
2. Открой Network tab — какой статус у запросов к `/api/leaderboard`?
3. Проверь URL бэкенда в `frontend/src/services/api.js`:
   ```javascript
   const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
   ```
4. Проверь, работает ли бэкенд: https://snake-game-api-alar.onrender.com/api/health
5. Проверь логи бэкенда на Render.com

### Возможные причины и решения

**A. Бэкенд "уснул" (Render Free Tier)**
- Render.com усыпляет бесплатные сервисы после 15 минут неактивности
- Первый запрос может занять 30-60 секунд
- Решение: добавить loading state и retry логику

**B. CORS ошибка**
- Проверь `backend/app/main.py` — разрешён ли origin фронтенда
- Решение: добавить URL фронтенда в `cors_origins` в `backend/settings.py`

**C. База данных не подключена**
- Проверь переменную `DB_URL` на Render.com
- Решение: убедись, что PostgreSQL сервис связан с бэкендом

**D. Ошибка в коде сохранения**
- Проверь `frontend/src/components/GameOver/GameOver.jsx` — вызывается ли `onSaveResult`?
- Проверь `frontend/src/hooks/useLeaderboard.js` — функция `saveResult`

### Проверка
- [ ] Страница лидерборда открывается без ошибок
- [ ] После игры результат сохраняется
- [ ] Результат появляется в таблице лидеров
- [ ] При обновлении страницы результаты не пропадают

---

## Твоя зона ответственности

**Файлы для редактирования:**
- `frontend/src/hooks/useGame.js`
- `frontend/src/hooks/useLeaderboard.js`
- `frontend/src/components/GameOver/GameOver.jsx`
- `frontend/src/services/api.js`
- `backend/app/routers/leaderboard.py` (если нужно)
- `backend/app/routers/game.py` (если нужно)
- `backend/settings.py` (если нужно)

**НЕ ТРОГАЙ:**
- `landing/`
- `marketing/`
- `Docs/` (кроме changelog)

---

## После исправлений

1. Протестируй локально:
   ```bash
   # Backend
   cd backend && source .venv/bin/activate && uvicorn app.main:app --reload --port 8000
   
   # Frontend
   cd frontend && npm run dev
   ```

2. Проверь в браузере:
   - Бонусы появляются каждые 2 еды
   - Лидерборд загружается
   - Результаты сохраняются

3. Задеплой:
   ```bash
   # Frontend
   cd frontend && npm run build && npx vercel --prod
   
   # Backend (если менял) — автодеплой через git push
   ```

4. Создай changelog в `Docs/changelogs/hotfix-bonus-leaderboard.md`

---

## Definition of Done

- [ ] Бонусы появляются после каждых 2 обычных еды
- [ ] Лидерборд работает (загружается, сохраняет, отображает)
- [ ] Нет ошибок в консоли браузера
- [ ] Нет ошибок в логах бэкенда
- [ ] Код задеплоен
- [ ] Changelog написан
