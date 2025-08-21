# ⚡ Быстрый деплой на Render

## 🎯 Что у нас есть

✅ **render.yaml** - конфигурация для Render  
✅ **Procfile** - команда запуска  
✅ **package.json** - обновлен для деплоя  
✅ **render-env-vars.txt** - переменные окружения  
✅ **RENDER_DEPLOY_GUIDE.md** - подробная инструкция  

---

## 🚀 Быстрый деплой (5 минут)

### Шаг 1: GitHub репозиторий
1. Создайте репозиторий на GitHub
2. Загрузите проект:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/telegram-approval-b24.git
   git push -u origin main
   ```

### Шаг 2: Render.com
1. Зайдите на [render.com](https://render.com)
2. Нажмите "New +" → "Web Service"
3. Подключите GitHub репозиторий
4. Настройте:
   - **Name:** `telegram-approval-backend`
   - **Environment:** `Node`
   - **Build Command:** `cd src/backend && npm install`
   - **Start Command:** `cd src/backend && npm start`

### Шаг 3: Переменные окружения
Скопируйте из файла `render-env-vars.txt`:
```
NODE_ENV=production
PORT=10000
BACKEND_SECRET=cfc7d0438c857e6fc392ff52217c8a3e950a480b176111770bfac2d7e3c9d2cc
JWT_SECRET=26f7a9493d77da5c250cde53292496d0c1463bacb423e7f5b664be42b6ceba5d
HMAC_SECRET=80522cdb6a970885c4d120f50e4b897a7107be71cccdd6257bf502721f4ca8d3
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
```

### Шаг 4: Создание сервиса
1. Нажмите "Create Web Service"
2. Дождитесь завершения деплоя (5-10 минут)
3. Получите URL: `https://your-app-name.onrender.com`

---

## ✅ Проверка

```bash
# Health check
curl https://your-app-name.onrender.com/health

# Детальная диагностика
curl https://your-app-name.onrender.com/health/detailed

# API endpoints
curl https://your-app-name.onrender.com/api/admin/metrics
```

---

## 🔧 Настройка для Bitrix24

После получения URL обновите настройки Activity:
- **URL сервера:** `https://your-app-name.onrender.com`
- **Webhook URL:** `https://your-app-name.onrender.com/api/telegram/webhook`

---

## 📞 Поддержка

- **Подробная инструкция:** `RENDER_DEPLOY_GUIDE.md`
- **Render Docs:** [docs.render.com](https://docs.render.com)
- **GitHub Issues:** [github.com/your-username/telegram-approval-b24/issues](https://github.com/your-username/telegram-approval-b24/issues)

---

**🎉 Готово! У вас будет публичный URL для интеграции с Bitrix24!**
