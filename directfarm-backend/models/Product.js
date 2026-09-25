const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define('Product', {
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
    },
    onDelete: 'CASCADE'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Product name is required' }
    }
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  quantity: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  pricePerKg: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  harvestingDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  images: {
    type: DataTypes.JSONB,
    defaultValue: []
    // Array of { url: string, public_id: string }
  },
  location: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: null
    // { coordinates: [lng, lat] }
  },
  expiryDuration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 7
  },
  expiryUnit: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: 'days'
  },
  expiryDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'active'
    // 'active', 'sold', 'expired'
  },
  autoRemoveEnabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'products',
  timestamps: true
});

Product.prototype.toJSON = function () {
  const values = { ...this.get() };
  values._id = values.id;
  return values;
};

Product.findById = function (id) {
  return Product.findByPk(id);
};

Product.findByIdAndUpdate = async function (id, updateData) {
  const product = await Product.findByPk(id);
  if (!product) return null;
  await product.update(updateData);
  return product;
};

Product.findByIdAndDelete = async function (id) {
  const product = await Product.findByPk(id);
  if (!product) return null;
  await product.destroy();
  return product;
};

module.exports = Product;
