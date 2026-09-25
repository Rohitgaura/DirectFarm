const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Negotiation = sequelize.define('Negotiation', {
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
  buyerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
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
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  offeredPrice: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  quantity: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 1
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'pending'
  },
  counterOfferPrice: {
    type: DataTypes.FLOAT,
    allowNull: true
  }
}, {
  tableName: 'negotiations',
  timestamps: true
});

Negotiation.prototype.toJSON = function () {
  const values = { ...this.get() };
  values._id = values.id;
  return values;
};

Negotiation.findById = function (id) {
  return Negotiation.findByPk(id);
};

module.exports = Negotiation;
