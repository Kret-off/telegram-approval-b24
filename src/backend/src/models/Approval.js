const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const Approval = sequelize.define('Approval', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  approval_id: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: 'Уникальный ID согласования',
  },
  bitrix24_portal: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'URL портала Битрикс24',
  },
  bitrix24_user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID пользователя в Битрикс24',
  },
  document_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'Тип документа (crm, disk, etc.)',
  },
  document_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID документа в Битрикс24',
  },
  document_title: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: 'Заголовок документа',
  },
  document_url: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'URL документа в Битрикс24',
  },
  message_text: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Текст сообщения для согласования',
  },
  button_approve: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: 'Согласовать',
    comment: 'Текст кнопки согласования',
  },
  button_reject: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: 'Отклонить',
    comment: 'Текст кнопки отклонения',
  },
  mode: {
    type: DataTypes.ENUM('single', 'multiple_wait_all', 'multiple_first'),
    allowNull: false,
    defaultValue: 'single',
    comment: 'Режим работы с несколькими согласантами',
  },
  timeout_hours: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 24,
    comment: 'Таймаут в часах',
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'timeout', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending',
    comment: 'Статус согласования',
  },
  result_code: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Код результата (approve/reject)',
  },
  result_label: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Подпись кнопки, которая была нажата',
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Комментарий к ответу',
  },
  responded_by: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Кто ответил (имя пользователя)',
  },
  responded_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Время ответа',
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Время создания записи',
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Время обновления записи',
  },
}, {
  tableName: 'approvals',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      name: 'idx_approval_id',
      fields: ['approval_id'],
    },
    {
      name: 'idx_bitrix24_portal',
      fields: ['bitrix24_portal'],
    },
    {
      name: 'idx_bitrix24_user_id',
      fields: ['bitrix24_user_id'],
    },
    {
      name: 'idx_document_type_id',
      fields: ['document_type', 'document_id'],
    },
    {
      name: 'idx_status',
      fields: ['status'],
    },
    {
      name: 'idx_created_at',
      fields: ['created_at'],
    },
    {
      name: 'idx_timeout',
      fields: ['status', 'created_at'],
      where: {
        status: 'pending',
      },
    },
  ],
});

// Хуки для автоматического обновления updated_at
Approval.beforeUpdate((approval) => {
  approval.updated_at = new Date();
});

// Методы модели
Approval.findByApprovalId = function(approvalId) {
  return this.findOne({
    where: { approval_id: approvalId },
    include: [
      {
        model: sequelize.models.Approver,
        as: 'approvers',
        include: [
          {
            model: sequelize.models.UserMapping,
            as: 'userMapping',
          },
        ],
      },
    ],
  });
};

Approval.findPendingByTimeout = function() {
  const timeoutDate = new Date();
  timeoutDate.setHours(timeoutDate.getHours() - 24); // 24 часа назад

  return this.findAll({
    where: {
      status: 'pending',
      created_at: {
        [sequelize.Op.lt]: timeoutDate,
      },
    },
    include: [
      {
        model: sequelize.models.Approver,
        as: 'approvers',
      },
    ],
  });
};

Approval.updateStatus = function(approvalId, status, resultData = {}) {
  return this.update(
    {
      status,
      ...resultData,
      responded_at: new Date(),
    },
    {
      where: { approval_id: approvalId },
    }
  );
};

module.exports = Approval;
