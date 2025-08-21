<?php
/**
 * Класс формы настроек Activity
 * 
 * @package TelegramApproval
 * @version 1.0.0
 */

if (!defined('B_PROLOG_INCLUDED') || B_PROLOG_INCLUDED !== true) {
    die();
}

use Bitrix\Main\Localization\Loc;

/**
 * Диалог настроек Activity
 */
class TelegramApprovalActivityDialog extends CBPActivityDialog
{
    /**
     * Конструктор
     */
    public function __construct($documentType, $activityName, $arWorkflowTemplate, $arWorkflowParameters, $arWorkflowVariables, $arCurrentValues = null, $formName = '', $popupWindow = null, $siteId = '')
    {
        parent::__construct($documentType, $activityName, $arWorkflowTemplate, $arWorkflowParameters, $arWorkflowVariables, $arCurrentValues, $formName, $popupWindow, $siteId);
    }

    /**
     * Получение HTML формы
     * 
     * @return string HTML формы
     */
    public function GetHTML()
    {
        $currentValues = $this->GetCurrentValues();
        
        ob_start();
        ?>
        <div class="telegram-approval-form">
            <!-- Название Activity -->
            <div class="form-group">
                <label for="Title"><?= Loc::getMessage('TELEGRAM_APPROVAL_TITLE') ?>:</label>
                <input type="text" 
                       id="Title" 
                       name="Title" 
                       value="<?= htmlspecialchars($currentValues['Title'] ?? '') ?>" 
                       class="form-control"
                       placeholder="<?= Loc::getMessage('TELEGRAM_APPROVAL_TITLE_PLACEHOLDER') ?>">
            </div>

            <!-- Согласанты -->
            <div class="form-group">
                <label for="Approvers"><?= Loc::getMessage('TELEGRAM_APPROVAL_APPROVERS') ?>: <span class="required">*</span></label>
                <textarea id="Approvers" 
                          name="Approvers" 
                          class="form-control" 
                          rows="3"
                          placeholder="<?= Loc::getMessage('TELEGRAM_APPROVAL_APPROVERS_PLACEHOLDER') ?>"><?= htmlspecialchars($currentValues['Approvers'] ?? '') ?></textarea>
                <small class="form-text text-muted">
                    <?= Loc::getMessage('TELEGRAM_APPROVAL_APPROVERS_HELP') ?>
                </small>
            </div>

            <!-- Текст сообщения -->
            <div class="form-group">
                <label for="MessageText"><?= Loc::getMessage('TELEGRAM_APPROVAL_MESSAGE_TEXT') ?>: <span class="required">*</span></label>
                <textarea id="MessageText" 
                          name="MessageText" 
                          class="form-control" 
                          rows="4"
                          placeholder="<?= Loc::getMessage('TELEGRAM_APPROVAL_MESSAGE_TEXT_PLACEHOLDER') ?>"><?= htmlspecialchars($currentValues['MessageText'] ?? '') ?></textarea>
                <small class="form-text text-muted">
                    <?= Loc::getMessage('TELEGRAM_APPROVAL_MESSAGE_TEXT_HELP') ?>
                </small>
            </div>

            <!-- Кнопки -->
            <div class="row">
                <div class="col-md-6">
                    <div class="form-group">
                        <label for="ButtonApprove"><?= Loc::getMessage('TELEGRAM_APPROVAL_BUTTON_APPROVE') ?>:</label>
                        <input type="text" 
                               id="ButtonApprove" 
                               name="ButtonApprove" 
                               value="<?= htmlspecialchars($currentValues['ButtonApprove'] ?? 'Согласовано') ?>" 
                               class="form-control">
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="form-group">
                        <label for="ButtonReject"><?= Loc::getMessage('TELEGRAM_APPROVAL_BUTTON_REJECT') ?>:</label>
                        <input type="text" 
                               id="ButtonReject" 
                               name="ButtonReject" 
                               value="<?= htmlspecialchars($currentValues['ButtonReject'] ?? 'Не согласовано') ?>" 
                               class="form-control">
                    </div>
                </div>
            </div>

            <!-- Режим работы -->
            <div class="form-group">
                <label for="Mode"><?= Loc::getMessage('TELEGRAM_APPROVAL_MODE') ?>:</label>
                <select id="Mode" name="Mode" class="form-control">
                    <option value="single" <?= ($currentValues['Mode'] ?? 'single') === 'single' ? 'selected' : '' ?>>
                        <?= Loc::getMessage('TELEGRAM_APPROVAL_MODE_SINGLE') ?>
                    </option>
                    <option value="multiple_wait_all" <?= ($currentValues['Mode'] ?? '') === 'multiple_wait_all' ? 'selected' : '' ?>>
                        <?= Loc::getMessage('TELEGRAM_APPROVAL_MODE_MULTIPLE_WAIT_ALL') ?>
                    </option>
                    <option value="multiple_first" <?= ($currentValues['Mode'] ?? '') === 'multiple_first' ? 'selected' : '' ?>>
                        <?= Loc::getMessage('TELEGRAM_APPROVAL_MODE_MULTIPLE_FIRST') ?>
                    </option>
                </select>
                <small class="form-text text-muted">
                    <?= Loc::getMessage('TELEGRAM_APPROVAL_MODE_HELP') ?>
                </small>
            </div>

            <!-- Таймаут -->
            <div class="form-group">
                <label for="Timeout"><?= Loc::getMessage('TELEGRAM_APPROVAL_TIMEOUT_HOURS') ?>:</label>
                <input type="number" 
                       id="Timeout" 
                       name="Timeout" 
                       value="<?= htmlspecialchars($currentValues['Timeout'] ?? '24') ?>" 
                       class="form-control"
                       min="1" 
                       max="168">
                <small class="form-text text-muted">
                    <?= Loc::getMessage('TELEGRAM_APPROVAL_TIMEOUT_HELP') ?>
                </small>
            </div>

            <!-- Backend URL -->
            <div class="form-group">
                <label for="BackendUrl"><?= Loc::getMessage('TELEGRAM_APPROVAL_BACKEND_URL') ?>: <span class="required">*</span></label>
                <input type="url" 
                       id="BackendUrl" 
                       name="BackendUrl" 
                       value="<?= htmlspecialchars($currentValues['BackendUrl'] ?? '') ?>" 
                       class="form-control"
                       placeholder="https://your-backend-domain.com">
                <small class="form-text text-muted">
                    <?= Loc::getMessage('TELEGRAM_APPROVAL_BACKEND_URL_HELP') ?>
                </small>
            </div>

            <!-- Backend Secret -->
            <div class="form-group">
                <label for="BackendSecret"><?= Loc::getMessage('TELEGRAM_APPROVAL_BACKEND_SECRET') ?>:</label>
                <input type="password" 
                       id="BackendSecret" 
                       name="BackendSecret" 
                       value="<?= htmlspecialchars($currentValues['BackendSecret'] ?? '') ?>" 
                       class="form-control"
                       placeholder="<?= Loc::getMessage('TELEGRAM_APPROVAL_BACKEND_SECRET_PLACEHOLDER') ?>">
                <small class="form-text text-muted">
                    <?= Loc::getMessage('TELEGRAM_APPROVAL_BACKEND_SECRET_HELP') ?>
                </small>
            </div>

            <!-- Переменные для подстановки -->
            <div class="form-group">
                <label><?= Loc::getMessage('TELEGRAM_APPROVAL_VARIABLES') ?>:</label>
                <div class="alert alert-info">
                    <strong><?= Loc::getMessage('TELEGRAM_APPROVAL_VARIABLES_AVAILABLE') ?>:</strong><br>
                    <code>{DOCUMENT_TITLE}</code> - <?= Loc::getMessage('TELEGRAM_APPROVAL_VARIABLE_DOCUMENT_TITLE') ?><br>
                    <code>{DOCUMENT_ID}</code> - <?= Loc::getMessage('TELEGRAM_APPROVAL_VARIABLE_DOCUMENT_ID') ?><br>
                    <code>{CREATED_BY}</code> - <?= Loc::getMessage('TELEGRAM_APPROVAL_VARIABLE_CREATED_BY') ?>
                </div>
            </div>
        </div>

        <style>
        .telegram-approval-form {
            padding: 15px;
        }
        .telegram-approval-form .form-group {
            margin-bottom: 15px;
        }
        .telegram-approval-form label {
            font-weight: bold;
            margin-bottom: 5px;
        }
        .telegram-approval-form .required {
            color: red;
        }
        .telegram-approval-form .form-control {
            width: 100%;
            padding: 8px;
            border: 1px solid #ccc;
            border-radius: 4px;
        }
        .telegram-approval-form .form-text {
            font-size: 12px;
            color: #666;
        }
        .telegram-approval-form .alert {
            padding: 10px;
            border-radius: 4px;
        }
        .telegram-approval-form .alert-info {
            background-color: #d1ecf1;
            border: 1px solid #bee5eb;
            color: #0c5460;
        }
        .telegram-approval-form code {
            background-color: #f8f9fa;
            padding: 2px 4px;
            border-radius: 3px;
            font-family: monospace;
        }
        </style>

        <script>
        // Валидация формы
        function validateTelegramApprovalForm() {
            var errors = [];
            
            // Проверка обязательных полей
            if (!document.getElementById('Approvers').value.trim()) {
                errors.push('<?= Loc::getMessage('TELEGRAM_APPROVAL_ERROR_NO_APPROVERS') ?>');
            }
            
            if (!document.getElementById('MessageText').value.trim()) {
                errors.push('<?= Loc::getMessage('TELEGRAM_APPROVAL_ERROR_NO_MESSAGE') ?>');
            }
            
            if (!document.getElementById('BackendUrl').value.trim()) {
                errors.push('<?= Loc::getMessage('TELEGRAM_APPROVAL_ERROR_NO_BACKEND_URL') ?>');
            }
            
            // Проверка URL
            var backendUrl = document.getElementById('BackendUrl').value.trim();
            if (backendUrl && !isValidUrl(backendUrl)) {
                errors.push('<?= Loc::getMessage('TELEGRAM_APPROVAL_ERROR_INVALID_URL') ?>');
            }
            
            // Проверка таймаута
            var timeout = parseInt(document.getElementById('Timeout').value);
            if (isNaN(timeout) || timeout < 1 || timeout > 168) {
                errors.push('<?= Loc::getMessage('TELEGRAM_APPROVAL_ERROR_INVALID_TIMEOUT') ?>');
            }
            
            if (errors.length > 0) {
                alert('<?= Loc::getMessage('TELEGRAM_APPROVAL_VALIDATION_ERRORS') ?>:\n' + errors.join('\n'));
                return false;
            }
            
            return true;
        }
        
        function isValidUrl(string) {
            try {
                new URL(string);
                return true;
            } catch (_) {
                return false;
            }
        }
        
        // Добавляем валидацию к форме
        document.addEventListener('DOMContentLoaded', function() {
            var form = document.querySelector('.telegram-approval-form').closest('form');
            if (form) {
                form.addEventListener('submit', function(e) {
                    if (!validateTelegramApprovalForm()) {
                        e.preventDefault();
                        return false;
                    }
                });
            }
        });
        </script>
        <?php
        return ob_get_clean();
    }

    /**
     * Получение текущих значений
     * 
     * @return array Текущие значения
     */
    protected function GetCurrentValues()
    {
        $currentValues = parent::GetCurrentValues();
        
        // Устанавливаем значения по умолчанию
        if (empty($currentValues['ButtonApprove'])) {
            $currentValues['ButtonApprove'] = 'Согласовано';
        }
        
        if (empty($currentValues['ButtonReject'])) {
            $currentValues['ButtonReject'] = 'Не согласовано';
        }
        
        if (empty($currentValues['Mode'])) {
            $currentValues['Mode'] = 'single';
        }
        
        if (empty($currentValues['Timeout'])) {
            $currentValues['Timeout'] = 24;
        }
        
        return $currentValues;
    }

    /**
     * Сохранение параметров
     * 
     * @param array $arCurrentValues Текущие значения
     * @return array Сохраненные значения
     */
    public function Save($arCurrentValues)
    {
        $arCurrentValues = parent::Save($arCurrentValues);
        
        // Очищаем и валидируем данные
        $arCurrentValues['Title'] = trim($arCurrentValues['Title'] ?? '');
        $arCurrentValues['Approvers'] = trim($arCurrentValues['Approvers'] ?? '');
        $arCurrentValues['MessageText'] = trim($arCurrentValues['MessageText'] ?? '');
        $arCurrentValues['ButtonApprove'] = trim($arCurrentValues['ButtonApprove'] ?? 'Согласовано');
        $arCurrentValues['ButtonReject'] = trim($arCurrentValues['ButtonReject'] ?? 'Не согласовано');
        $arCurrentValues['Mode'] = $arCurrentValues['Mode'] ?? 'single';
        $arCurrentValues['Timeout'] = intval($arCurrentValues['Timeout'] ?? 24);
        $arCurrentValues['BackendUrl'] = trim($arCurrentValues['BackendUrl'] ?? '');
        $arCurrentValues['BackendSecret'] = trim($arCurrentValues['BackendSecret'] ?? '');
        
        // Валидация
        $errors = [];
        
        if (empty($arCurrentValues['Approvers'])) {
            $errors[] = Loc::getMessage('TELEGRAM_APPROVAL_ERROR_NO_APPROVERS');
        }
        
        if (empty($arCurrentValues['MessageText'])) {
            $errors[] = Loc::getMessage('TELEGRAM_APPROVAL_ERROR_NO_MESSAGE');
        }
        
        if (empty($arCurrentValues['BackendUrl'])) {
            $errors[] = Loc::getMessage('TELEGRAM_APPROVAL_ERROR_NO_BACKEND_URL');
        }
        
        if (!empty($errors)) {
            throw new Exception(implode("\n", $errors));
        }
        
        return $arCurrentValues;
    }
}
