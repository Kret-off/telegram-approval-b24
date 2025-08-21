const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const Approver = sequelize.define('Approver', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  approval_id: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'ID согласования',
  },
  bitrix24_user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID пользователя в Битрикс24',
  },
  telegram_user_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: 'ID пользователя в Telegram',
  },
  telegram_username: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Username в Telegram',
  },
  telegram_first_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Имя в Telegram',
  },
  telegram_last_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Фамилия в Telegram',
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'timeout'),
    allowNull: false,
    defaultValue: 'pending',
    comment: 'Статус ответа согласанта',
  },
  response_code: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Код ответа (approve/reject)',
  },
  response_label: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Подпись кнопки, которая была нажата',
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Комментарий к ответу',
  },
  responded_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Время ответа',
  },
  message_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID сообщения в Telegram',
  },
  chat_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: 'ID чата в Telegram',
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
  tableName: 'approvers',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      name: 'idx_approval_id',
      fields: ['approval_id'],
    },
    {
      name: 'idx_bitrix24_user_id',
      fields: ['bitrix24_user_id'],
    },
    {
      name: 'idx_telegram_user_id',
      fields: ['telegram_user_id'],
    },
    {
      name: 'idx_status',
      fields: ['status'],
    },
    {
      name: 'idx_message_id',
      fields: ['message_id'],
    },
    {
      name: 'idx_approval_status',
      fields: ['approval_id', 'status'],
    },
  ],
});

// Хуки для автоматического обновления updated_at
Approver.beforeUpdate((approver) => {
  approver.updated_at = new Date();
});

// Методы модели
Approver.findByApprovalId = function(approvalId) {
  return this.findAll({
    where: { approval_id: approvalId },
    include: [
      {
        model: sequelize.models.UserMapping,
        as: 'userMapping',
      },
    ],
    order: [['created_at', 'ASC']],
  });
};

Approver.findByTelegramUserId = function(telegramUserId) {
  return this.findOne({
    where: { telegram_user_id: telegramUserId },
    include: [
      {
        model: sequelize.models.Approval,
        as: 'approval',
      },
    ],
  });
};

Approver.findPendingByApprovalId = function(approvalId) {
  return this.findAll({
    where: {
      approval_id: approvalId,
      status: 'pending',
    },
  });
};

Approver.updateResponse = function(approvalId, bitrix24UserId, responseData) {
  return this.update(
    {
      status: responseData.status,
      response_code: responseData.response_code,
      response_label: responseData.response_label,
      comment: responseData.comment,
      responded_at: new Date(),
    },
    {
      where: {
        approval_id: approvalId,
        bitrix24_user_id: bitrix24UserId,
      },
    }
  );
};

Approver.updateMessageInfo = function(approvalId, bitrix24UserId, messageId, chatId) {
  return this.update(
    {
      message_id: messageId,
      chat_id: chatId,
    },
    {
      where: {
        approval_id: approvalId,
        bitrix24_user_id: bitrix24UserId,
      },
    }
  );
};

module.exports = Approver;
