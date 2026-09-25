const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Order = sequelize.define('Order', {
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
    },
    onDelete: 'CASCADE'
  },
  farmerId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  totalAmount: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'delivered', 'cancelled'),
    defaultValue: 'pending'
  },
  shippingAddress: {
    type: DataTypes.JSONB,
    allowNull: true
    // { street, city, state, pincode, phone }
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  paymentMethod: {
    type: DataTypes.STRING(50),
    defaultValue: 'cod'
  },
  paymentStatus: {
    type: DataTypes.STRING(50),
    defaultValue: 'pending'
  },
  isRatedByBuyer: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isRatedBySeller: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'orders',
  timestamps: true
});

Order.prototype.toJSON = function () {
  const values = { ...this.get() };
  values._id = values.id;
  // Aliases for compatibility
  values.buyer = values.Buyer || values.buyerId;
  values.farmer = values.Farmer || values.farmerId;
  return values;
};

Order.findById = function (id) {
  return Order.findByPk(id);
};

module.exports = Order;
