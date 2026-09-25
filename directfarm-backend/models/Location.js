const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Location = sequelize.define('Location', {
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
  state: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  district: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  subdistrict: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  village: {
    type: DataTypes.STRING(100),
    allowNull: false
  }
}, {
  tableName: 'locations',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['state', 'district', 'subdistrict', 'village']
    },
    { fields: ['state'] },
    { fields: ['district'] },
    { fields: ['subdistrict'] },
    { fields: ['village'] }
  ]
});

Location.prototype.toJSON = function () {
  const values = { ...this.get() };
  values._id = values.id;
  return values;
};

// Helper for distinct query compatible with Mongoose
Location.distinct = async function (field, where = {}) {
  const rows = await Location.findAll({
    attributes: [[sequelize.fn('DISTINCT', sequelize.col(field)), field]],
    where,
    raw: true
  });
  return rows.map(r => r[field]).filter(Boolean);
};

module.exports = Location;
