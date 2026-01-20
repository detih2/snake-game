/**
 * Конфигурация Vite — сборщика проекта.
 * 
 * Что такое Vite?
 * --------------
 * Vite (произносится "вит", от франц. "быстрый") — это современный сборщик
 * для frontend проектов. Он намного быстрее чем Webpack или Create React App.
 * 
 * Почему Vite, а не Create React App?
 * ----------------------------------
 * 1. Мгновенный запуск dev-сервера (не нужно ждать сборку)
 * 2. Горячая перезагрузка за миллисекунды
 * 3. Оптимизированная сборка для production
 * 4. Минимальная конфигурация
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Плагин для поддержки React (JSX, Fast Refresh)
  plugins: [react()],
  
  // Настройки dev-сервера
  server: {
    port: 5173,      // Порт (http://localhost:5173)
    open: true,      // Автоматически открыть браузер при запуске
    
    // Проксирование запросов к backend
    // Когда frontend делает запрос на /api/*, он перенаправляется на backend
    // Это решает проблему CORS при разработке
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  
  // Настройки сборки для production
  build: {
    outDir: 'dist',        // Куда складывать собранные файлы
    sourcemap: false,      // Не создавать sourcemap (уменьшает размер)
  },
})
