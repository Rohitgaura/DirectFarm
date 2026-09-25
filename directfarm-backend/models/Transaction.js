const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  _id: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.getDataValue('id');
    }
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'orders',
      key: 'id'
    }
  },
  paymentMethod: {
    type: DataTypes.ENUM('online', 'cod', 'bank_transfer'),
    allowNull: false
  },
  transactionAmount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  transactionStatus: {
    type: DataTypes.ENUM('success', 'failed', 'pending', 'refunded'),
    defaultValue: 'pending'
  },
  transactionId: {
    type: DataTypes.STRING(100),
    allowNull: true
  }
}, {
  tableName: 'transactions',
  timestamps: true
});

Transaction.prototype.toJSON = function () {
  const values = { ...this.get() };
  values._id = values.id;
  values.order = values.orderId;
  return values;
};

module.exports = Transaction;
