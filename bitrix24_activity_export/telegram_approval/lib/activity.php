<?php
/**
 * Основной класс Activity для согласования через Telegram
 * 
 * @package TelegramApproval
 * @version 1.0.0
 */

if (!defined('B_PROLOG_INCLUDED') || B_PROLOG_INCLUDED !== true) {
    die();
}

use Bitrix\Main\Localization\Loc;
use Bitrix\Main\Web\HttpClient;
use Bitrix\Main\Web\Json;

/**
 * Класс Activity для согласования через Telegram
 */
class TelegramApprovalActivity extends CBPActivity
{
    /**
     * @var string Название Activity
     */
    public $Name = 'TelegramApprovalActivity';

    /**
     * @var array Параметры Activity
     */
    public $Properties = [];

    /**
     * @var array Выходные параметры
     */
    public $ReturnValues = [];

    /**
     * Конструктор
     */
    public function __construct($name)
    {
        parent::__construct($name);
        $this->arProperties = [
            'Title' => '',
            'Approvers' => '',
            'MessageText' => '',
            'ButtonApprove' => 'Согласовано',
            'ButtonReject' => 'Не согласовано',
            'Mode' => 'single', // single, multiple_wait_all, multiple_first
            'Timeout' => 24, // часы
            'BackendUrl' => '',
            'BackendSecret' => '',
        ];

        $this->SetPropertiesTypes([
            'Approvers' => ['Type' => 'string'],
            'MessageText' => ['Type' => 'text'],
            'ButtonApprove' => ['Type' => 'string'],
            'ButtonReject' => ['Type' => 'string'],
            'Mode' => ['Type' => 'string'],
            'Timeout' => ['Type' => 'int'],
            'BackendUrl' => ['Type' => 'string'],
            'BackendSecret' => ['Type' => 'string'],
        ]);
    }

    /**
     * Выполнение Activity
     * 
     * @return int Статус выполнения
     */
    public function Execute()
    {
        try {
            // Получаем параметры
            $approvers = $this->Approvers;
            $messageText = $this->MessageText;
            $buttonApprove = $this->ButtonApprove;
            $buttonReject = $this->ButtonReject;
            $mode = $this->Mode;
            $timeout = $this->Timeout;
            $backendUrl = $this->BackendUrl;
            $backendSecret = $this->BackendSecret;

            // Валидация параметров
            if (empty($approvers)) {
                throw new Exception(Loc::getMessage('TELEGRAM_APPROVAL_ERROR_NO_APPROVERS'));
            }

            if (empty($messageText)) {
                throw new Exception(Loc::getMessage('TELEGRAM_APPROVAL_ERROR_NO_MESSAGE'));
            }

            if (empty($backendUrl)) {
                throw new Exception(Loc::getMessage('TELEGRAM_APPROVAL_ERROR_NO_BACKEND_URL'));
            }

            // Подготавливаем данные для отправки
            $requestData = [
                'task_id' => $this->GetWorkflowInstanceId(),
                'approvers' => $this->parseApprovers($approvers),
                'message_text' => $this->processMessageText($messageText),
                'button_approve' => $buttonApprove,
                'button_reject' => $buttonReject,
                'mode' => $mode,
                'timeout_hours' => $timeout,
                'portal_url' => $this->getPortalUrl(),
                'document_url' => $this->getDocumentUrl(),
            ];

            // Отправляем запрос в backend-сервис
            $response = $this->sendToBackend($backendUrl, $requestData, $backendSecret);

            if (!$response['success']) {
                throw new Exception($response['error'] ?? Loc::getMessage('TELEGRAM_APPROVAL_ERROR_BACKEND_REQUEST'));
            }

            // Сохраняем ID согласования для последующего получения результата
            $this->SetVariable('approval_id', $response['approval_id']);

            // Возвращаем статус ожидания
            return CBPActivityExecutionStatus::Executing;

        } catch (Exception $e) {
            $this->WriteToTrackingService($e->getMessage());
            return CBPActivityExecutionStatus::Closed;
        }
    }

    /**
     * Обработка внешнего события (получение результата от backend)
     * 
     * @param string $eventName Название события
     * @param array $eventData Данные события
     * @return int Статус выполнения
     */
    public function OnExternalEvent($eventName, $eventData)
    {
        try {
            // Проверяем, что это событие завершения согласования
            if ($eventName !== 'TelegramApprovalCompleted') {
                return CBPActivityExecutionStatus::Executing;
            }

            // Получаем результат согласования
            $resultCode = $eventData['result_code'] ?? '';
            $resultLabel = $eventData['result_label'] ?? '';
            $comment = $eventData['comment'] ?? '';
            $respondedBy = $eventData['responded_by'] ?? '';
            $respondedAt = $eventData['responded_at'] ?? '';

            // Устанавливаем выходные параметры
            $this->ReturnValues = [
                'RESULT_CODE' => $resultCode,
                'RESULT_LABEL' => $resultLabel,
                'COMMENT' => $comment,
                'RESPONDED_BY' => $respondedBy,
                'RESPONDED_AT' => $respondedAt,
            ];

            // Записываем в лог
            $this->WriteToTrackingService(
                Loc::getMessage('TELEGRAM_APPROVAL_COMPLETED', [
                    '#RESULT#' => $resultLabel,
                    '#USER#' => $respondedBy,
                    '#COMMENT#' => $comment,
                ])
            );

            // Завершаем Activity
            return CBPActivityExecutionStatus::Closed;

        } catch (Exception $e) {
            $this->WriteToTrackingService($e->getMessage());
            return CBPActivityExecutionStatus::Closed;
        }
    }

    /**
     * Обработка таймаута
     * 
     * @return int Статус выполнения
     */
    public function OnTimeout()
    {
        try {
            // Устанавливаем результат по таймауту
            $this->ReturnValues = [
                'RESULT_CODE' => 'timeout',
                'RESULT_LABEL' => Loc::getMessage('TELEGRAM_APPROVAL_TIMEOUT'),
                'COMMENT' => Loc::getMessage('TELEGRAM_APPROVAL_TIMEOUT_COMMENT'),
                'RESPONDED_BY' => '',
                'RESPONDED_AT' => new \Bitrix\Main\Type\DateTime(),
            ];

            $this->WriteToTrackingService(Loc::getMessage('TELEGRAM_APPROVAL_TIMEOUT_LOG'));

            return CBPActivityExecutionStatus::Closed;

        } catch (Exception $e) {
            $this->WriteToTrackingService($e->getMessage());
            return CBPActivityExecutionStatus::Closed;
        }
    }

    /**
     * Парсинг списка согласантов
     * 
     * @param string $approvers Строка с согласантами
     * @return array Массив согласантов
     */
    private function parseApprovers($approvers)
    {
        $result = [];
        
        // Разбиваем по запятой или переносу строки
        $approversList = preg_split('/[,;\n\r]+/', $approvers);
        
        foreach ($approversList as $approver) {
            $approver = trim($approver);
            if (!empty($approver)) {
                $result[] = $approver;
            }
        }
        
        return $result;
    }

    /**
     * Обработка текста сообщения (подстановка переменных)
     * 
     * @param string $messageText Исходный текст
     * @return string Обработанный текст
     */
    private function processMessageText($messageText)
    {
        // Подставляем переменные из документа
        $document = $this->GetDocument();
        $documentFields = $document->GetFields();
        
        // Заменяем плейсхолдеры на реальные значения
        $messageText = str_replace(
            ['{DOCUMENT_TITLE}', '{DOCUMENT_ID}', '{CREATED_BY}'],
            [
                $documentFields['TITLE'] ?? '',
                $documentFields['ID'] ?? '',
                $documentFields['CREATED_BY'] ?? '',
            ],
            $messageText
        );
        
        return $messageText;
    }

    /**
     * Отправка запроса в backend-сервис
     * 
     * @param string $url URL backend-сервиса
     * @param array $data Данные для отправки
     * @param string $secret Секретный ключ
     * @return array Ответ от сервиса
     */
    private function sendToBackend($url, $data, $secret)
    {
        $httpClient = new HttpClient();
        $httpClient->setHeader('Content-Type', 'application/json');
        $httpClient->setHeader('Authorization', 'Bearer ' . $secret);
        
        // Добавляем подпись для безопасности
        $data['signature'] = $this->generateSignature($data, $secret);
        
        $response = $httpClient->post($url . '/api/approval/create', Json::encode($data));
        
        if ($httpClient->getStatus() !== 200) {
            throw new Exception('HTTP Error: ' . $httpClient->getStatus());
        }
        
        return Json::decode($response);
    }

    /**
     * Генерация подписи для безопасности
     * 
     * @param array $data Данные
     * @param string $secret Секретный ключ
     * @return string Подпись
     */
    private function generateSignature($data, $secret)
    {
        // Убираем подпись из данных перед генерацией
        unset($data['signature']);
        
        // Сортируем ключи для стабильной подписи
        ksort($data);
        
        // Создаем строку для подписи
        $stringToSign = Json::encode($data) . $secret;
        
        return hash_hmac('sha256', $stringToSign, $secret);
    }

    /**
     * Получение URL портала
     * 
     * @return string URL портала
     */
    private function getPortalUrl()
    {
        return (\CMain::IsHTTPS() ? 'https://' : 'http://') . $_SERVER['HTTP_HOST'];
    }

    /**
     * Получение URL документа
     * 
     * @return string URL документа
     */
    private function getDocumentUrl()
    {
        $document = $this->GetDocument();
        $documentId = $document->GetFields()['ID'] ?? '';
        
        return $this->getPortalUrl() . '/crm/deal/details/' . $documentId . '/';
    }

    /**
     * Получение формы настроек Activity
     * 
     * @return string HTML формы
     */
    public static function GetPropertiesDialog($documentType, $activityName, $arWorkflowTemplate, $arWorkflowParameters, $arWorkflowVariables, $arCurrentValues = null, $formName = '', $popupWindow = null, $siteId = '')
    {
        $runtime = CBPRuntime::GetRuntime();
        $runtime->IncludeActivityFile('TelegramApprovalActivity');

        $dialog = new TelegramApprovalActivityDialog($documentType, $activityName, $arWorkflowTemplate, $arWorkflowParameters, $arWorkflowVariables, $arCurrentValues, $formName, $popupWindow, $siteId);
        
        return $dialog->GetHTML();
    }

    /**
     * Валидация параметров Activity
     * 
     * @param array $arTestProperties Параметры для проверки
     * @return array Массив ошибок
     */
    public static function ValidateProperties($arTestProperties = [], CBPWorkflowTemplateUser $user = null)
    {
        $errors = [];

        if (empty($arTestProperties['Approvers'])) {
            $errors[] = Loc::getMessage('TELEGRAM_APPROVAL_ERROR_NO_APPROVERS');
        }

        if (empty($arTestProperties['MessageText'])) {
            $errors[] = Loc::getMessage('TELEGRAM_APPROVAL_ERROR_NO_MESSAGE');
        }

        if (empty($arTestProperties['BackendUrl'])) {
            $errors[] = Loc::getMessage('TELEGRAM_APPROVAL_ERROR_NO_BACKEND_URL');
        }

        return $errors;
    }
}
