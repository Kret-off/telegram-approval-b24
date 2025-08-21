# 📋 Руководство по установке Telegram Approval System

Данное руководство поможет вам установить и настроить систему интеграции Telegram с Bitrix24 для согласования документов.

## 📋 Требования к системе

### Минимальные требования
- **Bitrix24:** Коробочная версия 22.0.0 или выше
- **PHP:** 7.4 или выше
- **Node.js:** 18.0.0 или выше
- **MySQL:** 5.7 или выше
- **Telegram Bot:** Созданный через @BotFather

### Рекомендуемые требования
- **Bitrix24:** Коробочная версия 23.0.0 или выше
- **PHP:** 8.0 или выше
- **Node.js:** 20.0.0 или выше
- **MySQL:** 8.0 или выше
- **RAM:** 4GB или больше
- **CPU:** 2 ядра или больше

## 🚀 Пошаговая установка

### Шаг 1: Подготовка Telegram Bot

1. **Создание бота:**
   ```bash
   # Откройте Telegram и найдите @BotFather
   # Отправьте команду: /newbot
   # Следуйте инструкциям для создания бота
   # Сохраните полученный токен
   ```

2. **Настройка webhook:**
   ```bash
   # После установки backend-сервиса
   curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
        -H "Content-Type: application/json" \
        -d '{"url": "https://your-domain.com/api/telegram/webhook"}'
   ```

### Шаг 2: Установка Backend-сервиса

1. **Клонирование репозитория:**
   ```bash
   git clone https://github.com/your-org/telegram-approval-backend.git
   cd telegram-approval-backend
   ```

2. **Установка зависимостей:**
   ```bash
   npm install
   ```

3. **Настройка переменных окружения:**
   ```bash
   cp env.example .env
   # Отредактируйте .env файл с вашими настройками
   ```

4. **Настройка базы данных:**
   ```bash
   # Создайте базу данных
   mysql -u root -p -e "CREATE DATABASE telegram_approval CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
   
   # Запустите миграции
   npm run db:migrate
   
   # Заполните тестовыми данными (опционально)
   npm run db:seed
   ```

5. **Запуск сервиса:**
   ```bash
   # Режим разработки
   npm run dev
   
   # Продакшен режим
   npm start
   ```

### Шаг 3: Установка Activity в Bitrix24

1. **Загрузка файлов:**
   ```bash
   # Скопируйте папку telegram_approval в
   # /bitrix/modules/bizproc/activities/
   cp -r src/activity/telegram_approval /path/to/bitrix/modules/bizproc/activities/
   ```

2. **Установка модуля:**
   ```bash
   # Перейдите в админ-панель Bitrix24
   # Настройки > Настройки продукта > Модули
   # Найдите "Telegram Approval" и нажмите "Установить"
   ```

3. **Настройка прав доступа:**
   ```bash
   # Перейдите в Настройки > Права доступа
   # Настройте права для пользователей, которые будут использовать Activity
   ```

### Шаг 4: Настройка конфигурации

1. **Настройка Activity:**
   ```php
   // В админ-панели Bitrix24
   // Бизнес-процессы > Настройки > Activity
   // Найдите "Telegram Approval" и настройте параметры
   ```

2. **Настройка backend-сервиса:**
   ```bash
   # Отредактируйте .env файл
   BACKEND_URL=https://your-domain.com
   BACKEND_SECRET=your-secret-key
   TELEGRAM_BOT_TOKEN=your-bot-token
   DB_HOST=localhost
   DB_NAME=telegram_approval
   DB_USER=your-db-user
   DB_PASSWORD=your-db-password
   ```

## 🔧 Конфигурация

### Переменные окружения (.env)

```env
# Сервер
PORT=3000
NODE_ENV=production
BACKEND_URL=https://your-domain.com
BACKEND_SECRET=your-secret-key

# База данных
DB_HOST=localhost
DB_PORT=3306
DB_NAME=telegram_approval
DB_USER=your-db-user
DB_PASSWORD=your-db-password

# Telegram
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_BOT_USERNAME=your_bot_username

# Bitrix24
BITRIX24_WEBHOOK_URL=https://your-bitrix24.com/rest/1/webhook
BITRIX24_AUTH_TOKEN=your-auth-token

# Безопасность
JWT_SECRET=your-jwt-secret
HMAC_SECRET=your-hmac-secret
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX_REQUESTS=100

# Логирование
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# SSL (для продакшена)
SSL_KEY_PATH=/path/to/ssl/key.pem
SSL_CERT_PATH=/path/to/ssl/cert.pem
```

### Настройка Activity в Bitrix24

```php
// Параметры Activity
$arActivityParameters = array(
    'BACKEND_URL' => array(
        'Name' => 'URL Backend-сервиса',
        'Type' => 'string',
        'Required' => true,
        'Default' => 'https://your-domain.com'
    ),
    'SECRET_KEY' => array(
        'Name' => 'Секретный ключ',
        'Type' => 'string',
        'Required' => true,
        'Default' => 'your-secret-key'
    ),
    'MESSAGE_TEXT' => array(
        'Name' => 'Текст сообщения',
        'Type' => 'text',
        'Required' => true,
        'Default' => 'Требуется ваше согласование'
    ),
    'BUTTON_APPROVE' => array(
        'Name' => 'Текст кнопки "Согласовать"',
        'Type' => 'string',
        'Required' => false,
        'Default' => 'Согласовать'
    ),
    'BUTTON_REJECT' => array(
        'Name' => 'Текст кнопки "Отклонить"',
        'Type' => 'string',
        'Required' => false,
        'Default' => 'Отклонить'
    ),
    'TIMEOUT_HOURS' => array(
        'Name' => 'Таймаут (часы)',
        'Type' => 'int',
        'Required' => false,
        'Default' => 24
    )
);
```

## 🔒 Настройка безопасности

### SSL сертификат
```bash
# Для продакшена обязательно используйте SSL
# Получите сертификат через Let's Encrypt или другой провайдер
certbot --nginx -d your-domain.com
```

### Firewall настройки
```bash
# Откройте только необходимые порты
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

### Настройка Nginx (опционально)
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🧪 Тестирование установки

### Проверка backend-сервиса
```bash
# Проверка health check
curl https://your-domain.com/health

# Ожидаемый ответ:
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Проверка Activity в Bitrix24
```bash
# Создайте тестовый бизнес-процесс
# Добавьте Activity "Telegram Approval"
# Запустите процесс и проверьте получение сообщения в Telegram
```

### Проверка webhook
```bash
# Проверьте настройку webhook
curl https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo

# Ожидаемый ответ должен содержать ваш URL
```

## 🚨 Устранение неполадок

### Частые проблемы

1. **Ошибка подключения к базе данных:**
   ```bash
   # Проверьте настройки в .env
   # Убедитесь, что MySQL запущен
   sudo systemctl status mysql
   ```

2. **Ошибка webhook:**
   ```bash
   # Проверьте SSL сертификат
   # Убедитесь, что URL доступен извне
   curl -I https://your-domain.com/api/telegram/webhook
   ```

3. **Activity не появляется в Bitrix24:**
   ```bash
   # Проверьте права доступа к файлам
   chmod -R 755 /path/to/bitrix/modules/bizproc/activities/telegram_approval
   # Перезапустите веб-сервер
   sudo systemctl restart apache2
   ```

### Логи и отладка
```bash
# Просмотр логов backend-сервиса
tail -f logs/app.log

# Просмотр логов Bitrix24
tail -f /path/to/bitrix/logs/error.log

# Просмотр логов веб-сервера
sudo tail -f /var/log/nginx/error.log
```

## 📞 Поддержка

При возникновении проблем:

1. Проверьте логи системы
2. Убедитесь в корректности настроек
3. Проверьте требования к системе
4. Обратитесь к документации API
5. Создайте issue в репозитории проекта

---

**Установка завершена! 🎉**

Теперь вы можете использовать систему интеграции Telegram с Bitrix24 для согласования документов.
