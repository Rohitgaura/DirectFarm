const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Farmer = sequelize.define('Farmer', {
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
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  location: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  farmName: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  experienceYears: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  verificationStatus: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  totalProducts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalRevenue: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  averageRating: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  totalRatings: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'farmers',
  timestamps: true
});

Farmer.prototype.toJSON = function () {
  const values = { ...this.get() };
  values._id = values.id;
  return values;
};

Farmer.findById = function (id) {
  return Farmer.findByPk(id);
};

module.exports = Farmer;
