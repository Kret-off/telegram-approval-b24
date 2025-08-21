# 🔌 JSON-схемы для обмена данными
## Кастомное Activity «Согласование через Telegram» для Битрикс24

---

## 📋 Общие принципы

### 1.1 Стандарты
- **Формат:** JSON
- **Кодировка:** UTF-8
- **Версионирование:** API v1
- **Даты:** ISO 8601 (YYYY-MM-DDTHH:mm:ssZ)
- **Идентификаторы:** UUID v4 для внутренних ID

### 1.2 Общие заголовки
```http
Content-Type: application/json
Authorization: Bearer {api_token}
X-B24-Signature: {hmac_signature}
X-Request-ID: {uuid}
X-Timestamp: {iso_timestamp}
```

---

## 🔄 API контракты

### 2.1 Создание запроса на согласование

#### Запрос: `POST /api/v1/approval/create`

**Схема запроса:**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["b24_activity_id", "b24_process_id", "b24_document_id", "assignees", "message", "settings"],
  "properties": {
    "b24_activity_id": {
      "type": "string",
      "description": "Уникальный идентификатор Activity в Б24",
      "pattern": "^[a-zA-Z0-9_-]+$",
      "maxLength": 255
    },
    "b24_process_id": {
      "type": "string", 
      "description": "Идентификатор бизнес-процесса в Б24",
      "pattern": "^[a-zA-Z0-9_-]+$",
      "maxLength": 255
    },
    "b24_document_id": {
      "type": "string",
      "description": "Идентификатор документа для согласования",
      "pattern": "^[a-zA-Z0-9_-]+$", 
      "maxLength": 255
    },
    "assignees": {
      "type": "array",
      "description": "Список согласантов",
      "minItems": 1,
      "maxItems": 10,
      "items": {
        "type": "object",
        "required": ["b24_user_id", "telegram_user_id"],
        "properties": {
          "b24_user_id": {
            "type": "integer",
            "description": "ID пользователя в Б24",
            "minimum": 1
          },
          "telegram_user_id": {
            "type": "integer",
            "description": "ID пользователя в Telegram",
            "minimum": 1
          },
          "telegram_username": {
            "type": "string",
            "description": "Username в Telegram (опционально)",
            "pattern": "^@?[a-zA-Z0-9_]{5,32}$"
          }
        }
      }
    },
    "message": {
      "type": "object",
      "required": ["text", "button1", "button2"],
      "properties": {
        "text": {
          "type": "string",
          "description": "Текст сообщения с поддержкой подстановок",
          "minLength": 1,
          "maxLength": 4096
        },
        "button1": {
          "type": "object",
          "required": ["text", "code"],
          "properties": {
            "text": {
              "type": "string",
              "description": "Подпись кнопки согласования",
              "minLength": 1,
              "maxLength": 64
            },
            "code": {
              "type": "string",
              "description": "Код кнопки согласования",
              "pattern": "^[a-zA-Z0-9_-]+$",
              "maxLength": 32
            }
          }
        },
        "button2": {
          "type": "object",
          "required": ["text", "code"],
          "properties": {
            "text": {
              "type": "string",
              "description": "Подпись кнопки отклонения",
              "minLength": 1,
              "maxLength": 64
            },
            "code": {
              "type": "string",
              "description": "Код кнопки отклонения",
              "pattern": "^[a-zA-Z0-9_-]+$",
              "maxLength": 32
            }
          }
        }
      }
    },
    "settings": {
      "type": "object",
      "required": ["approval_mode"],
      "properties": {
        "approval_mode": {
          "type": "string",
          "description": "Режим работы с несколькими согласантами",
          "enum": ["single", "multiple_wait_all", "multiple_first"]
        },
        "timeout_hours": {
          "type": "integer",
          "description": "Таймаут в часах",
          "minimum": 1,
          "maximum": 168,
          "default": 24
        },
        "allow_text_responses": {
          "type": "boolean",
          "description": "Разрешить текстовые ответы",
          "default": true
        },
        "require_confirmation": {
          "type": "boolean",
          "description": "Требовать подтверждение текстовых ответов",
          "default": false
        }
      }
    },
    "metadata": {
      "type": "object",
      "description": "Дополнительные метаданные",
      "properties": {
        "document_type": {
          "type": "string",
          "description": "Тип документа",
          "enum": ["contract", "invoice", "proposal", "other"]
        },
        "priority": {
          "type": "string",
          "description": "Приоритет согласования",
          "enum": ["low", "normal", "high", "urgent"],
          "default": "normal"
        },
        "tags": {
          "type": "array",
          "description": "Теги для категоризации",
          "items": {
            "type": "string",
            "maxLength": 50
          }
        }
      }
    }
  }
}
```

**Пример запроса:**
```json
{
  "b24_activity_id": "activity_123",
  "b24_process_id": "process_456",
  "b24_document_id": "doc_789",
  "assignees": [
    {
      "b24_user_id": 123,
      "telegram_user_id": 456789012,
      "telegram_username": "@ivan_ivanov"
    },
    {
      "b24_user_id": 124,
      "telegram_user_id": 456789013,
      "telegram_username": "@petr_petrov"
    }
  ],
  "message": {
    "text": "Согласуйте документ {=Document:ID} \"{=Document:TITLE}\"",
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
    "approval_mode": "multiple_wait_all",
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
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["success", "approval_id"],
  "properties": {
    "success": {
      "type": "boolean",
      "description": "Успешность операции"
    },
    "approval_id": {
      "type": "string",
      "description": "Уникальный идентификатор согласования",
      "format": "uuid"
    },
    "message": {
      "type": "string",
      "description": "Сообщение о результате"
    },
    "assignees_status": {
      "type": "array",
      "description": "Статус отправки сообщений согласантам",
      "items": {
        "type": "object",
        "required": ["b24_user_id", "telegram_user_id", "status"],
        "properties": {
          "b24_user_id": {
            "type": "integer"
          },
          "telegram_user_id": {
            "type": "integer"
          },
          "status": {
            "type": "string",
            "enum": ["sent", "failed", "user_not_found"]
          },
          "error_message": {
            "type": "string"
          }
        }
      }
    },
    "created_at": {
      "type": "string",
      "format": "date-time",
      "description": "Время создания согласования"
    },
    "expires_at": {
      "type": "string", 
      "format": "date-time",
      "description": "Время истечения согласования"
    }
  }
}
```

**Пример ответа:**
```json
{
  "success": true,
  "approval_id": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Approval request created successfully",
  "assignees_status": [
    {
      "b24_user_id": 123,
      "telegram_user_id": 456789012,
      "status": "sent"
    },
    {
      "b24_user_id": 124,
      "telegram_user_id": 456789013,
      "status": "sent"
    }
  ],
  "created_at": "2024-01-15T14:30:00Z",
  "expires_at": "2024-01-16T14:30:00Z"
}
```

### 2.2 Получение статуса согласования

#### Запрос: `GET /api/v1/approval/{approval_id}/status`

**Схема ответа:**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["approval_id", "status", "assignees"],
  "properties": {
    "approval_id": {
      "type": "string",
      "format": "uuid"
    },
    "b24_activity_id": {
      "type": "string"
    },
    "status": {
      "type": "string",
      "enum": ["pending", "approved", "rejected", "timeout"]
    },
    "approval_mode": {
      "type": "string",
      "enum": ["single", "multiple_wait_all", "multiple_first"]
    },
    "assignees": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["b24_user_id", "telegram_user_id", "status"],
        "properties": {
          "b24_user_id": {
            "type": "integer"
          },
          "telegram_user_id": {
            "type": "integer"
          },
          "telegram_username": {
            "type": "string"
          },
          "status": {
            "type": "string",
            "enum": ["pending", "approved", "rejected"]
          },
          "responded_at": {
            "type": "string",
            "format": "date-time"
          },
          "response_text": {
            "type": "string"
          },
          "response_type": {
            "type": "string",
            "enum": ["button", "text"]
          }
        }
      }
    },
    "created_at": {
      "type": "string",
      "format": "date-time"
    },
    "expires_at": {
      "type": "string",
      "format": "date-time"
    },
    "result": {
      "type": "object",
      "properties": {
        "code": {
          "type": "string",
          "enum": ["approve", "reject", "timeout"]
        },
        "label": {
          "type": "string"
        },
        "comment": {
          "type": "string"
        },
        "responded_by": {
          "type": "string"
        },
        "responded_at": {
          "type": "string",
          "format": "date-time"
        }
      }
    }
  }
}
```

### 2.3 Отмена согласования

#### Запрос: `POST /api/v1/approval/{approval_id}/cancel`

**Схема запроса:**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["reason"],
  "properties": {
    "reason": {
      "type": "string",
      "description": "Причина отмены",
      "minLength": 1,
      "maxLength": 500
    },
    "cancelled_by": {
      "type": "integer",
      "description": "ID пользователя Б24, отменившего согласование"
    }
  }
}
```

---

## 🤖 Telegram Webhook

### 3.1 Webhook от Telegram Bot API

#### Запрос: `POST /api/v1/telegram/webhook`

**Схема callback_query (нажатие кнопки):**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["update_id", "callback_query"],
  "properties": {
    "update_id": {
      "type": "integer"
    },
    "callback_query": {
      "type": "object",
      "required": ["id", "from", "data"],
      "properties": {
        "id": {
          "type": "string"
        },
        "from": {
          "type": "object",
          "required": ["id", "username"],
          "properties": {
            "id": {
              "type": "integer"
            },
            "username": {
              "type": "string"
            },
            "first_name": {
              "type": "string"
            },
            "last_name": {
              "type": "string"
            }
          }
        },
        "data": {
          "type": "string",
          "description": "Формат: action:approval_id:button_code",
          "pattern": "^[a-zA-Z]+:[a-f0-9-]+:[a-zA-Z0-9_-]+$"
        },
        "message": {
          "type": "object",
          "properties": {
            "message_id": {
              "type": "integer"
            },
            "chat": {
              "type": "object",
              "properties": {
                "id": {
                  "type": "integer"
                },
                "type": {
                  "type": "string"
                }
              }
            }
          }
        }
      }
    }
  }
}
```

**Пример callback_query:**
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

**Схема text message (текстовый ответ):**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["update_id", "message"],
  "properties": {
    "update_id": {
      "type": "integer"
    },
    "message": {
      "type": "object",
      "required": ["message_id", "from", "text"],
      "properties": {
        "message_id": {
          "type": "integer"
        },
        "from": {
          "type": "object",
          "required": ["id", "username"],
          "properties": {
            "id": {
              "type": "integer"
            },
            "username": {
              "type": "string"
            },
            "first_name": {
              "type": "string"
            },
            "last_name": {
              "type": "string"
            }
          }
        },
        "text": {
          "type": "string",
          "minLength": 1,
          "maxLength": 4096
        },
        "chat": {
          "type": "object",
          "properties": {
            "id": {
              "type": "integer"
            },
            "type": {
              "type": "string"
            }
          }
        },
        "date": {
          "type": "integer"
        }
      }
    }
  }
}
```

**Пример text message:**
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
  "processed": true,
  "approval_id": "550e8400-e29b-41d4-a716-446655440000",
  "response": {
    "intent": "approve",
    "confidence": 1.0,
    "type": "button"
  }
}
```

---

## 🔄 OnExternalEvent для Битрикс24

### 4.1 Вызов OnExternalEvent

**Параметры события:**
```php
$arEventParameters = array(
    'ACTIVITY_ID' => 'activity_123',
    'RESULT_CODE' => 'approve|reject|timeout',
    'RESULT_LABEL' => 'Согласовано|Не согласовано|Время истекло',
    'COMMENT' => 'Текст ответа или комментарий',
    'RESPONDED_BY' => 'Иван Иванов',
    'RESPONDED_AT' => '2024-01-15T14:30:00Z',
    'APPROVAL_ID' => '550e8400-e29b-41d4-a716-446655440000',
    'RESPONSE_TYPE' => 'button|text',
    'CONFIDENCE' => 1.0,
    'ASSIGNEES_COUNT' => 2,
    'RESPONDED_COUNT' => 1,
    'APPROVAL_MODE' => 'single|multiple_wait_all|multiple_first'
);
```

**JSON-схема для OnExternalEvent:**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["ACTIVITY_ID", "RESULT_CODE", "RESULT_LABEL", "RESPONDED_BY", "RESPONDED_AT", "APPROVAL_ID"],
  "properties": {
    "ACTIVITY_ID": {
      "type": "string",
      "description": "ID Activity в Б24"
    },
    "RESULT_CODE": {
      "type": "string",
      "enum": ["approve", "reject", "timeout"],
      "description": "Код результата"
    },
    "RESULT_LABEL": {
      "type": "string",
      "description": "Человекочитаемая метка результата"
    },
    "COMMENT": {
      "type": "string",
      "description": "Комментарий или текст ответа"
    },
    "RESPONDED_BY": {
      "type": "string",
      "description": "ФИО ответившего"
    },
    "RESPONDED_AT": {
      "type": "string",
      "format": "date-time",
      "description": "Время ответа"
    },
    "APPROVAL_ID": {
      "type": "string",
      "format": "uuid",
      "description": "ID согласования"
    },
    "RESPONSE_TYPE": {
      "type": "string",
      "enum": ["button", "text"],
      "description": "Тип ответа"
    },
    "CONFIDENCE": {
      "type": "number",
      "minimum": 0,
      "maximum": 1,
      "description": "Уверенность в анализе текстового ответа"
    },
    "ASSIGNEES_COUNT": {
      "type": "integer",
      "minimum": 1,
      "description": "Общее количество согласантов"
    },
    "RESPONDED_COUNT": {
      "type": "integer",
      "minimum": 0,
      "description": "Количество ответивших"
    },
    "APPROVAL_MODE": {
      "type": "string",
      "enum": ["single", "multiple_wait_all", "multiple_first"],
      "description": "Режим согласования"
    },
    "DETAILS": {
      "type": "object",
      "description": "Детальная информация по согласантам",
      "properties": {
        "assignees": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "b24_user_id": {
                "type": "integer"
              },
              "status": {
                "type": "string",
                "enum": ["pending", "approved", "rejected"]
              },
              "responded_at": {
                "type": "string",
                "format": "date-time"
              },
              "response_text": {
                "type": "string"
              }
            }
          }
        }
      }
    }
  }
}
```

---

## 🛠 Управление пользователями

### 5.1 Получение маппинга пользователей

#### Запрос: `GET /api/v1/users/mapping`

**Схема ответа:**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["success", "mappings"],
  "properties": {
    "success": {
      "type": "boolean"
    },
    "mappings": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["b24_user_id", "telegram_user_id"],
        "properties": {
          "b24_user_id": {
            "type": "integer"
          },
          "telegram_user_id": {
            "type": "integer"
          },
          "telegram_username": {
            "type": "string"
          },
          "b24_user_name": {
            "type": "string"
          },
          "is_active": {
            "type": "boolean"
          },
          "created_at": {
            "type": "string",
            "format": "date-time"
          },
          "last_activity": {
            "type": "string",
            "format": "date-time"
          }
        }
      }
    }
  }
}
```

### 5.2 Добавление маппинга пользователя

#### Запрос: `POST /api/v1/users/mapping`

**Схема запроса:**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["b24_user_id", "telegram_user_id"],
  "properties": {
    "b24_user_id": {
      "type": "integer",
      "minimum": 1
    },
    "telegram_user_id": {
      "type": "integer",
      "minimum": 1
    },
    "telegram_username": {
      "type": "string",
      "pattern": "^@?[a-zA-Z0-9_]{5,32}$"
    },
    "b24_user_name": {
      "type": "string"
    }
  }
}
```

---

## 📊 Метрики и статистика

### 6.1 Получение статистики

#### Запрос: `GET /api/v1/statistics`

**Схема ответа:**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["success", "statistics"],
  "properties": {
    "success": {
      "type": "boolean"
    },
    "statistics": {
      "type": "object",
      "properties": {
        "total_approvals": {
          "type": "integer"
        },
        "pending_approvals": {
          "type": "integer"
        },
        "completed_approvals": {
          "type": "integer"
        },
        "response_times": {
          "type": "object",
          "properties": {
            "average_minutes": {
              "type": "number"
            },
            "median_minutes": {
              "type": "number"
            },
            "min_minutes": {
              "type": "number"
            },
            "max_minutes": {
              "type": "number"
            }
          }
        },
        "response_types": {
          "type": "object",
          "properties": {
            "button_responses": {
              "type": "integer"
            },
            "text_responses": {
              "type": "integer"
            }
          }
        },
        "results_distribution": {
          "type": "object",
          "properties": {
            "approved": {
              "type": "integer"
            },
            "rejected": {
              "type": "integer"
            },
            "timeout": {
              "type": "integer"
            }
          }
        }
      }
    }
  }
}
```

---

## 🚨 Обработка ошибок

### 7.1 Стандартная схема ошибки

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["success", "error"],
  "properties": {
    "success": {
      "type": "boolean",
      "const": false
    },
    "error": {
      "type": "object",
      "required": ["code", "message"],
      "properties": {
        "code": {
          "type": "string",
          "description": "Код ошибки"
        },
        "message": {
          "type": "string",
          "description": "Человекочитаемое сообщение об ошибке"
        },
        "details": {
          "type": "object",
          "description": "Детали ошибки"
        },
        "request_id": {
          "type": "string",
          "format": "uuid",
          "description": "ID запроса для отслеживания"
        }
      }
    }
  }
}
```

### 7.2 Коды ошибок

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
| `INTERNAL_ERROR` | 500 | Внутренняя ошибка сервера |

**Пример ошибки:**
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

---

## 🎯 Следующие шаги

1. **Реализовать валидацию JSON-схем**
2. **Создать тестовые данные для всех схем**
3. **Настроить обработку ошибок**
4. **Протестировать API контракты**
