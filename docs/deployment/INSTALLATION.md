# 📦 Инструкция по установке
## Кастомное Activity «Согласование через Telegram» для Битрикс24

---

## 📋 Предварительные требования

### Системные требования
- **Node.js:** 18.0.0 или выше
- **npm:** 8.0.0 или выше
- **MySQL:** 8.0 или выше (или PostgreSQL 13+)
- **PHP:** 8.0 или выше (для Activity)
- **Git:** для клонирования репозитория

### Внешние сервисы
- **Telegram Bot Token** (от @BotFather)
- **Битрикс24** (коробка) с доступом к файловой системе
- **SSL сертификат** (для webhook)

---

## 🚀 Пошаговая установка

### Шаг 1: Клонирование репозитория

```bash
# Клонируем репозиторий
git clone https://github.com/your-username/telegram-approval-b24.git
cd telegram-approval-b24

# Проверяем версию Node.js
node --version  # Должно быть >= 18.0.0
npm --version   # Должно быть >= 8.0.0
```

### Шаг 2: Настройка окружения

```bash
# Копируем пример конфигурации
cp config/env.example config/.env

# Редактируем конфигурацию
nano config/.env
```

**Важные параметры для настройки:**

```bash
# Backend-сервис
BACKEND_PORT=3000
BACKEND_SECRET=your-super-secret-key-change-this
BACKEND_WEBHOOK_URL=https://your-domain.com/webhook

# База данных
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=telegram_approval
DATABASE_USER=telegram_user
DATABASE_PASSWORD=your-database-password

# Telegram Bot
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz

# Битрикс24
B24_PORTAL_URL=https://your-portal.bitrix24.ru
B24_WEBHOOK_URL=https://your-portal.bitrix24.ru/rest/1/webhook/
B24_AUTH_TOKEN=your-bitrix24-auth-token
```

### Шаг 3: Установка зависимостей

```bash
# Устанавливаем зависимости
npm install

# Или используем скрипт установки
npm run setup
```

### Шаг 4: Настройка базы данных

```bash
# Создаем базу данных
mysql -u root -p
```

```sql
CREATE DATABASE telegram_approval CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'telegram_user'@'localhost' IDENTIFIED BY 'your-database-password';
GRANT ALL PRIVILEGES ON telegram_approval.* TO 'telegram_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

```bash
# Запускаем миграции
npm run db:migrate

# Опционально: заполняем тестовыми данными
npm run db:seed
```

### Шаг 5: Создание Telegram Bot

1. **Откройте Telegram** и найдите @BotFather
2. **Отправьте команду:** `/newbot`
3. **Введите имя бота:** `Your Approval Bot`
4. **Введите username:** `your_approval_bot`
5. **Получите токен** и добавьте его в `config/.env`

### Шаг 6: Настройка webhook для Telegram

```bash
# Устанавливаем webhook для бота
curl -X POST "https://api.telegram.org/bot{YOUR_BOT_TOKEN}/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-domain.com/webhook",
    "allowed_updates": ["message", "callback_query"]
  }'
```

### Шаг 7: Установка Activity в Битрикс24

```bash
# Копируем Activity в папку Битрикс24
cp -r src/activity /path/to/bitrix24/local/activities/telegram_approval

# Проверяем права доступа
chmod -R 755 /path/to/bitrix24/local/activities/telegram_approval
chown -R www-data:www-data /path/to/bitrix24/local/activities/telegram_approval
```

### Шаг 8: Запуск сервисов

```bash
# Запуск в режиме разработки
npm run dev

# Или в продакшене
npm start
```

---

## 🔧 Конфигурация

### Настройка Nginx (рекомендуется)

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;

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

    location /webhook {
        proxy_pass http://localhost:3000/webhook;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Настройка PM2 (для продакшена)

```bash
# Устанавливаем PM2
npm install -g pm2

# Создаем конфигурацию
pm2 init

# Запускаем приложение
pm2 start src/backend/server.js --name "telegram-approval"

# Настраиваем автозапуск
pm2 startup
pm2 save
```

---

## 🧪 Тестирование установки

### Проверка backend-сервиса

```bash
# Проверяем доступность API
curl http://localhost:3000/health

# Ожидаемый ответ:
# {"status":"ok","timestamp":"2024-01-15T10:30:00.000Z"}
```

### Проверка Telegram Bot

```bash
# Проверяем информацию о боте
curl "https://api.telegram.org/bot{YOUR_BOT_TOKEN}/getMe"

# Ожидаемый ответ:
# {"ok":true,"result":{"id":123456789,"is_bot":true,"first_name":"Your Approval Bot","username":"your_approval_bot"}}
```

### Проверка Activity в Битрикс24

1. **Откройте конструктор бизнес-процессов**
2. **Добавьте новое Activity**
3. **Найдите "Согласование через Telegram"**
4. **Проверьте форму настроек**

---

## 🔒 Безопасность

### Обязательные настройки безопасности

1. **Измените все секретные ключи:**
   ```bash
   BACKEND_SECRET=your-super-secret-key-change-this
   JWT_SECRET=your-jwt-secret-key-change-this
   ```

2. **Настройте SSL сертификат** для webhook

3. **Ограничьте доступ к базе данных:**
   ```sql
   GRANT SELECT, INSERT, UPDATE, DELETE ON telegram_approval.* TO 'telegram_user'@'localhost';
   ```

4. **Настройте firewall:**
   ```bash
   # Открываем только необходимые порты
   ufw allow 22    # SSH
   ufw allow 80    # HTTP
   ufw allow 443   # HTTPS
   ufw enable
   ```

---

## 🐛 Устранение неполадок

### Частые проблемы

#### 1. Ошибка подключения к базе данных
```bash
# Проверьте настройки в config/.env
# Убедитесь, что MySQL запущен
sudo systemctl status mysql

# Проверьте подключение
mysql -u telegram_user -p telegram_approval
```

#### 2. Telegram Bot не отвечает
```bash
# Проверьте webhook
curl "https://api.telegram.org/bot{YOUR_BOT_TOKEN}/getWebhookInfo"

# Переустановите webhook
curl -X POST "https://api.telegram.org/bot{YOUR_BOT_TOKEN}/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-domain.com/webhook"}'
```

#### 3. Activity не появляется в Битрикс24
```bash
# Проверьте права доступа
ls -la /path/to/bitrix24/local/activities/telegram_approval

# Проверьте логи Битрикс24
tail -f /path/to/bitrix24/logs/php_errors.log
```

#### 4. Ошибки в логах backend-сервиса
```bash
# Проверьте логи
tail -f logs/app.log

# Проверьте конфигурацию
node -e "require('dotenv').config(); console.log(process.env)"
```

---

## 📞 Поддержка

### Полезные команды

```bash
# Проверка статуса всех сервисов
npm run status

# Перезапуск сервисов
npm run restart

# Очистка логов
npm run clean-logs

# Резервное копирование
npm run backup
```

### Контакты для поддержки
- **Email:** support@your-company.com
- **Telegram:** @your_support_bot
- **Документация:** [docs/](docs/)

---

## ✅ Проверочный список

- [ ] Репозиторий склонирован
- [ ] Конфигурация настроена
- [ ] Зависимости установлены
- [ ] База данных создана и настроена
- [ ] Telegram Bot создан и настроен
- [ ] Webhook установлен
- [ ] Activity установлен в Битрикс24
- [ ] Backend-сервис запущен
- [ ] SSL сертификат настроен
- [ ] Тесты пройдены
- [ ] Безопасность настроена

**Статус установки:** ✅ ГОТОВ К ИСПОЛЬЗОВАНИЮ
