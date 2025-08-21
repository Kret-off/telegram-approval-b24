# 🗄 Схема базы данных
## Кастомное Activity «Согласование через Telegram» для Битрикс24

---

## 📋 Общие принципы

### 1.1 Технологии
- **СУБД:** MySQL 8.0+
- **Кодировка:** UTF8MB4
- **Движок:** InnoDB
- **Версионирование:** Миграции

### 1.2 Соглашения
- **Имена таблиц:** snake_case, множественное число
- **Имена полей:** snake_case
- **Первичные ключи:** `id` (AUTO_INCREMENT)
- **Внешние ключи:** `{table_name}_id`
- **Временные метки:** `created_at`, `updated_at`
- **Мягкое удаление:** `deleted_at`

---

## 🏗 Структура таблиц

### 2.1 Таблица `approval_requests`

**Назначение:** Основная таблица для хранения запросов на согласование

```sql
CREATE TABLE approval_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Идентификаторы Б24
    b24_activity_id VARCHAR(255) NOT NULL,
    b24_process_id VARCHAR(255) NOT NULL,
    b24_document_id VARCHAR(255) NOT NULL,
    b24_workflow_id VARCHAR(255) NOT NULL,
    
    -- Настройки сообщения
    message_text TEXT NOT NULL,
    button1_text VARCHAR(100) NOT NULL,
    button1_code VARCHAR(50) NOT NULL,
    button2_text VARCHAR(100) NOT NULL,
    button2_code VARCHAR(50) NOT NULL,
    
    -- Настройки согласования
    approval_mode ENUM('single', 'multiple_wait_all', 'multiple_first') NOT NULL DEFAULT 'single',
    timeout_hours INT NOT NULL DEFAULT 24,
    allow_text_responses BOOLEAN NOT NULL DEFAULT TRUE,
    require_confirmation BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Статус и результат
    status ENUM('pending', 'approved', 'rejected', 'timeout', 'cancelled') NOT NULL DEFAULT 'pending',
    result_code ENUM('approve', 'reject', 'timeout') NULL,
    result_label VARCHAR(255) NULL,
    result_comment TEXT NULL,
    responded_by VARCHAR(255) NULL,
    responded_at TIMESTAMP NULL,
    
    -- Метаданные
    document_type ENUM('contract', 'invoice', 'proposal', 'other') NULL,
    priority ENUM('low', 'normal', 'high', 'urgent') NOT NULL DEFAULT 'normal',
    tags JSON NULL,
    
    -- Временные метки
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP NULL,
    
    -- Индексы
    INDEX idx_b24_activity (b24_activity_id),
    INDEX idx_b24_process (b24_process_id),
    INDEX idx_b24_document (b24_document_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_expires_at (expires_at),
    INDEX idx_approval_mode (approval_mode),
    INDEX idx_document_type (document_type),
    INDEX idx_priority (priority),
    
    -- Ограничения
    CHECK (timeout_hours >= 1 AND timeout_hours <= 168),
    CHECK (button1_code != button2_code)
);
```

### 2.2 Таблица `approval_assignees`

**Назначение:** Согласанты для каждого запроса на согласование

```sql
CREATE TABLE approval_assignees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Связь с запросом
    approval_request_id INT NOT NULL,
    
    -- Пользователи
    b24_user_id INT NOT NULL,
    telegram_user_id BIGINT NOT NULL,
    telegram_username VARCHAR(100) NULL,
    b24_user_name VARCHAR(255) NULL,
    
    -- Статус ответа
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    responded_at TIMESTAMP NULL,
    
    -- Детали ответа
    response_text TEXT NULL,
    response_type ENUM('button', 'text') NULL,
    response_analysis JSON NULL,
    response_confidence DECIMAL(3,2) NULL,
    response_processed_at TIMESTAMP NULL,
    
    -- Telegram сообщение
    telegram_message_id INT NULL,
    telegram_chat_id BIGINT NULL,
    
    -- Временные метки
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    -- Индексы
    INDEX idx_approval_request (approval_request_id),
    INDEX idx_b24_user (b24_user_id),
    INDEX idx_telegram_user (telegram_user_id),
    INDEX idx_status (status),
    INDEX idx_responded_at (responded_at),
    INDEX idx_telegram_message (telegram_message_id),
    
    -- Внешние ключи
    FOREIGN KEY (approval_request_id) REFERENCES approval_requests(id) ON DELETE CASCADE,
    
    -- Ограничения
    CHECK (response_confidence >= 0 AND response_confidence <= 1)
);
```

### 2.3 Таблица `user_telegram_mapping`

**Назначение:** Связь пользователей Б24 с Telegram

```sql
CREATE TABLE user_telegram_mapping (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Пользователи
    b24_user_id INT NOT NULL,
    telegram_user_id BIGINT NOT NULL,
    telegram_username VARCHAR(100) NULL,
    b24_user_name VARCHAR(255) NULL,
    
    -- Статус
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verification_token VARCHAR(255) NULL,
    verification_expires_at TIMESTAMP NULL,
    
    -- Статистика
    last_activity_at TIMESTAMP NULL,
    total_approvals INT NOT NULL DEFAULT 0,
    successful_approvals INT NOT NULL DEFAULT 0,
    
    -- Временные метки
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    -- Индексы
    UNIQUE KEY unique_b24_user (b24_user_id),
    UNIQUE KEY unique_telegram_user (telegram_user_id),
    INDEX idx_b24_user (b24_user_id),
    INDEX idx_telegram_user (telegram_user_id),
    INDEX idx_telegram_username (telegram_username),
    INDEX idx_is_active (is_active),
    INDEX idx_is_verified (is_verified),
    INDEX idx_last_activity (last_activity_at),
    
    -- Ограничения
    CHECK (total_approvals >= 0),
    CHECK (successful_approvals >= 0),
    CHECK (successful_approvals <= total_approvals)
);
```

### 2.4 Таблица `approval_logs`

**Назначение:** Логирование всех действий с согласованиями

```sql
CREATE TABLE approval_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Связи
    approval_request_id INT NULL,
    approval_assignee_id INT NULL,
    user_telegram_mapping_id INT NULL,
    
    -- Действие
    action VARCHAR(100) NOT NULL,
    action_type ENUM('create', 'send', 'receive', 'process', 'complete', 'timeout', 'cancel', 'error') NOT NULL,
    
    -- Данные
    data_before JSON NULL,
    data_after JSON NULL,
    error_message TEXT NULL,
    
    -- Контекст
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    request_id VARCHAR(255) NULL,
    
    -- Временные метки
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Индексы
    INDEX idx_approval_request (approval_request_id),
    INDEX idx_approval_assignee (approval_assignee_id),
    INDEX idx_user_mapping (user_telegram_mapping_id),
    INDEX idx_action (action),
    INDEX idx_action_type (action_type),
    INDEX idx_created_at (created_at),
    INDEX idx_request_id (request_id),
    
    -- Внешние ключи
    FOREIGN KEY (approval_request_id) REFERENCES approval_requests(id) ON DELETE SET NULL,
    FOREIGN KEY (approval_assignee_id) REFERENCES approval_assignees(id) ON DELETE SET NULL,
    FOREIGN KEY (user_telegram_mapping_id) REFERENCES user_telegram_mapping(id) ON DELETE SET NULL
);
```

### 2.5 Таблица `telegram_messages`

**Назначение:** Кэш отправленных сообщений в Telegram

```sql
CREATE TABLE telegram_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Связи
    approval_request_id INT NOT NULL,
    approval_assignee_id INT NOT NULL,
    
    -- Telegram данные
    telegram_message_id INT NOT NULL,
    telegram_chat_id BIGINT NOT NULL,
    telegram_user_id BIGINT NOT NULL,
    
    -- Содержимое
    message_text TEXT NOT NULL,
    inline_keyboard JSON NULL,
    message_type ENUM('initial', 'reminder', 'confirmation', 'completion', 'timeout') NOT NULL,
    
    -- Статус
    is_sent BOOLEAN NOT NULL DEFAULT FALSE,
    sent_at TIMESTAMP NULL,
    error_message TEXT NULL,
    
    -- Временные метки
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Индексы
    INDEX idx_approval_request (approval_request_id),
    INDEX idx_approval_assignee (approval_assignee_id),
    INDEX idx_telegram_message (telegram_message_id),
    INDEX idx_telegram_chat (telegram_chat_id),
    INDEX idx_telegram_user (telegram_user_id),
    INDEX idx_message_type (message_type),
    INDEX idx_is_sent (is_sent),
    INDEX idx_sent_at (sent_at),
    
    -- Внешние ключи
    FOREIGN KEY (approval_request_id) REFERENCES approval_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (approval_assignee_id) REFERENCES approval_assignees(id) ON DELETE CASCADE
);
```

### 2.6 Таблица `system_settings`

**Назначение:** Настройки системы

```sql
CREATE TABLE system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Ключ и значение
    setting_key VARCHAR(255) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    setting_type ENUM('string', 'integer', 'boolean', 'json', 'text') NOT NULL DEFAULT 'string',
    
    -- Метаданные
    description TEXT NULL,
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    is_required BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Временные метки
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Индексы
    INDEX idx_setting_key (setting_key),
    INDEX idx_is_public (is_public),
    INDEX idx_is_required (is_required)
);
```

---

## 🔧 Миграции

### 3.1 Создание таблиц

```sql
-- Миграция 001: Создание основных таблиц
-- Файл: migrations/001_create_main_tables.sql

-- Создание таблицы approval_requests
CREATE TABLE approval_requests (
    -- ... (полная структура из раздела 2.1)
);

-- Создание таблицы approval_assignees
CREATE TABLE approval_assignees (
    -- ... (полная структура из раздела 2.2)
);

-- Создание таблицы user_telegram_mapping
CREATE TABLE user_telegram_mapping (
    -- ... (полная структура из раздела 2.3)
);
```

### 3.2 Добавление индексов

```sql
-- Миграция 002: Оптимизация индексов
-- Файл: migrations/002_add_performance_indexes.sql

-- Составные индексы для быстрого поиска
CREATE INDEX idx_approval_status_created ON approval_requests(status, created_at);
CREATE INDEX idx_assignee_status_responded ON approval_assignees(status, responded_at);
CREATE INDEX idx_mapping_active_verified ON user_telegram_mapping(is_active, is_verified);

-- Индексы для статистики
CREATE INDEX idx_logs_action_created ON approval_logs(action_type, created_at);
CREATE INDEX idx_messages_type_sent ON telegram_messages(message_type, sent_at);
```

### 3.3 Добавление ограничений

```sql
-- Миграция 003: Добавление ограничений
-- Файл: migrations/003_add_constraints.sql

-- Проверка корректности данных
ALTER TABLE approval_requests 
ADD CONSTRAINT chk_timeout_hours 
CHECK (timeout_hours >= 1 AND timeout_hours <= 168);

ALTER TABLE approval_assignees 
ADD CONSTRAINT chk_response_confidence 
CHECK (response_confidence >= 0 AND response_confidence <= 1);

ALTER TABLE user_telegram_mapping 
ADD CONSTRAINT chk_approval_counts 
CHECK (successful_approvals <= total_approvals);
```

---

## 📊 Представления (Views)

### 4.1 Статистика согласований

```sql
CREATE VIEW v_approval_statistics AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_approvals,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_approvals,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_approvals,
    COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_approvals,
    COUNT(CASE WHEN status = 'timeout' THEN 1 END) as timeout_approvals,
    AVG(CASE WHEN responded_at IS NOT NULL 
        THEN TIMESTAMPDIFF(MINUTE, created_at, responded_at) 
        END) as avg_response_time_minutes
FROM approval_requests 
WHERE deleted_at IS NULL
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### 4.2 Активные согласования

```sql
CREATE VIEW v_active_approvals AS
SELECT 
    ar.id,
    ar.b24_activity_id,
    ar.b24_document_id,
    ar.approval_mode,
    ar.status,
    ar.created_at,
    ar.expires_at,
    COUNT(aa.id) as total_assignees,
    COUNT(CASE WHEN aa.status != 'pending' THEN 1 END) as responded_assignees,
    COUNT(CASE WHEN aa.status = 'approved' THEN 1 END) as approved_count,
    COUNT(CASE WHEN aa.status = 'rejected' THEN 1 END) as rejected_count
FROM approval_requests ar
LEFT JOIN approval_assignees aa ON ar.id = aa.approval_request_id
WHERE ar.deleted_at IS NULL 
    AND ar.status = 'pending'
    AND ar.expires_at > NOW()
GROUP BY ar.id;
```

### 4.3 Статистика пользователей

```sql
CREATE VIEW v_user_statistics AS
SELECT 
    utm.b24_user_id,
    utm.b24_user_name,
    utm.telegram_username,
    utm.total_approvals,
    utm.successful_approvals,
    ROUND(utm.successful_approvals / NULLIF(utm.total_approvals, 0) * 100, 2) as success_rate,
    utm.last_activity_at,
    COUNT(DISTINCT ar.id) as active_approvals,
    AVG(CASE WHEN aa.responded_at IS NOT NULL 
        THEN TIMESTAMPDIFF(MINUTE, ar.created_at, aa.responded_at) 
        END) as avg_response_time_minutes
FROM user_telegram_mapping utm
LEFT JOIN approval_assignees aa ON utm.b24_user_id = aa.b24_user_id
LEFT JOIN approval_requests ar ON aa.approval_request_id = ar.id 
    AND ar.status = 'pending' 
    AND ar.expires_at > NOW()
WHERE utm.deleted_at IS NULL AND utm.is_active = TRUE
GROUP BY utm.id;
```

---

## 🔄 Процедуры и функции

### 5.1 Процедура создания согласования

```sql
DELIMITER //

CREATE PROCEDURE CreateApproval(
    IN p_b24_activity_id VARCHAR(255),
    IN p_b24_process_id VARCHAR(255),
    IN p_b24_document_id VARCHAR(255),
    IN p_b24_workflow_id VARCHAR(255),
    IN p_message_text TEXT,
    IN p_button1_text VARCHAR(100),
    IN p_button1_code VARCHAR(50),
    IN p_button2_text VARCHAR(100),
    IN p_button2_code VARCHAR(50),
    IN p_approval_mode ENUM('single', 'multiple_wait_all', 'multiple_first'),
    IN p_timeout_hours INT,
    IN p_assignees JSON
)
BEGIN
    DECLARE v_approval_id INT;
    DECLARE v_expires_at TIMESTAMP;
    DECLARE v_assignee_count INT DEFAULT 0;
    DECLARE v_assignee_index INT DEFAULT 0;
    DECLARE v_b24_user_id INT;
    DECLARE v_telegram_user_id BIGINT;
    
    -- Проверка входных данных
    IF p_timeout_hours < 1 OR p_timeout_hours > 168 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid timeout_hours value';
    END IF;
    
    -- Установка времени истечения
    SET v_expires_at = DATE_ADD(NOW(), INTERVAL p_timeout_hours HOUR);
    
    -- Создание записи согласования
    INSERT INTO approval_requests (
        b24_activity_id, b24_process_id, b24_document_id, b24_workflow_id,
        message_text, button1_text, button1_code, button2_text, button2_code,
        approval_mode, timeout_hours, expires_at
    ) VALUES (
        p_b24_activity_id, p_b24_process_id, p_b24_document_id, p_b24_workflow_id,
        p_message_text, p_button1_text, p_button1_code, p_button2_text, p_button2_code,
        p_approval_mode, p_timeout_hours, v_expires_at
    );
    
    SET v_approval_id = LAST_INSERT_ID();
    
    -- Добавление согласантов
    SET v_assignee_count = JSON_LENGTH(p_assignees);
    
    WHILE v_assignee_index < v_assignee_count DO
        SET v_b24_user_id = JSON_EXTRACT(p_assignees, CONCAT('$[', v_assignee_index, '].b24_user_id'));
        SET v_telegram_user_id = JSON_EXTRACT(p_assignees, CONCAT('$[', v_assignee_index, '].telegram_user_id'));
        
        INSERT INTO approval_assignees (
            approval_request_id, b24_user_id, telegram_user_id
        ) VALUES (
            v_approval_id, v_b24_user_id, v_telegram_user_id
        );
        
        SET v_assignee_index = v_assignee_index + 1;
    END WHILE;
    
    -- Возврат ID созданного согласования
    SELECT v_approval_id as approval_id;
END //

DELIMITER ;
```

### 5.2 Функция проверки статуса согласования

```sql
DELIMITER //

CREATE FUNCTION GetApprovalStatus(p_approval_id INT) 
RETURNS ENUM('pending', 'approved', 'rejected', 'timeout', 'cancelled')
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE v_status ENUM('pending', 'approved', 'rejected', 'timeout', 'cancelled');
    DECLARE v_approval_mode ENUM('single', 'multiple_wait_all', 'multiple_first');
    DECLARE v_expires_at TIMESTAMP;
    DECLARE v_total_assignees INT;
    DECLARE v_responded_assignees INT;
    DECLARE v_approved_count INT;
    DECLARE v_rejected_count INT;
    
    -- Получение основной информации
    SELECT status, approval_mode, expires_at
    INTO v_status, v_approval_mode, v_expires_at
    FROM approval_requests 
    WHERE id = p_approval_id AND deleted_at IS NULL;
    
    -- Если согласование уже завершено
    IF v_status != 'pending' THEN
        RETURN v_status;
    END IF;
    
    -- Проверка таймаута
    IF v_expires_at < NOW() THEN
        UPDATE approval_requests SET status = 'timeout' WHERE id = p_approval_id;
        RETURN 'timeout';
    END IF;
    
    -- Подсчет ответов
    SELECT 
        COUNT(*),
        COUNT(CASE WHEN status != 'pending' THEN 1 END),
        COUNT(CASE WHEN status = 'approved' THEN 1 END),
        COUNT(CASE WHEN status = 'rejected' THEN 1 END)
    INTO v_total_assignees, v_responded_assignees, v_approved_count, v_rejected_count
    FROM approval_assignees 
    WHERE approval_request_id = p_approval_id;
    
    -- Логика для разных режимов
    CASE v_approval_mode
        WHEN 'single' THEN
            IF v_responded_assignees > 0 THEN
                IF v_approved_count > 0 THEN
                    UPDATE approval_requests SET status = 'approved' WHERE id = p_approval_id;
                    RETURN 'approved';
                ELSE
                    UPDATE approval_requests SET status = 'rejected' WHERE id = p_approval_id;
                    RETURN 'rejected';
                END IF;
            END IF;
            
        WHEN 'multiple_first' THEN
            IF v_responded_assignees > 0 THEN
                IF v_approved_count > 0 THEN
                    UPDATE approval_requests SET status = 'approved' WHERE id = p_approval_id;
                    RETURN 'approved';
                ELSE
                    UPDATE approval_requests SET status = 'rejected' WHERE id = p_approval_id;
                    RETURN 'rejected';
                END IF;
            END IF;
            
        WHEN 'multiple_wait_all' THEN
            IF v_responded_assignees = v_total_assignees THEN
                IF v_rejected_count > 0 THEN
                    UPDATE approval_requests SET status = 'rejected' WHERE id = p_approval_id;
                    RETURN 'rejected';
                ELSE
                    UPDATE approval_requests SET status = 'approved' WHERE id = p_approval_id;
                    RETURN 'approved';
                END IF;
            END IF;
    END CASE;
    
    RETURN 'pending';
END //

DELIMITER ;
```

---

## 📈 Оптимизация производительности

### 6.1 Партиционирование

```sql
-- Партиционирование таблицы логов по дате
ALTER TABLE approval_logs 
PARTITION BY RANGE (YEAR(created_at)) (
    PARTITION p2024 VALUES LESS THAN (2025),
    PARTITION p2025 VALUES LESS THAN (2026),
    PARTITION p2026 VALUES LESS THAN (2027),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);
```

### 6.2 Архивирование

```sql
-- Создание архивированной таблицы
CREATE TABLE approval_logs_archive LIKE approval_logs;

-- Процедура архивирования старых логов
DELIMITER //

CREATE PROCEDURE ArchiveOldLogs(IN p_days_old INT)
BEGIN
    INSERT INTO approval_logs_archive 
    SELECT * FROM approval_logs 
    WHERE created_at < DATE_SUB(NOW(), INTERVAL p_days_old DAY);
    
    DELETE FROM approval_logs 
    WHERE created_at < DATE_SUB(NOW(), INTERVAL p_days_old DAY);
END //

DELIMITER ;
```

---

## 🔐 Безопасность

### 7.1 Шифрование чувствительных данных

```sql
-- Функция шифрования
DELIMITER //

CREATE FUNCTION EncryptData(p_data TEXT, p_key VARCHAR(255))
RETURNS TEXT
DETERMINISTIC
BEGIN
    RETURN AES_ENCRYPT(p_data, p_key);
END //

CREATE FUNCTION DecryptData(p_encrypted_data TEXT, p_key VARCHAR(255))
RETURNS TEXT
DETERMINISTIC
BEGIN
    RETURN AES_DECRYPT(p_encrypted_data, p_key);
END //

DELIMITER ;

-- Применение шифрования к чувствительным полям
ALTER TABLE approval_assignees 
ADD COLUMN response_text_encrypted TEXT NULL,
ADD COLUMN response_analysis_encrypted TEXT NULL;
```

### 7.2 Права доступа

```sql
-- Создание пользователей с ограниченными правами
CREATE USER 'approval_app'@'localhost' IDENTIFIED BY 'secure_password';
CREATE USER 'approval_readonly'@'localhost' IDENTIFIED BY 'readonly_password';

-- Права для приложения
GRANT SELECT, INSERT, UPDATE, DELETE ON approval_system.* TO 'approval_app'@'localhost';

-- Права для чтения (статистика, мониторинг)
GRANT SELECT ON approval_system.* TO 'approval_readonly'@'localhost';
GRANT SELECT ON approval_system.v_approval_statistics TO 'approval_readonly'@'localhost';
GRANT SELECT ON approval_system.v_user_statistics TO 'approval_readonly'@'localhost';
```

---

## 🎯 Следующие шаги

1. **Создать SQL-скрипты для миграций**
2. **Настроить автоматическое резервное копирование**
3. **Создать тестовые данные**
4. **Настроить мониторинг производительности**
