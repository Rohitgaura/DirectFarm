const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PendingRegistration = sequelize.define('PendingRegistration', {
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
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    set(value) {
      if (value) this.setDataValue('email', value.toLowerCase().trim());
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('farmer', 'buyer'),
    allowNull: false
  },
  experienceYears: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  address: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  farmName: {
    type: DataTypes.STRING(100),
    defaultValue: ''
  },
  emailOtp: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  emailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  otpResendCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lastOtpSentAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: 'pending_registrations',
  timestamps: true,
  indexes: [
    {
      fields: ['email']
    }
  ]
});

PendingRegistration.prototype.toJSON = function () {
  const values = { ...this.get() };
  values._id = values.id;
  return values;
};

// Helper deleteMany compatible with Mongoose
PendingRegistration.deleteMany = function (where) {
  return PendingRegistration.destroy({ where });
};

module.exports = PendingRegistration;
