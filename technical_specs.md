# 🔧 Технические спецификации
## Кастомное Activity «Согласование через Telegram» для Битрикс24

---

## 📋 Архитектура системы

### Компоненты системы
1. **Activity (PHP-модуль)** - интегрируется в Битрикс24
2. **Backend-сервис** - промежуточный сервис на сервере
3. **Telegram Bot** - бот для отправки и получения сообщений
4. **База данных** - хранение состояния согласований

### Схема взаимодействия
```
Битрикс24 Activity → Backend-сервис → Telegram Bot API
                                    ↓
Telegram Bot API → Backend-сервис → OnExternalEvent → Битрикс24
```

---

## 🗄 Структура базы данных

### Таблица `approval_requests`
```sql
CREATE TABLE approval_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    b24_activity_id VARCHAR(255) NOT NULL,
    b24_process_id VARCHAR(255) NOT NULL,
    b24_document_id VARCHAR(255) NOT NULL,
    message_text TEXT NOT NULL,
    button1_text VARCHAR(100),
    button1_code VARCHAR(50),
    button2_text VARCHAR(100),
    button2_code VARCHAR(50),
    approval_mode ENUM('single', 'multiple_wait_all', 'multiple_first') DEFAULT 'single',
    status ENUM('pending', 'approved', 'rejected', 'timeout') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_b24_activity (b24_activity_id),
    INDEX idx_status (status)
);
```

### Таблица `approval_assignees`
```sql
CREATE TABLE approval_assignees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    approval_request_id INT NOT NULL,
    b24_user_id INT NOT NULL,
    telegram_user_id BIGINT,
    telegram_username VARCHAR(100),
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    responded_at TIMESTAMP NULL,
    response_text TEXT,
    response_type ENUM('button', 'text') NULL,
    FOREIGN KEY (approval_request_id) REFERENCES approval_requests(id) ON DELETE CASCADE,
    INDEX idx_approval_request (approval_request_id),
    INDEX idx_b24_user (b24_user_id),
    INDEX idx_telegram_user (telegram_user_id)
);
```

### Таблица `user_telegram_mapping`
```sql
CREATE TABLE user_telegram_mapping (
    id INT AUTO_INCREMENT PRIMARY KEY,
    b24_user_id INT NOT NULL,
    telegram_user_id BIGINT NOT NULL,
    telegram_username VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_b24_user (b24_user_id),
    UNIQUE KEY unique_telegram_user (telegram_user_id),
    INDEX idx_b24_user (b24_user_id),
    INDEX idx_telegram_user (telegram_user_id)
);
```

---

## 🔌 API контракты

### 1. Запрос от Activity к Backend-сервису

**Эндпоинт:** `POST /api/v1/approval/create`

**Заголовки:**
```
Content-Type: application/json
Authorization: Bearer {api_token}
X-B24-Signature: {hmac_signature}
```

**Тело запроса:**
```json
{
  "b24_activity_id": "string",
  "b24_process_id": "string", 
  "b24_document_id": "string",
  "assignees": [
    {
      "b24_user_id": 123,
      "telegram_user_id": 456789012
    }
  ],
  "message": {
    "text": "Согласуйте документ {=Document:ID}",
    "button1": {
      "text": "Согласовано",
      "code": "approve"
    },
    "button2": {
      "text": "Не согласовано", 
      "code": "reject"
    }
  },
  "settings": {
    "approval_mode": "single",
    "timeout_hours": 24
  }
}
```

**Ответ:**
```json
{
  "success": true,
  "approval_id": "uuid",
  "message": "Approval request created successfully"
}
```

### 2. Webhook от Telegram Bot API

**Эндпоинт:** `POST /api/v1/telegram/webhook`

**Тело запроса (callback_query):**
```json
{
  "update_id": 123456789,
  "callback_query": {
    "id": "callback_id",
    "from": {
      "id": 456789012,
      "username": "user123"
    },
    "data": "approve:approval_id:button_code"
  }
}
```

**Тело запроса (text message):**
```json
{
  "update_id": 123456789,
  "message": {
    "message_id": 123,
    "from": {
      "id": 456789012,
      "username": "user123"
    },
    "text": "Согласовано"
  }
}
```

### 3. Вызов OnExternalEvent в Битрикс24

**Метод:** `OnExternalEvent`

**Параметры:**
```php
$arEventParameters = array(
    'ACTIVITY_ID' => 'b24_activity_id',
    'RESULT_CODE' => 'approve|reject',
    'RESULT_LABEL' => 'Согласовано|Не согласовано',
    'COMMENT' => 'Текст ответа (опционально)',
    'RESPONDED_BY' => 'Иван Иванов',
    'RESPONDED_AT' => '2024-01-15 14:30:00',
    'APPROVAL_ID' => 'uuid'
);
```

---

## 🏗 Структура PHP-модуля Activity

### Файловая структура
```
/local/activities/telegram_approval/
├── lib/
│   ├── TelegramApprovalActivity.php
│   ├── TelegramApprovalSettings.php
│   └── TelegramApprovalResult.php
├── lang/
│   └── ru/
│       └── telegram_approval.php
├── install/
│   ├── index.php
│   └── step.php
└── .description.php
```

### Основной класс Activity
```php
class TelegramApprovalActivity extends CBPActivity
{
    public function __construct($name)
    {
        parent::__construct($name);
        $this->arProperties = array(
            'Title' => '',
            'Assignees' => array(),
            'MessageText' => '',
            'Button1Text' => 'Согласовано',
            'Button1Code' => 'approve',
            'Button2Text' => 'Не согласовано', 
            'Button2Code' => 'reject',
            'ApprovalMode' => 'single',
            'TimeoutHours' => 24
        );
    }

    public function Execute()
    {
        // Логика отправки запроса в backend-сервис
    }

    public static function GetPropertiesDialog($documentType, $activityName, $arWorkflowTemplate, $arWorkflowParameters, $arWorkflowVariables, $arCurrentValues = null, $formName = "form", $popupWindow = null, $siteId = '')
    {
        // Форма настроек Activity
    }

    public static function GetPropertiesDialogValues($documentType, $activityName, &$arWorkflowTemplate, &$arWorkflowParameters, &$arWorkflowVariables, $arCurrentValues, &$arErrors)
    {
        // Обработка формы настроек
    }
}
```

---

## 🔧 Backend-сервис (Node.js/Express)

### Структура проекта
```
backend-service/
├── src/
│   ├── controllers/
│   │   ├── approvalController.js
│   │   └── telegramController.js
│   ├── models/
│   │   ├── ApprovalRequest.js
│   │   └── UserMapping.js
│   ├── services/
│   │   ├── telegramService.js
│   │   ├── b24Service.js
│   │   └── approvalService.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── validation.js
│   └── routes/
│       ├── approval.js
│       └── telegram.js
├── config/
│   └── database.js
├── package.json
└── server.js
```

### Основные эндпоинты
```javascript
// Создание запроса на согласование
POST /api/v1/approval/create

// Получение статуса согласования
GET /api/v1/approval/:id/status

// Webhook от Telegram
POST /api/v1/telegram/webhook

// Управление маппингом пользователей
GET /api/v1/users/mapping
POST /api/v1/users/mapping
```

---

## 🤖 Telegram Bot API интеграция

### Отправка сообщения с кнопками
```javascript
const message = {
    chat_id: telegram_user_id,
    text: messageText,
    reply_markup: {
        inline_keyboard: [
            [
                {
                    text: button1Text,
                    callback_data: `approve:${approvalId}:${button1Code}`
                },
                {
                    text: button2Text,
                    callback_data: `reject:${approvalId}:${button2Code}`
                }
            ]
        ]
    }
};

await telegramBot.sendMessage(message);
```

### Обработка callback_query
```javascript
bot.on('callback_query', async (callbackQuery) => {
    const [action, approvalId, buttonCode] = callbackQuery.data.split(':');
    
    if (action === 'approve' || action === 'reject') {
        await processApprovalResponse(approvalId, callbackQuery.from.id, buttonCode, 'button');
    }
});
```

### Обработка текстовых сообщений
```javascript
bot.on('text', async (message) => {
    const text = message.text.toLowerCase();
    const approvalId = getActiveApprovalForUser(message.from.id);
    
    if (approvalId) {
        if (text.includes('согласовано')) {
            await processApprovalResponse(approvalId, message.from.id, 'approve', 'text', message.text);
        } else if (text.includes('не согласовано') || text.includes('отклонено')) {
            await processApprovalResponse(approvalId, message.from.id, 'reject', 'text', message.text);
        }
    }
});
```

---

## 🔐 Безопасность

### Аутентификация между компонентами
1. **Activity ↔ Backend-сервис**: HMAC подпись запросов
2. **Telegram ↔ Backend-сервис**: Проверка токена бота
3. **Backend-сервис ↔ Б24**: Проверка API токена

### Валидация данных
1. Проверка Telegram ID пользователя
2. Валидация маппинга Б24 ↔ Telegram
3. Проверка статуса согласования
4. Защита от повторных ответов

### Логирование
```javascript
const logger = {
    info: (message, data) => console.log(`[INFO] ${message}`, data),
    error: (message, error) => console.error(`[ERROR] ${message}`, error),
    security: (message, data) => console.log(`[SECURITY] ${message}`, data)
};
```

---

## 📊 Мониторинг и метрики

### Ключевые метрики
1. **Время ответа**: среднее время от отправки до ответа
2. **Процент согласований**: соотношение approve/reject
3. **Активность пользователей**: количество активных согласантов
4. **Ошибки**: количество неуспешных запросов

### Логи для анализа
```javascript
// Логирование каждого этапа
logger.info('Approval request created', { approvalId, assignees });
logger.info('Telegram message sent', { approvalId, telegramUserId });
logger.info('Approval response received', { approvalId, response, user });
logger.info('B24 event triggered', { approvalId, result });
```

---

## 🚀 Развертывание

### Требования к серверу
- **CPU**: 2+ ядра
- **RAM**: 4+ GB
- **Storage**: 20+ GB SSD
- **Network**: стабильное интернет-соединение
- **SSL**: обязателен для webhook

### Переменные окружения
```bash
# База данных
DB_HOST=localhost
DB_NAME=telegram_approval
DB_USER=approval_user
DB_PASSWORD=secure_password

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_WEBHOOK_URL=https://your-domain.com/api/v1/telegram/webhook

# Битрикс24
B24_API_TOKEN=your_api_token
B24_WEBHOOK_URL=https://your-b24-domain.com/rest/1/your_webhook

# Безопасность
API_SECRET_KEY=your_secret_key
HMAC_SECRET=your_hmac_secret
```

### Процесс развертывания
1. Настройка сервера и SSL
2. Установка Node.js и MySQL
3. Развертывание backend-сервиса
4. Настройка Telegram Bot webhook
5. Установка PHP-модуля в Б24
6. Тестирование интеграции
