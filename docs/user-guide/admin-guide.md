# 👨‍💼 Руководство администратора

Данное руководство поможет администраторам управлять системой интеграции Telegram с Bitrix24 для согласования документов.

## 🔧 Управление системой

### Мониторинг состояния

#### Проверка работоспособности
```bash
# Проверка backend-сервиса
curl https://your-domain.com/health

# Ожидаемый ответ:
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0"
}
```

#### Детальная диагностика
```bash
# Проверка всех компонентов
curl https://your-domain.com/health/detailed

# Ожидаемый ответ:
{
  "status": "ok",
  "checks": {
    "database": "ok",
    "telegram": "ok",
    "bitrix24": "ok",
    "memory": "ok",
    "disk": "ok"
  }
}
```

### Логирование и отладка

#### Просмотр логов
```bash
# Логи backend-сервиса
tail -f /path/to/backend/logs/app.log

# Логи Telegram
tail -f /path/to/backend/logs/telegram.log

# Логи Bitrix24
tail -f /path/to/backend/logs/bitrix24.log

# Логи ошибок
tail -f /path/to/backend/logs/error.log
```

#### Фильтрация логов
```bash
# Поиск ошибок
grep "ERROR" /path/to/backend/logs/app.log

# Поиск по пользователю
grep "user_id:123" /path/to/backend/logs/telegram.log

# Поиск по времени
grep "2024-01-15" /path/to/backend/logs/app.log
```

## 👥 Управление пользователями

### Добавление новых пользователей

#### В Bitrix24
1. **Создание пользователя:**
   ```
   Настройки > Пользователи > Добавить пользователя
   ```

2. **Настройка прав:**
   - Права на бизнес-процессы
   - Права на CRM
   - Права на согласование

#### В системе согласования
1. **Добавление в маппинг:**
   ```sql
   INSERT INTO user_mappings (
       bitrix24_portal,
       bitrix24_user_id,
       bitrix24_user_name,
       telegram_user_id,
       telegram_username,
       is_active
   ) VALUES (
       'https://company.bitrix24.ru',
       123,
       'Иванов Иван',
       987654321,
       'ivanov_ivan',
       1
   );
   ```

2. **Проверка настройки:**
   ```bash
   # Проверка маппинга пользователя
   curl -X GET "https://your-domain.com/api/admin/users/123" \
        -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
   ```

### Удаление пользователей

#### Деактивация в системе
```sql
UPDATE user_mappings 
SET is_active = 0 
WHERE bitrix24_user_id = 123;
```

#### Полное удаление
```sql
DELETE FROM user_mappings 
WHERE bitrix24_user_id = 123;
```

### Управление правами доступа

#### Настройка ролей
```php
// В Bitrix24
// Настройки > Права доступа > Роли

// Создание роли "Согласант"
$role = array(
    'NAME' => 'Согласант',
    'DESCRIPTION' => 'Права на согласование документов',
    'PERMISSIONS' => array(
        'bizproc' => 'W',
        'crm' => 'R',
        'telegram_approval' => 'W'
    )
);
```

## 📊 Мониторинг и аналитика

### Статистика согласований

#### Получение статистики
```bash
# Общая статистика
curl -X GET "https://your-domain.com/api/admin/stats" \
     -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Статистика по пользователю
curl -X GET "https://your-domain.com/api/admin/stats/user/123" \
     -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Статистика по периоду
curl -X GET "https://your-domain.com/api/admin/stats/period?start=2024-01-01&end=2024-01-31" \
     -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

#### Примеры ответов
```json
{
  "total_approvals": 150,
  "approved": 120,
  "rejected": 20,
  "timeout": 10,
  "avg_response_time": "2.5h",
  "top_approvers": [
    {"user_id": 123, "name": "Иванов Иван", "count": 25},
    {"user_id": 456, "name": "Петров Петр", "count": 20}
  ]
}
```

### Мониторинг производительности

#### Метрики системы
```bash
# Использование ресурсов
curl -X GET "https://your-domain.com/api/admin/metrics" \
     -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Ожидаемый ответ:
{
  "cpu_usage": "15%",
  "memory_usage": "45%",
  "disk_usage": "30%",
  "active_connections": 5,
  "requests_per_minute": 12
}
```

#### Алерты и уведомления
```bash
# Настройка алертов
# Создайте скрипт для мониторинга:

#!/bin/bash
# check_system.sh

RESPONSE=$(curl -s https://your-domain.com/health)
STATUS=$(echo $RESPONSE | jq -r '.status')

if [ "$STATUS" != "ok" ]; then
    echo "ALERT: System is down!" | mail -s "System Alert" admin@company.com
fi
```

## 🔒 Безопасность

### Управление ключами

#### Ротация секретных ключей
```bash
# Генерация нового ключа
NEW_SECRET=$(openssl rand -hex 32)

# Обновление в .env
sed -i "s/BACKEND_SECRET=.*/BACKEND_SECRET=$NEW_SECRET/" .env

# Перезапуск сервиса
pm2 restart telegram-approval-backend
```

#### Обновление токенов
```bash
# Обновление Telegram Bot Token
# 1. Создайте нового бота через @BotFather
# 2. Получите новый токен
# 3. Обновите в .env
# 4. Перезапустите сервис

# Обновление Bitrix24 токена
# 1. Создайте новый вебхук в Bitrix24
# 2. Получите новый токен
# 3. Обновите в .env
# 4. Перезапустите сервис
```

### Аудит безопасности

#### Проверка логов безопасности
```bash
# Поиск подозрительной активности
grep "SECURITY" /path/to/backend/logs/app.log

# Проверка неудачных попыток аутентификации
grep "AUTH_FAILED" /path/to/backend/logs/app.log

# Проверка попыток обхода rate limit
grep "RATE_LIMIT" /path/to/backend/logs/app.log
```

#### Регулярные проверки
```bash
# Ежедневная проверка
#!/bin/bash
# daily_security_check.sh

# Проверка SSL сертификата
echo "Checking SSL certificate..."
openssl s_client -connect your-domain.com:443 -servername your-domain.com < /dev/null 2>/dev/null | openssl x509 -noout -dates

# Проверка обновлений
echo "Checking for updates..."
npm outdated

# Проверка прав доступа к файлам
echo "Checking file permissions..."
find /path/to/backend -type f -exec ls -la {} \;
```

## 🚨 Устранение неполадок

### Частые проблемы

#### Backend-сервис не отвечает
```bash
# Проверка статуса процесса
pm2 status
pm2 logs telegram-approval-backend

# Перезапуск сервиса
pm2 restart telegram-approval-backend

# Проверка портов
netstat -tulpn | grep :3000
```

#### Проблемы с базой данных
```bash
# Проверка подключения
mysql -u your_user -p -e "SELECT 1;"

# Проверка таблиц
mysql -u your_user -p telegram_approval -e "SHOW TABLES;"

# Проверка размера базы
mysql -u your_user -p -e "SELECT table_schema, ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)' FROM information_schema.tables WHERE table_schema = 'telegram_approval';"
```

#### Проблемы с Telegram
```bash
# Проверка webhook
curl https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo

# Переустановка webhook
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://your-domain.com/api/telegram/webhook"}'

# Проверка бота
curl https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getMe
```

### Восстановление после сбоев

#### Восстановление базы данных
```bash
# Создание резервной копии
mysqldump -u your_user -p telegram_approval > backup_$(date +%Y%m%d_%H%M%S).sql

# Восстановление из резервной копии
mysql -u your_user -p telegram_approval < backup_20240115_143000.sql
```

#### Восстановление конфигурации
```bash
# Резервное копирование конфигурации
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)

# Восстановление конфигурации
cp .env.backup.20240115_143000 .env
```

## 📈 Оптимизация производительности

### Настройка базы данных

#### Оптимизация MySQL
```sql
-- Анализ медленных запросов
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;

-- Оптимизация таблиц
OPTIMIZE TABLE approvals;
OPTIMIZE TABLE approvers;
OPTIMIZE TABLE user_mappings;

-- Создание индексов
CREATE INDEX idx_approval_status ON approvals(status);
CREATE INDEX idx_approval_created ON approvals(created_at);
CREATE INDEX idx_approver_user ON approvers(bitrix24_user_id);
```

#### Настройка пула соединений
```javascript
// В src/database/connection.js
const sequelize = new Sequelize(/* ... */, {
  pool: {
    max: 20,        // Максимальное количество соединений
    min: 5,         // Минимальное количество соединений
    acquire: 30000, // Время ожидания получения соединения
    idle: 10000     // Время неактивности соединения
  }
});
```

### Настройка кэширования

#### Redis кэширование
```bash
# Установка Redis
sudo apt-get install redis-server

# Настройка в .env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
```

```javascript
// Использование Redis для кэширования
const redis = require('redis');
const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD
});

// Кэширование результатов
async function getCachedApproval(approvalId) {
  const cached = await client.get(`approval:${approvalId}`);
  if (cached) {
    return JSON.parse(cached);
  }
  
  const approval = await Approval.findByPk(approvalId);
  await client.setex(`approval:${approvalId}`, 3600, JSON.stringify(approval));
  return approval;
}
```

## 🔄 Резервное копирование

### Автоматическое резервное копирование

#### Скрипт резервного копирования
```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/path/to/backups"

# Резервное копирование базы данных
mysqldump -u your_user -p telegram_approval > $BACKUP_DIR/db_backup_$DATE.sql

# Резервное копирование конфигурации
cp .env $BACKUP_DIR/env_backup_$DATE

# Резервное копирование логов
tar -czf $BACKUP_DIR/logs_backup_$DATE.tar.gz logs/

# Удаление старых резервных копий (старше 30 дней)
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "env_backup_*" -mtime +30 -delete
find $BACKUP_DIR -name "logs_backup_*" -mtime +30 -delete

echo "Backup completed: $DATE"
```

#### Настройка cron
```bash
# Добавьте в crontab
# Ежедневное резервное копирование в 2:00
0 2 * * * /path/to/backup.sh

# Еженедельное резервное копирование в воскресенье в 3:00
0 3 * * 0 /path/to/weekly_backup.sh
```

## 📞 Поддержка пользователей

### Создание FAQ

#### Частые вопросы пользователей
```markdown
# FAQ для пользователей

## Q: Не получаю сообщения от бота
A: Проверьте настройки приватности в Telegram и убедитесь, что бот не заблокирован.

## Q: Кнопки не работают
A: Обновите Telegram до последней версии или используйте текстовые ответы.

## Q: Процесс зависает
A: Обратитесь к администратору для проверки настроек таймаута.
```

### Система тикетов

#### Настройка системы поддержки
```bash
# Создание тикета
curl -X POST "https://your-domain.com/api/admin/tickets" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
     -d '{
       "user_id": 123,
       "subject": "Проблема с согласованием",
       "description": "Не получаю сообщения от бота",
       "priority": "medium"
     }'
```

---

**Управление системой настроено! 🎉**

Теперь вы готовы эффективно управлять системой интеграции Telegram с Bitrix24.
