const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const UserMapping = sequelize.define('UserMapping', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
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
  bitrix24_user_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Имя пользователя в Битрикс24',
  },
  bitrix24_user_email: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Email пользователя в Битрикс24',
  },
  telegram_user_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
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
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Активен ли маппинг',
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
  tableName: 'user_mappings',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      name: 'idx_portal_user',
      fields: ['bitrix24_portal', 'bitrix24_user_id'],
      unique: true,
    },
    {
      name: 'idx_telegram_user_id',
      fields: ['telegram_user_id'],
    },
    {
      name: 'idx_telegram_username',
      fields: ['telegram_username'],
    },
    {
      name: 'idx_is_active',
      fields: ['is_active'],
    },
  ],
});

// Хуки для автоматического обновления updated_at
UserMapping.beforeUpdate((mapping) => {
  mapping.updated_at = new Date();
});

// Методы модели
UserMapping.findByBitrix24User = function(portal, bitrix24UserId) {
  return this.findOne({
    where: {
      bitrix24_portal: portal,
      bitrix24_user_id: bitrix24UserId,
      is_active: true,
    },
  });
};

UserMapping.findByTelegramUserId = function(telegramUserId) {
  return this.findOne({
    where: {
      telegram_user_id: telegramUserId,
      is_active: true,
    },
  });
};

UserMapping.findByTelegramUsername = function(telegramUsername) {
  return this.findOne({
    where: {
      telegram_username: telegramUsername,
      is_active: true,
    },
  });
};

UserMapping.createOrUpdate = function(mappingData) {
  return this.upsert(mappingData, {
    where: {
      bitrix24_portal: mappingData.bitrix24_portal,
      bitrix24_user_id: mappingData.bitrix24_user_id,
    },
  });
};

UserMapping.deactivateByPortal = function(portal) {
  return this.update(
    { is_active: false },
    {
      where: { bitrix24_portal: portal },
    }
  );
};

UserMapping.getActiveMappings = function(portal) {
  return this.findAll({
    where: {
      bitrix24_portal: portal,
      is_active: true,
    },
    order: [['bitrix24_user_name', 'ASC']],
  });
};

module.exports = UserMapping;
