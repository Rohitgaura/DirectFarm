const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Complaint = sequelize.define('Complaint', {
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
  requestId: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Received', 'Processing', 'Resolved'),
    defaultValue: 'Received'
  }
}, {
  tableName: 'complaints',
  timestamps: true
});

Complaint.prototype.toJSON = function () {
  const values = { ...this.get() };
  values._id = values.id;
  return values;
};

Complaint.findById = function (id) {
  return Complaint.findByPk(id);
};

module.exports = Complaint;
