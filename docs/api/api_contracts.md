# 🔌 API контракты
## Кастомное Activity «Согласование через Telegram» для Битрикс24

---

## 📋 Общие принципы API

### 1.1 Стандарты
- **Протокол:** HTTPS
- **Формат данных:** JSON
- **Кодировка:** UTF-8
- **Версионирование:** v1
- **Аутентификация:** Bearer Token + HMAC
- **Rate Limiting:** 100 запросов/минуту

### 1.2 Общие заголовки
```http
Content-Type: application/json
Authorization: Bearer {api_token}
X-B24-Signature: {hmac_signature}
X-Request-ID: {uuid}
X-Timestamp: {iso_timestamp}
X-API-Version: v1
```

### 1.3 Стандартные ответы
```json
{
  "success": true,
  "data": {},
  "meta": {
    "request_id": "uuid",
    "timestamp": "2024-01-15T14:30:00Z",
    "version": "v1"
  }
}
```

---

## 🔧 Backend-сервис API

### 2.1 Базовый URL
```
https://api.approval-service.com/v1
```

### 2.2 Аутентификация

#### Получение токена
```http
POST /auth/token
```

**Запрос:**
```json
{
  "client_id": "b24_activity",
  "client_secret": "secure_secret",
  "grant_type": "client_credentials"
}
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 3600,
    "scope": "approval:read approval:write"
  }
}
```

### 2.3 Согласования

#### Создание согласования
```http
POST /approvals
```

**Запрос:**
```json
{
  "b24_activity_id": "activity_123",
  "b24_process_id": "process_456",
  "b24_document_id": "doc_789",
  "b24_workflow_id": "workflow_101",
  "assignees": [
    {
      "b24_user_id": 123,
      "telegram_user_id": 456789012,
      "telegram_username": "@ivan_ivanov"
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
    "timeout_hours": 24,
    "allow_text_responses": true,
    "require_confirmation": false
  },
  "metadata": {
    "document_type": "contract",
    "priority": "high",
    "tags": ["договор", "поставка"]
  }
}
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "approval_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "pending",
    "assignees_status": [
      {
        "b24_user_id": 123,
        "telegram_user_id": 456789012,
        "status": "sent",
        "telegram_message_id": 12345
      }
    ],
    "created_at": "2024-01-15T14:30:00Z",
    "expires_at": "2024-01-16T14:30:00Z"
  }
}
```

#### Получение статуса согласования
```http
GET /approvals/{approval_id}
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "approval_id": "550e8400-e29b-41d4-a716-446655440000",
    "b24_activity_id": "activity_123",
    "status": "pending",
    "approval_mode": "single",
    "assignees": [
      {
        "b24_user_id": 123,
        "telegram_user_id": 456789012,
        "telegram_username": "@ivan_ivanov",
        "status": "pending",
        "responded_at": null,
        "response_text": null,
        "response_type": null
      }
    ],
    "created_at": "2024-01-15T14:30:00Z",
    "expires_at": "2024-01-16T14:30:00Z",
    "result": null
  }
}
```

#### Отмена согласования
```http
POST /approvals/{approval_id}/cancel
```

**Запрос:**
```json
{
  "reason": "Документ был изменен",
  "cancelled_by": 123
}
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "approval_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "cancelled",
    "cancelled_at": "2024-01-15T15:00:00Z",
    "cancelled_by": 123,
    "reason": "Документ был изменен"
  }
}
```

### 2.4 Пользователи

#### Получение маппинга пользователей
```http
GET /users/mapping
```

**Параметры запроса:**
- `active_only` (boolean) - только активные пользователи
- `verified_only` (boolean) - только верифицированные
- `limit` (integer) - количество записей
- `offset` (integer) - смещение

**Ответ:**
```json
{
  "success": true,
  "data": {
    "mappings": [
      {
        "b24_user_id": 123,
        "telegram_user_id": 456789012,
        "telegram_username": "@ivan_ivanov",
        "b24_user_name": "Иван Иванов",
        "is_active": true,
        "is_verified": true,
        "last_activity_at": "2024-01-15T14:30:00Z",
        "total_approvals": 15,
        "successful_approvals": 12
      }
    ],
    "pagination": {
      "total": 50,
      "limit": 20,
      "offset": 0,
      "has_more": true
    }
  }
}
```

#### Добавление маппинга пользователя
```http
POST /users/mapping
```

**Запрос:**
```json
{
  "b24_user_id": 124,
  "telegram_user_id": 456789013,
  "telegram_username": "@petr_petrov",
  "b24_user_name": "Петр Петров"
}
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "mapping_id": 2,
    "b24_user_id": 124,
    "telegram_user_id": 456789013,
    "is_verified": false,
    "verification_token": "abc123def456",
    "verification_expires_at": "2024-01-15T16:30:00Z"
  }
}
```

### 2.5 Статистика

#### Получение статистики
```http
GET /statistics
```

**Параметры запроса:**
- `date_from` (date) - начальная дата
- `date_to` (date) - конечная дата
- `group_by` (string) - группировка (day, week, month)

**Ответ:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_approvals": 150,
      "pending_approvals": 5,
      "completed_approvals": 145,
      "avg_response_time_minutes": 45.2
    },
    "response_times": {
      "average_minutes": 45.2,
      "median_minutes": 32.1,
      "min_minutes": 2.5,
      "max_minutes": 1440.0
    },
    "response_types": {
      "button_responses": 120,
      "text_responses": 25
    },
    "results_distribution": {
      "approved": 110,
      "rejected": 25,
      "timeout": 10
    },
    "by_date": [
      {
        "date": "2024-01-15",
        "total_approvals": 10,
        "approved": 8,
        "rejected": 1,
        "timeout": 1,
        "avg_response_time_minutes": 38.5
      }
    ]
  }
}
```

---

## 🤖 Telegram Bot API

### 3.1 Webhook endpoint
```http
POST /telegram/webhook
```

### 3.2 Обработка callback_query

**Входящий webhook:**
```json
{
  "update_id": 123456789,
  "callback_query": {
    "id": "callback_123",
    "from": {
      "id": 456789012,
      "username": "ivan_ivanov",
      "first_name": "Иван",
      "last_name": "Иванов"
    },
    "data": "approve:550e8400-e29b-41d4-a716-446655440000:approve",
    "message": {
      "message_id": 123,
      "chat": {
        "id": 456789012,
        "type": "private"
      }
    }
  }
}
```

**Ответ webhook:**
```json
{
  "success": true,
  "data": {
    "processed": true,
    "approval_id": "550e8400-e29b-41d4-a716-446655440000",
    "response": {
      "intent": "approve",
      "confidence": 1.0,
      "type": "button"
    },
    "message_updated": true
  }
}
```

### 3.3 Обработка текстового сообщения

**Входящий webhook:**
```json
{
  "update_id": 123456789,
  "message": {
    "message_id": 124,
    "from": {
      "id": 456789012,
      "username": "ivan_ivanov",
      "first_name": "Иван",
      "last_name": "Иванов"
    },
    "text": "Согласовано",
    "chat": {
      "id": 456789012,
      "type": "private"
    },
    "date": 1705321800
  }
}
```

**Ответ webhook:**
```json
{
  "success": true,
  "data": {
    "processed": true,
    "approval_id": "550e8400-e29b-41d4-a716-446655440000",
    "response": {
      "intent": "approve",
      "confidence": 1.0,
      "type": "text",
      "analysis": {
        "keywords": ["согласовано"],
        "score": 1.0
      }
    },
    "message_updated": true,
    "confirmation_required": false
  }
}
```

---

## 🔄 Битрикс24 API

### 4.1 OnExternalEvent

**Вызов из backend-сервиса:**
```http
POST https://your-b24-domain.com/rest/1/your_webhook/OnExternalEvent
```

**Запрос:**
```json
{
  "ACTIVITY_ID": "activity_123",
  "RESULT_CODE": "approve",
  "RESULT_LABEL": "Согласовано",
  "COMMENT": "Согласовано",
  "RESPONDED_BY": "Иван Иванов",
  "RESPONDED_AT": "2024-01-15T14:30:00Z",
  "APPROVAL_ID": "550e8400-e29b-41d4-a716-446655440000",
  "RESPONSE_TYPE": "button",
  "CONFIDENCE": 1.0,
  "ASSIGNEES_COUNT": 1,
  "RESPONDED_COUNT": 1,
  "APPROVAL_MODE": "single"
}
```

**Ответ:**
```json
{
  "result": true,
  "error": null
}
```

### 4.2 Получение пользователей Б24

**Запрос:**
```http
GET https://your-b24-domain.com/rest/user.get
```

**Ответ:**
```json
{
  "result": [
    {
      "ID": "123",
      "ACTIVE": true,
      "EMAIL": "ivan@company.com",
      "NAME": "Иван",
      "LAST_NAME": "Иванов",
      "SECOND_NAME": "",
      "PERSONAL_PHOTO": "",
      "PERSONAL_GENDER": "",
      "PERSONAL_PROFESSION": "",
      "PERSONAL_WWW": "",
      "PERSONAL_ICQ": "",
      "PERSONAL_FAX": "",
      "PERSONAL_MOBILE": "",
      "PERSONAL_PAGER": "",
      "PERSONAL_PHONE": "",
      "PERSONAL_BIRTHDAY": "",
      "PERSONAL_STREET": "",
      "PERSONAL_MAILBOX": "",
      "PERSONAL_CITY": "",
      "PERSONAL_STATE": "",
      "PERSONAL_ZIP": "",
      "PERSONAL_COUNTRY": "",
      "PERSONAL_NOTES": "",
      "WORK_COMPANY": "",
      "WORK_POSITION": "",
      "WORK_PHONE": "",
      "ADMIN_NOTES": "",
      "STORED_HASH": "",
      "XML_ID": "",
      "PERSONAL_BIRTHDATE": "",
      "EXTERNAL_AUTH_ID": "",
      "CHECKWORD": "",
      "CONFIRM_CODE": "",
      "LOGIN": "ivan.ivanov",
      "LID": "ru",
      "TIME_ZONE": "",
      "TIME_ZONE_OFFSET": "",
      "LAST_ACTIVITY_DATE": "2024-01-15T14:30:00+03:00",
      "UF_DEPARTMENT": ["1"],
      "UF_INTERESTS": "",
      "UF_SKILLS": "",
      "UF_WEB_SITES": "",
      "UF_XING": "",
      "UF_LINKEDIN": "",
      "UF_FACEBOOK": "",
      "UF_TWITTER": "",
      "UF_SKYPE": "",
      "UF_DISTRICT": "",
      "UF_PHONE_INNER": "",
      "UF_EMPLOYMENT_DATE": "",
      "UF_CRM_1634557308": "",
      "UF_CRM_1634557309": ""
    }
  ]
}
```

---

## 🔐 Аутентификация и безопасность

### 5.1 HMAC подпись

**Алгоритм:**
```javascript
const hmac = crypto.createHmac('sha256', secretKey);
hmac.update(JSON.stringify(requestBody) + timestamp);
const signature = hmac.digest('hex');
```

**Заголовок:**
```http
X-B24-Signature: sha256=abc123def456...
```

### 5.2 Валидация подписи

```javascript
function validateSignature(requestBody, timestamp, signature, secretKey) {
    const expectedSignature = crypto
        .createHmac('sha256', secretKey)
        .update(JSON.stringify(requestBody) + timestamp)
        .digest('hex');
    
    return crypto.timingSafeEqual(
        Buffer.from(signature.replace('sha256=', '')),
        Buffer.from(expectedSignature)
    );
}
```

### 5.3 Rate Limiting

**Заголовки ответа:**
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248600
```

**При превышении лимита:**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Try again in 60 seconds.",
    "retry_after": 60
  }
}
```

---

## 🚨 Обработка ошибок

### 6.1 Стандартная схема ошибки

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {
      "field": "field_name",
      "value": "invalid_value",
      "constraint": "validation_rule"
    },
    "request_id": "550e8400-e29b-41d4-a716-446655440001",
    "timestamp": "2024-01-15T14:30:00Z"
  }
}
```

### 6.2 Коды ошибок

| Код | HTTP Status | Описание |
|-----|-------------|----------|
| `VALIDATION_ERROR` | 400 | Ошибка валидации данных |
| `UNAUTHORIZED` | 401 | Неавторизованный доступ |
| `FORBIDDEN` | 403 | Доступ запрещен |
| `NOT_FOUND` | 404 | Ресурс не найден |
| `APPROVAL_NOT_FOUND` | 404 | Согласование не найдено |
| `USER_NOT_FOUND` | 404 | Пользователь не найден |
| `APPROVAL_EXPIRED` | 410 | Согласование истекло |
| `APPROVAL_COMPLETED` | 409 | Согласование уже завершено |
| `TELEGRAM_ERROR` | 502 | Ошибка Telegram API |
| `B24_ERROR` | 502 | Ошибка Битрикс24 API |
| `RATE_LIMIT_EXCEEDED` | 429 | Превышен лимит запросов |
| `INTERNAL_ERROR` | 500 | Внутренняя ошибка сервера |

### 6.3 Примеры ошибок

#### Ошибка валидации
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid approval mode",
    "details": {
      "field": "settings.approval_mode",
      "value": "invalid_mode",
      "allowed_values": ["single", "multiple_wait_all", "multiple_first"]
    },
    "request_id": "550e8400-e29b-41d4-a716-446655440001"
  }
}
```

#### Ошибка Telegram API
```json
{
  "success": false,
  "error": {
    "code": "TELEGRAM_ERROR",
    "message": "Failed to send message to Telegram",
    "details": {
      "telegram_error_code": 403,
      "telegram_description": "Forbidden: bot was blocked by the user"
    },
    "request_id": "550e8400-e29b-41d4-a716-446655440002"
  }
}
```

---

## 📊 Мониторинг и метрики

### 7.1 Health Check

```http
GET /health
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-15T14:30:00Z",
    "version": "1.0.0",
    "services": {
      "database": "healthy",
      "telegram": "healthy",
      "b24": "healthy"
    },
    "metrics": {
      "uptime_seconds": 86400,
      "total_requests": 1500,
      "error_rate": 0.02
    }
  }
}
```

### 7.2 Метрики API

```http
GET /metrics
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "requests": {
      "total": 1500,
      "successful": 1470,
      "failed": 30,
      "rate_per_minute": 25
    },
    "response_times": {
      "average_ms": 150,
      "p95_ms": 300,
      "p99_ms": 500
    },
    "errors": {
      "validation_error": 15,
      "telegram_error": 8,
      "b24_error": 7
    }
  }
}
```

---

## 🎯 Следующие шаги

1. **Реализовать валидацию API контрактов**
2. **Создать тестовые данные для API**
3. **Настроить мониторинг API**
4. **Документировать API в OpenAPI/Swagger**
