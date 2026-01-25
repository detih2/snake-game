# 🐍 Snake Promo — Лендинг

Продающий лендинг для сервиса геймифицированных промокодов.

## 📁 Структура

```
landing/
├── index.html    # Главная страница
├── styles.css    # Стили (mobile-first)
└── README.md     # Документация
```

## 🚀 Как открыть локально

### Вариант 1: Просто открыть файл
```bash
# macOS
open landing/index.html

# Windows
start landing/index.html

# Linux
xdg-open landing/index.html
```

### Вариант 2: Локальный сервер (рекомендуется)
```bash
# С Python 3
cd landing
python -m http.server 8080

# С Node.js (npx)
cd landing
npx serve

# С PHP
cd landing
php -S localhost:8080
```

Откройте http://localhost:8080 в браузере.

## 🌐 Деплой на Vercel

### Через CLI

1. Установите Vercel CLI:
```bash
npm i -g vercel
```

2. Задеплойте папку landing:
```bash
cd landing
vercel
```

3. Для продакшена:
```bash
vercel --prod
```

### Через GitHub

1. Запушьте код в GitHub репозиторий
2. Зайдите на [vercel.com](https://vercel.com)
3. Нажмите "New Project"
4. Импортируйте репозиторий
5. В настройках укажите:
   - **Root Directory:** `landing`
   - **Framework Preset:** Other
6. Нажмите "Deploy"

## 📝 Как подключить Tally форму

1. Зайдите на [tally.so](https://tally.so) и создайте форму
2. Нажмите "Share" → "Embed"
3. Скопируйте ID формы из URL (например, `wQ9JMb`)
4. В `index.html` найдите секцию с `id="tally-form"`
5. Замените placeholder на iframe:

```html
<iframe 
    data-tally-src="https://tally.so/embed/ВАШ_FORM_ID?alignLeft=1&hideTitle=1&transparentBackground=1"
    loading="lazy"
    width="100%"
    height="400"
    frameborder="0"
    marginheight="0"
    marginwidth="0"
    title="Заявка Snake Promo"
></iframe>
<script>
    var d=document,w="https://tally.so/widgets/embed.js",v=function(){"undefined"!=typeof Tally?Tally.loadEmbeds():d.querySelectorAll("iframe[data-tally-src]:not([src])").forEach((function(e){e.src=e.dataset.tallySrc}))};if(d.querySelector('script[src="'+w+'"]'))v();else{var s=d.createElement("script");s.src=w,s.onload=v,s.onerror=v,d.body.appendChild(s)}
</script>
```

## 🎨 Кастомизация

### Цвета
Все цвета определены в CSS переменных в начале `styles.css`:

```css
:root {
    --color-bg: #0a0a0f;           /* Фон */
    --color-accent: #00ff88;       /* Неоновый зелёный */
    --color-secondary: #fbbf24;    /* Золотой */
    --color-text: #ffffff;         /* Текст */
    --color-text-muted: #9ca3af;   /* Приглушённый текст */
}
```

### Контакты
Обновите контакты в footer секции `index.html`:
- Telegram: `@snake_promo`
- Email: `hello@snakepromo.ru`

### SEO
Обновите мета-теги в `<head>`:
- `og:url` — URL вашего сайта
- `og:image` — Ссылка на OG-изображение

## ✅ Чеклист перед запуском

- [ ] Подключена Tally форма
- [ ] Обновлены контакты (Telegram, Email)
- [ ] Добавлено OG-изображение
- [ ] Проверена адаптивность на мобильных
- [ ] Протестированы все ссылки
- [ ] Lighthouse Performance > 90

## 📊 Секции лендинга

1. **Hero** — Главный экран с CTA
2. **Как это работает** — 3 шага
3. **Почему работает** — 4 преимущества
4. **Где использовать** — 4 примера
5. **Тарифы** — 3 плана
6. **Форма заявки** — Tally форма
7. **Footer** — Контакты

## 🛠 Технологии

- Чистый HTML5 + CSS3
- Без фреймворков и зависимостей
- Mobile-first адаптивность
- CSS Grid + Flexbox
- CSS переменные
- Google Fonts (Inter)

---

**Демо игры:** https://frontend-drab-ten-89.vercel.app
