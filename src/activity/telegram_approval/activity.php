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
                'Multiple' => true,
                'Description' => Loc::getMessage('TELEGRAM_APPROVAL_APPROVERS_DESC')
            ),
            'Message' => array(
                'Name' => Loc::getMessage('TELEGRAM_APPROVAL_MESSAGE'),
                'FieldName' => 'message',
                'Type' => 'text',
                'Required' => true,
                'Description' => Loc::getMessage('TELEGRAM_APPROVAL_MESSAGE_DESC')
            ),
            'Timeout' => array(
                'Name' => Loc::getMessage('TELEGRAM_APPROVAL_TIMEOUT'),
                'FieldName' => 'timeout',
                'Type' => 'int',
                'Default' => 24,
                'Description' => Loc::getMessage('TELEGRAM_APPROVAL_TIMEOUT_DESC')
            ),
            'AutoApprove' => array(
                'Name' => Loc::getMessage('TELEGRAM_APPROVAL_AUTO_APPROVE'),
                'FieldName' => 'auto_approve',
                'Type' => 'bool',
                'Default' => false,
                'Description' => Loc::getMessage('TELEGRAM_APPROVAL_AUTO_APPROVE_DESC')
            )
        ));

        return $dialog;
    }

    public static function getPropertiesDialogValues($documentType, $activityName, &$workflowTemplate, &$workflowParameters, &$workflowVariables, $currentValues, &$errors)
    {
        $properties = array(
            'Approvers' => $currentValues['approvers'],
            'Message' => $currentValues['message'],
            'Timeout' => intval($currentValues['timeout']),
            'AutoApprove' => $currentValues['auto_approve'] === 'Y'
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
        $autoApprove = $this->AutoApprove;

        // Получаем информацию о задаче
        $documentId = $this->GetDocumentId();
        $workflowId = $this->GetWorkflowInstanceId();
        
        // Формируем сообщение с информацией о задаче
        $taskInfo = $this->getTaskInfo($documentId);
        $fullMessage = $this->formatMessage($message, $taskInfo);

        // Отправляем запрос в наше облачное приложение
        $cloudAppUrl = 'https://telegram-approval-b2411.vercel.app/api/approvals/create';
        
        $data = array(
            'task_id' => $documentId,
            'workflow_id' => $workflowId,
            'approvers' => $approvers,
            'message' => $fullMessage,
            'timeout' => $timeout,
            'auto_approve' => $autoApprove,
            'task_info' => $taskInfo
        );

        $result = $this->sendToCloudApp($cloudAppUrl, $data);

        if ($result['success']) {
            $this->WriteToTrackingService(Loc::getMessage('TELEGRAM_APPROVAL_SENT'));
            return \Bitrix\Bizproc\Activity\ExecutionResult::create()
                ->setStatus(\Bitrix\Bizproc\Activity\ExecutionStatus::ClosedActivity);
        } else {
            $this->WriteToTrackingService(Loc::getMessage('TELEGRAM_APPROVAL_ERROR') . ': ' . $result['error']);
            return \Bitrix\Bizproc\Activity\ExecutionResult::create()
                ->setStatus(\Bitrix\Bizproc\Activity\ExecutionStatus::ClosedActivity)
                ->setErrors(array($result['error']));
        }
    }

    private function getTaskInfo($taskId)
    {
        // Получаем информацию о задаче из Bitrix24
        $task = \CTasks::GetByID($taskId)->Fetch();
        
        if ($task) {
            return array(
                'id' => $task['ID'],
                'title' => $task['TITLE'],
                'description' => $task['DESCRIPTION'],
                'created_by' => $task['CREATED_BY'],
                'responsible' => $task['RESPONSIBLE_ID'],
                'deadline' => $task['DEADLINE'],
                'priority' => $task['PRIORITY']
            );
        }
        
        return array('id' => $taskId);
    }

    private function formatMessage($baseMessage, $taskInfo)
    {
        $message = $baseMessage . "\n\n";
        $message .= "📋 Информация о задаче:\n";
        $message .= "ID: #" . $taskInfo['id'] . "\n";
        
        if (isset($taskInfo['title'])) {
            $message .= "Название: " . $taskInfo['title'] . "\n";
        }
        
        if (isset($taskInfo['description']) && $taskInfo['description']) {
            $message .= "Описание: " . substr($taskInfo['description'], 0, 200) . "\n";
        }
        
        if (isset($taskInfo['deadline']) && $taskInfo['deadline']) {
            $message .= "Срок: " . date('d.m.Y H:i', strtotime($taskInfo['deadline'])) . "\n";
        }
        
        $message .= "\nДля согласования нажмите кнопку ниже:";
        
        return $message;
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
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) {
            return array('success' => false, 'error' => 'CURL Error: ' . $error);
        }

        if ($httpCode === 200) {
            $result = json_decode($response, true);
            return $result ?: array('success' => true);
        }

        return array('success' => false, 'error' => 'HTTP Error: ' . $httpCode . ' - ' . $response);
    }

    private function getApiToken()
    {
        // Получаем токен из настроек приложения
        return \Bitrix\Main\Config\Option::get('telegram.approval', 'api_token', '');
    }
}
