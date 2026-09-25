const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SuccessStory = sequelize.define('SuccessStory', {
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
  farmerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  farmerName: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  location: {
    type: DataTypes.JSONB,
    allowNull: true
    // { village, district, state }
  },
  story: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  beforeIncome: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  },
  currentIncome: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  },
  improvements: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  cropTypes: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  yearsWithPlatform: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isApproved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'success_stories',
  timestamps: true
});

SuccessStory.prototype.toJSON = function () {
  const values = { ...this.get() };
  values._id = values.id;
  if (values.beforeIncome > 0) {
    values.incomeImprovement = Math.round(((values.currentIncome - values.beforeIncome) / values.beforeIncome) * 100);
  } else {
    values.incomeImprovement = 0;
  }
  return values;
};

SuccessStory.findById = function (id) {
  return SuccessStory.findByPk(id);
};

module.exports = SuccessStory;
