#!/bin/bash

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функции для вывода
print_header() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║              Подготовка к деплою на Render                    ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_step() {
    echo -e "${YELLOW}[ШАГ]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅${NC} $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ️${NC} $1"
}

print_header

# Проверка Git статуса
print_step "Проверка Git статуса..."

if [ -d ".git" ]; then
    print_success "Git репозиторий найден"
    
    # Проверка изменений
    if [ -n "$(git status --porcelain)" ]; then
        print_info "Обнаружены несохраненные изменения"
        
        # Добавление всех файлов
        git add .
        
        # Создание коммита
        git commit -m "Подготовка к деплою на Render - $(date)"
        
        print_success "Изменения закоммичены"
    else
        print_info "Нет несохраненных изменений"
    fi
else
    print_error "Git репозиторий не найден"
    exit 1
fi

# Проверка файлов конфигурации
print_step "Проверка файлов конфигурации..."

if [ -f "render.yaml" ]; then
    print_success "render.yaml найден"
else
    print_error "render.yaml не найден"
    exit 1
fi

if [ -f "Procfile" ]; then
    print_success "Procfile найден"
else
    print_error "Procfile не найден"
    exit 1
fi

# Проверка структуры проекта
print_step "Проверка структуры проекта..."

if [ -d "src/webapp" ] && [ -f "src/webapp/server.js" ]; then
    print_success "Структура проекта корректна"
else
    print_error "Структура проекта повреждена"
    exit 1
fi

# Создание файла с переменными окружения для Render
print_step "Создание файла с переменными окружения..."

cat > render-env-vars.txt << 'EOF'
# Переменные окружения для Render
# Скопируйте эти переменные в настройки вашего приложения на Render

NODE_ENV=production
PORT=10000
SESSION_SECRET=your_session_secret_change_this_in_render_dashboard

# Bitrix24 (заполните своими данными)
BITRIX24_CLIENT_ID=your_client_id
BITRIX24_CLIENT_SECRET=your_client_secret
BITRIX24_CALLBACK_URL=https://your-app-name.onrender.com/api/auth/bitrix24/callback

# Telegram (заполните своими данными)
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_BOT_USERNAME=your_bot_username

# Приложение
BACKEND_URL=https://your-app-name.onrender.com
ALLOWED_ORIGINS=https://your-app-name.onrender.com
LOG_LEVEL=info
EOF

print_success "Файл render-env-vars.txt создан"

# Создание инструкции по деплою
print_step "Создание инструкции по деплою..."

cat > DEPLOY_INSTRUCTIONS.md << 'EOF'
# 🚀 Инструкция по деплою на Render

## 📋 Шаги деплоя

### 1. Подготовка
- ✅ Git репозиторий готов
- ✅ Файлы конфигурации созданы
- ✅ Структура проекта проверена

### 2. Создание приложения на Render

1. **Войдите на [render.com](https://render.com)**
2. **Нажмите "New +" → "Web Service"**
3. **Подключите GitHub репозиторий**
4. **Настройте параметры:**
   - **Name:** telegram-approval-cloud
   - **Environment:** Node
   - **Build Command:** `npm install && cd src/webapp && npm install`
   - **Start Command:** `cd src/webapp && npm start`

### 3. Настройка переменных окружения

В разделе "Environment" добавьте переменные из файла `render-env-vars.txt`:

```env
NODE_ENV=production
PORT=10000
SESSION_SECRET=your_session_secret_change_this_in_render_dashboard
BITRIX24_CLIENT_ID=your_client_id
BITRIX24_CLIENT_SECRET=your_client_secret
BITRIX24_CALLBACK_URL=https://your-app-name.onrender.com/api/auth/bitrix24/callback
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_BOT_USERNAME=your_bot_username
BACKEND_URL=https://your-app-name.onrender.com
ALLOWED_ORIGINS=https://your-app-name.onrender.com
LOG_LEVEL=info
```

### 4. Деплой

1. **Нажмите "Create Web Service"**
2. **Дождитесь завершения сборки**
3. **Получите URL приложения**

### 5. Обновление конфигурации

После получения URL обновите переменные:
- `BITRIX24_CALLBACK_URL`
- `BACKEND_URL`
- `ALLOWED_ORIGINS`

### 6. Тестирование

1. **Откройте URL приложения**
2. **Проверьте health check:** `https://your-app.onrender.com/health`
3. **Протестируйте API endpoints**

## 🔧 Настройка Bitrix24

### Создание приложения в Bitrix24

1. **Войдите в Bitrix24** как администратор
2. **Перейдите в "Разработчикам"** → **"Приложения"**
3. **Создайте новое приложение:**
   - **Название:** Telegram Approval Cloud
   - **URL приложения:** `https://your-app.onrender.com`
   - **URL авторизации:** `https://your-app.onrender.com/api/auth/bitrix24`
   - **Права доступа:** CRM, Задачи, Пользователи, Уведомления

### Получение ключей

После создания приложения получите:
- **Client ID**
- **Client Secret**

Добавьте их в переменные окружения на Render.

## 🤖 Настройка Telegram Bot

### Создание бота

1. **Напишите @BotFather** в Telegram
2. **Создайте бота:** `/newbot`
3. **Получите токен** бота

### Настройка webhook

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{
       "url": "https://your-app.onrender.com/api/telegram/webhook",
       "allowed_updates": ["message", "callback_query"],
       "drop_pending_updates": true
     }'
```

## 🧪 Тестирование

### Проверка деплоя

1. **Health Check:**
   ```bash
   curl https://your-app.onrender.com/health
   ```

2. **API Status:**
   ```bash
   curl https://your-app.onrender.com/api/auth/status
   ```

3. **Webhook Test:**
   ```bash
   curl -X POST "https://your-app.onrender.com/api/webhooks/test" \
        -H "Content-Type: application/json" \
        -d '{"test": "data"}'
   ```

### Полное тестирование

1. **Откройте приложение** в браузере
2. **Авторизуйтесь** через Bitrix24
3. **Создайте тестовое согласование**
4. **Проверьте** получение уведомления в Telegram
5. **Ответьте** на согласование
6. **Проверьте** обновление статуса в Bitrix24

## 🆘 Устранение неполадок

### Проблема: Приложение не запускается
**Решение:**
- Проверьте логи в Render Dashboard
- Убедитесь, что все переменные окружения настроены
- Проверьте команды сборки и запуска

### Проблема: Ошибки авторизации
**Решение:**
- Проверьте Client ID и Client Secret
- Убедитесь, что callback URL настроен правильно
- Проверьте права доступа приложения

### Проблема: Telegram Bot не отвечает
**Решение:**
- Проверьте токен бота
- Убедитесь, что webhook настроен правильно
- Проверьте логи приложения

## 📞 Поддержка

Если у вас возникли проблемы:
1. **Проверьте документацию** в папке `docs/`
2. **Посмотрите логи** в Render Dashboard
3. **Обратитесь в поддержку** с описанием проблемы

---

**🎉 Готово! Ваше приложение развернуто на Render!**
EOF

print_success "Инструкция DEPLOY_INSTRUCTIONS.md создана"

# Финальная информация
print_step "Подготовка завершена!"

echo ""
print_info "📋 Следующие шаги:"
echo "1. Откройте render-env-vars.txt и скопируйте переменные"
echo "2. Создайте приложение на Render.com"
echo "3. Добавьте переменные окружения в Render Dashboard"
echo "4. Настройте Bitrix24 приложение"
echo "5. Создайте Telegram Bot"
echo "6. Протестируйте интеграцию"

echo ""
print_info "📚 Документация:"
echo "- DEPLOY_INSTRUCTIONS.md - подробная инструкция по деплою"
echo "- docs/cloud-setup/bitrix24-setup.md - настройка Bitrix24"
echo "- docs/cloud-setup/telegram-setup.md - настройка Telegram"

echo ""
print_success "🎉 Проект готов к деплою на Render!"
print_info "Для деплоя следуйте инструкции в DEPLOY_INSTRUCTIONS.md"
