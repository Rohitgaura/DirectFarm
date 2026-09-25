const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ChatRoom = sequelize.define('ChatRoom', {
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
  user1: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  user2: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  lastMessage: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  lastMessageStatus: {
    type: DataTypes.ENUM('sending', 'sent', 'delivered', 'read'),
    defaultValue: 'sent'
  },
  lastMessageSenderId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  lastTime: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'chat_rooms',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['user1', 'user2']
    },
    {
      fields: ['lastTime']
    }
  ]
});

ChatRoom.prototype.toJSON = function () {
  const values = { ...this.get() };
  values._id = values.id;
  return values;
};

ChatRoom.findById = function (id) {
  return ChatRoom.findByPk(id);
};

ChatRoom.findByIdAndUpdate = async function (id, updateData) {
  const room = await ChatRoom.findByPk(id);
  if (!room) return null;
  await room.update(updateData);
  return room;
};

module.exports = ChatRoom;
