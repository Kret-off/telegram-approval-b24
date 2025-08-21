const Approval = require('./Approval');
const Approver = require('./Approver');
const UserMapping = require('./UserMapping');

// Связь Approval -> Approver (один ко многим)
Approval.hasMany(Approver, {
  foreignKey: 'approval_id',
  sourceKey: 'approval_id',
  as: 'approvers',
});

Approver.belongsTo(Approval, {
  foreignKey: 'approval_id',
  targetKey: 'approval_id',
  as: 'approval',
});

// Связь Approver -> UserMapping (многие к одному)
Approver.belongsTo(UserMapping, {
  foreignKey: 'bitrix24_user_id',
  targetKey: 'bitrix24_user_id',
  as: 'userMapping',
  scope: {
    bitrix24_portal: {
      [require('sequelize').Op.col]: 'approval.bitrix24_portal',
    },
  },
});

UserMapping.hasMany(Approver, {
  foreignKey: 'bitrix24_user_id',
  sourceKey: 'bitrix24_user_id',
  as: 'approvers',
});

// Связь UserMapping -> Approval (через Approver)
UserMapping.hasMany(Approval, {
  foreignKey: 'bitrix24_user_id',
  sourceKey: 'bitrix24_user_id',
  as: 'approvals',
  through: Approver,
});

module.exports = {
  Approval,
  Approver,
  UserMapping,
};
