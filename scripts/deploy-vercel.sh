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
    echo "║              Деплой на Vercel                                 ║"
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

# Проверка Vercel CLI
print_step "Проверка Vercel CLI..."

if command -v vercel &> /dev/null; then
    print_success "Vercel CLI установлен"
else
    print_error "Vercel CLI не установлен"
    print_info "Установите Vercel CLI: npm install -g vercel"
    exit 1
fi

# Проверка авторизации
print_step "Проверка авторизации в Vercel..."

if vercel whoami &> /dev/null; then
    print_success "Авторизован в Vercel"
else
    print_error "Не авторизован в Vercel"
    print_info "Выполните: vercel login"
    exit 1
fi

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
        git commit -m "Подготовка к деплою на Vercel - $(date)"
        
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

if [ -f "vercel.json" ]; then
    print_success "vercel.json найден"
else
    print_error "vercel.json не найден"
    exit 1
fi

if [ -d "src/webapp" ] && [ -f "src/webapp/server.js" ]; then
    print_success "Структура проекта корректна"
else
    print_error "Структура проекта повреждена"
    exit 1
fi

# Создание файла с переменными окружения для Vercel
print_step "Создание файла с переменными окружения..."

cat > vercel-env-vars.txt << 'EOF'
# Переменные окружения для Vercel
# Скопируйте эти переменные в настройки вашего проекта на Vercel

NODE_ENV=production
SESSION_SECRET=your_session_secret_change_this_in_vercel_dashboard

# Bitrix24 (заполните своими данными)
BITRIX24_CLIENT_ID=your_client_id
BITRIX24_CLIENT_SECRET=your_client_secret
BITRIX24_CALLBACK_URL=https://your-app.vercel.app/api/auth/bitrix24/callback

# Telegram (заполните своими данными)
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_BOT_USERNAME=your_bot_username

# Приложение
BACKEND_URL=https://your-app.vercel.app
ALLOWED_ORIGINS=https://your-app.vercel.app
LOG_LEVEL=info
EOF

print_success "Файл vercel-env-vars.txt создан"

# Отправка изменений в GitHub
print_step "Отправка изменений в GitHub..."

if git push origin main; then
    print_success "Изменения отправлены в GitHub"
else
    print_error "Ошибка отправки в GitHub"
    exit 1
fi

# Деплой на Vercel
print_step "Деплой на Vercel..."

echo ""
print_info "Начинается деплой на Vercel..."
print_info "Следуйте инструкциям в терминале"

# Запуск деплоя
if vercel --prod; then
    print_success "Деплой на Vercel завершен успешно!"
else
    print_error "Ошибка деплоя на Vercel"
    exit 1
fi

# Создание инструкции по настройке
print_step "Создание инструкции по настройке..."

cat > VERCEL_SETUP_COMPLETE.md << 'EOF'
# 🎉 Деплой на Vercel завершен!

## ✅ Что было выполнено

### 1. Подготовка проекта
- ✅ Vercel CLI установлен и настроен
- ✅ Git репозиторий готов
- ✅ Файлы конфигурации созданы
- ✅ Изменения отправлены в GitHub

### 2. Деплой
- ✅ Проект развернут на Vercel
- ✅ URL приложения получен
- ✅ SSL сертификат настроен автоматически

## 📋 Следующие шаги

### 1. Настройка переменных окружения
1. **Откройте Vercel Dashboard**
2. **Перейдите в ваш проект**
3. **Откройте "Settings" → "Environment Variables"**
4. **Добавьте переменные из файла `vercel-env-vars.txt`**

### 2. Настройка Bitrix24
1. **Войдите в Bitrix24** как администратор
2. **Перейдите в "Разработчикам"** → **"Приложения"**
3. **Создайте новое приложение:**
   - **Название:** `Telegram Approval Cloud`
   - **URL приложения:** `https://your-app.vercel.app`
   - **URL авторизации:** `https://your-app.vercel.app/api/auth/bitrix24`
   - **Права доступа:** CRM, Задачи, Пользователи, Уведомления

### 3. Настройка Telegram Bot
1. **Напишите @BotFather** в Telegram
2. **Создайте бота:** `/newbot`
3. **Получите токен**
4. **Настройте webhook:**
   ```bash
   curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
        -H "Content-Type: application/json" \
        -d '{
          "url": "https://your-app.vercel.app/api/telegram/webhook",
          "allowed_updates": ["message", "callback_query"],
          "drop_pending_updates": true
        }'
   ```

### 4. Тестирование
1. **Откройте приложение** в браузере
2. **Авторизуйтесь** через Bitrix24
3. **Создайте тестовое согласование**
4. **Проверьте** получение уведомления в Telegram
5. **Ответьте** на согласование
6. **Проверьте** обновление статуса в Bitrix24

## 🔗 Полезные ссылки

### Vercel Dashboard
- **Проект:** https://vercel.com/dashboard
- **Логи:** Vercel Dashboard → Functions
- **Переменные:** Vercel Dashboard → Settings → Environment Variables

### Приложение
- **URL:** https://your-app.vercel.app
- **Health Check:** https://your-app.vercel.app/health
- **API Status:** https://your-app.vercel.app/api/auth/status

## 🆘 Поддержка

Если у вас возникли проблемы:
1. **Проверьте логи** в Vercel Dashboard
2. **Посмотрите документацию** Vercel
3. **Обратитесь в поддержку** с описанием проблемы

---

**🎉 Поздравляем! Ваше приложение успешно развернуто на Vercel!** 🚀
EOF

print_success "Инструкция VERCEL_SETUP_COMPLETE.md создана"

# Финальная информация
print_step "Деплой завершен!"

echo ""
print_info "📋 Следующие шаги:"
echo "1. Откройте vercel-env-vars.txt и скопируйте переменные"
echo "2. Настройте переменные окружения в Vercel Dashboard"
echo "3. Настройте Bitrix24 приложение"
echo "4. Создайте Telegram Bot"
echo "5. Протестируйте интеграцию"

echo ""
print_info "📚 Документация:"
echo "- VERCEL_DEPLOY_GUIDE.md - подробная инструкция по деплою"
echo "- VERCEL_SETUP_COMPLETE.md - инструкция по настройке"
echo "- vercel-env-vars.txt - переменные окружения"

echo ""
print_success "🎉 Проект успешно развернут на Vercel!"
print_info "Для настройки следуйте инструкции в VERCEL_SETUP_COMPLETE.md"
