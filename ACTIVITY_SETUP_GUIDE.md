# 🔄 Создание Activity для бизнес-процессов

## 📋 Что такое Activity

Activity - это действие, которое можно добавить в бизнес-процесс Bitrix24. Оно позволяет автоматически отправлять задачи на согласование в Telegram.

## 🎯 Зачем нужна Activity

Без Activity вы можете:
- ✅ Получать webhook'и от Bitrix24
- ✅ Отправлять уведомления в Telegram
- ❌ НО не можете автоматически запускать процесс согласования

С Activity вы можете:
- ✅ Автоматически отправлять задачи на согласование
- ✅ Интегрировать в существующие бизнес-процессы
- ✅ Настраивать условия и правила

## 🔧 Создание Activity

### Шаг 1: Создайте файл Activity

Создайте файл `src/activity/telegram_approval/activity.php`:

```php
<?php
namespace Bitrix\Bizproc\Activity;

use Bitrix\Main\Localization\Loc;

Loc::loadMessages(__FILE__);

class TelegramApprovalActivity extends \Bitrix\Bizproc\Activity\BaseActivity
{
    public static function getPropertiesDialog($documentType, $activityName, $workflowTemplate, $workflowParameters, $workflowVariables, $currentValues = null, $formName = "form", $popupWindow = null, $siteId = '')
    {
        $dialog = new \Bitrix\Bizproc\Activity\PropertiesDialog(__FILE__, array(
            'documentType' => $documentType,
            'activityName' => $activityName,
            'workflowTemplate' => $workflowTemplate,
            'workflowParameters' => $workflowParameters,
            'workflowVariables' => $workflowVariables,
            'currentValues' => $currentValues,
            'formName' => $formName,
            'siteId' => $siteId
        ));

        $dialog->setMap(array(
            'Approvers' => array(
                'Name' => Loc::getMessage('TELEGRAM_APPROVAL_APPROVERS'),
                'FieldName' => 'approvers',
                'Type' => 'user',
                'Required' => true,
                'Multiple' => true
            ),
            'Message' => array(
                'Name' => Loc::getMessage('TELEGRAM_APPROVAL_MESSAGE'),
                'FieldName' => 'message',
                'Type' => 'text',
                'Required' => true
            ),
            'Timeout' => array(
                'Name' => Loc::getMessage('TELEGRAM_APPROVAL_TIMEOUT'),
                'FieldName' => 'timeout',
                'Type' => 'int',
                'Default' => 24
            )
        ));

        return $dialog;
    }

    public static function getPropertiesDialogValues($documentType, $activityName, &$workflowTemplate, &$workflowParameters, &$workflowVariables, $currentValues, &$errors)
    {
        $properties = array(
            'Approvers' => $currentValues['approvers'],
            'Message' => $currentValues['message'],
            'Timeout' => intval($currentValues['timeout'])
        );

        $errors = self::ValidateProperties($properties, new \Bitrix\Bizproc\FieldType($documentType));
        if (count($errors) > 0)
            return false;

        $currentActivity = &self::GetActivity($workflowTemplate, $activityName);
        $currentActivity['Properties'] = $properties;

        return true;
    }

    public function Execute()
    {
        $approvers = $this->Approvers;
        $message = $this->Message;
        $timeout = $this->Timeout;

        // Отправляем запрос в наше облачное приложение
        $cloudAppUrl = 'https://telegram-approval-b2411.vercel.app/api/approvals/create';
        
        $data = array(
            'task_id' => $this->GetDocumentId(),
            'approvers' => $approvers,
            'message' => $message,
            'timeout' => $timeout,
            'workflow_id' => $this->GetWorkflowInstanceId()
        );

        $result = $this->sendToCloudApp($cloudAppUrl, $data);

        if ($result['success']) {
            $this->WriteToTrackingService(Loc::getMessage('TELEGRAM_APPROVAL_SENT'));
            return \Bitrix\Bizproc\Activity\ExecutionResult::create()
                ->setStatus(\Bitrix\Bizproc\Activity\ExecutionStatus::ClosedActivity);
        } else {
            $this->WriteToTrackingService(Loc::getMessage('TELEGRAM_APPROVAL_ERROR'));
            return \Bitrix\Bizproc\Activity\ExecutionResult::create()
                ->setStatus(\Bitrix\Bizproc\Activity\ExecutionStatus::ClosedActivity)
                ->setErrors(array($result['error']));
        }
    }

    private function sendToCloudApp($url, $data)
    {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, array(
            'Content-Type: application/json',
            'Authorization: Bearer ' . $this->getApiToken()
        ));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode === 200) {
            return json_decode($response, true);
        }

        return array('success' => false, 'error' => 'HTTP Error: ' . $httpCode);
    }

    private function getApiToken()
    {
        // Получаем токен из настроек приложения
        return \Bitrix\Main\Config\Option::get('telegram.approval', 'api_token', '');
    }
}
```

### Шаг 2: Создайте языковые файлы

`src/activity/telegram_approval/lang/ru/activity.php`:

```php
<?php
$MESS['TELEGRAM_APPROVAL_APPROVERS'] = 'Согласующие';
$MESS['TELEGRAM_APPROVAL_MESSAGE'] = 'Сообщение для согласования';
$MESS['TELEGRAM_APPROVAL_TIMEOUT'] = 'Таймаут (часы)';
$MESS['TELEGRAM_APPROVAL_SENT'] = 'Запрос на согласование отправлен в Telegram';
$MESS['TELEGRAM_APPROVAL_ERROR'] = 'Ошибка отправки запроса на согласование';
```

### Шаг 3: Создайте файл установки

`src/activity/telegram_approval/install/index.php`:

```php
<?php
use Bitrix\Main\ModuleManager;

if (!defined('B_PROLOG_INCLUDED') || B_PROLOG_INCLUDED !== true) die();

class TelegramApprovalActivity extends CModule
{
    public $MODULE_ID = 'telegram.approval';
    public $MODULE_VERSION;
    public $MODULE_VERSION_DATE;
    public $MODULE_NAME;
    public $MODULE_DESCRIPTION;

    public function __construct()
    {
        $this->MODULE_NAME = 'Telegram Approval Activity';
        $this->MODULE_DESCRIPTION = 'Activity для согласования задач через Telegram';
        $this->MODULE_VERSION = '1.0.0';
        $this->MODULE_VERSION_DATE = '2024-12-21 00:00:00';
    }

    public function DoInstall()
    {
        ModuleManager::registerModule($this->MODULE_ID);
        $this->InstallActivity();
    }

    public function DoUninstall()
    {
        $this->UnInstallActivity();
        ModuleManager::unRegisterModule($this->MODULE_ID);
    }

    private function InstallActivity()
    {
        $activity = new \Bitrix\Bizproc\Activity\TelegramApprovalActivity();
        $activity->install();
    }

    private function UnInstallActivity()
    {
        $activity = new \Bitrix\Bizproc\Activity\TelegramApprovalActivity();
        $activity->uninstall();
    }
}
```

## 🚀 Установка Activity

1. **Создайте папку в Bitrix24:**
   ```
   /local/activities/telegram_approval/
   ```

2. **Скопируйте файлы:**
   - `activity.php` → `/local/activities/telegram_approval/activity.php`
   - `lang/ru/activity.php` → `/local/activities/telegram_approval/lang/ru/activity.php`

3. **Перезагрузите страницу Bitrix24**

4. **Проверьте в бизнес-процессах:**
   - Создайте новый бизнес-процесс
   - В списке действий должно появиться "Telegram Approval"

## 🎯 Использование Activity

1. **В бизнес-процессе:**
   - Добавьте действие "Telegram Approval"
   - Укажите согласующих
   - Напишите сообщение
   - Установите таймаут

2. **Автоматизация:**
   - При выполнении процесса задача автоматически отправится в Telegram
   - Согласующие получат уведомления
   - Результат вернется в Bitrix24

## ✅ Результат

После установки Activity:
- ✅ Появится в списке действий бизнес-процессов
- ✅ Можно добавить в любой процесс
- ✅ Автоматическая интеграция с Telegram
- ✅ Полная автоматизация согласований
