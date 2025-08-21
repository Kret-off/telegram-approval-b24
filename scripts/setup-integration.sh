#!/bin/bash

echo "🚀 Настройка интеграции Telegram Approval Cloud"
echo "================================================"

# Проверяем, что мы в правильной директории
if [ ! -f "package.json" ]; then
    echo "❌ Ошибка: Запустите скрипт из корневой директории проекта"
    exit 1
fi

echo ""
echo "📋 Чек-лист настройки:"
echo ""

echo "1️⃣  Создание приложения в Bitrix24:"
echo "   - Откройте ваш портал Bitrix24"
echo "   - Перейдите в 'Приложения' → 'Разработчикам' → 'Создать приложение'"
echo "   - Название: Telegram Approval Cloud"
echo "   - Redirect URI: https://telegram-approval-b2411.vercel.app/api/auth/bitrix24/callback"
echo "   - Скопируйте Client ID и Client Secret"
echo ""

echo "2️⃣  Создание Telegram Bot:"
echo "   - Найдите @BotFather в Telegram"
echo "   - Отправьте /newbot"
echo "   - Имя: Telegram Approval Bot"
echo "   - Username: your_approval_bot"
echo "   - Скопируйте токен бота"
echo ""

echo "3️⃣  Настройка переменных окружения в Vercel:"
echo "   - Откройте https://vercel.com/dashboard"
echo "   - Найдите проект telegram-approval-b2411"
echo "   - Settings → Environment Variables"
echo "   - Добавьте переменные из файла vercel-env-vars.txt"
echo ""

echo "4️⃣  Настройка webhook'ов в Bitrix24:"
echo "   - CRM события: https://telegram-approval-b2411.vercel.app/api/webhooks/crm"
echo "   - Задачи: https://telegram-approval-b2411.vercel.app/api/webhooks/tasks"
echo "   - Универсальный: https://telegram-approval-b2411.vercel.app/api/webhooks/universal"
echo ""

echo "5️⃣  Настройка webhook Telegram Bot:"
echo "   - URL: https://api.telegram.org/bot<TOKEN>/setWebhook"
echo "   - Параметр url: https://telegram-approval-b2411.vercel.app/api/telegram/webhook"
echo ""

echo "🔧 Полезные команды для тестирования:"
echo ""

echo "Проверка health check:"
echo "curl https://telegram-approval-b2411.vercel.app/health"
echo ""

echo "Проверка авторизации Bitrix24:"
echo "curl https://telegram-approval-b2411.vercel.app/api/auth/status"
echo ""

echo "Проверка webhook Telegram:"
echo "curl -X POST https://telegram-approval-b2411.vercel.app/api/webhooks/test"
echo ""

echo "📁 Файлы с инструкциями:"
echo "   - BITRIX24_SETUP_GUIDE.md - подробная настройка Bitrix24"
echo "   - TELEGRAM_BOT_SETUP.md - настройка Telegram Bot"
echo "   - vercel-env-vars.txt - список переменных окружения"
echo ""

echo "🎯 После настройки:"
echo "   1. Протестируйте авторизацию в Bitrix24"
echo "   2. Отправьте /start боту в Telegram"
echo "   3. Создайте тестовую задачу в Bitrix24"
echo "   4. Проверьте получение уведомления в Telegram"
echo ""

echo "✅ Готово! Следуйте инструкциям выше для настройки интеграции."
echo ""
echo "📞 Если возникнут проблемы, проверьте логи в Vercel Dashboard"
