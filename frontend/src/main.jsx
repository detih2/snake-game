/**
 * Точка входа React приложения.
 * 
 * Что здесь происходит?
 * --------------------
 * 1. Импортируем React и ReactDOM
 * 2. Импортируем главный компонент App
 * 3. Импортируем глобальные стили
 * 4. "Монтируем" React в DOM-элемент с id="root"
 * 
 * StrictMode — это инструмент разработчика, который:
 * - Предупреждает о потенциальных проблемах
 * - Проверяет что компоненты "чистые" (не имеют побочных эффектов)
 * - В production он автоматически отключается
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/index.css'

// Находим DOM-элемент и "монтируем" в него React
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
