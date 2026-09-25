const { sequelize } = require('../config/database');
const User = require('./User');
const Farmer = require('./Farmer');
const Buyer = require('./Buyer');
const Product = require('./Product');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const ChatRoom = require('./ChatRoom');
const Message = require('./Message');
const Negotiation = require('./Negotiation');
const Notification = require('./Notification');
const Rating = require('./Rating');
const ActivityLog = require('./Activitylog');
const LoginLog = require('./LoginLog');
const Complaint = require('./Complaint');
const Feedback = require('./Feedback');
const Location = require('./Location');
const PendingRegistration = require('./PendingRegistration');
const SuccessStory = require('./SuccessStory');
const Transaction = require('./Transaction');

// Define Associations

// User <-> Farmer
User.hasOne(Farmer, { foreignKey: 'userId', as: 'farmerProfile', onDelete: 'CASCADE' });
Farmer.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User <-> Buyer
User.hasOne(Buyer, { foreignKey: 'userId', as: 'buyerProfile', onDelete: 'CASCADE' });
Buyer.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User <-> Product
User.hasMany(Product, { foreignKey: 'farmerId', as: 'products', onDelete: 'CASCADE' });
Product.belongsTo(User, { foreignKey: 'farmerId', as: 'farmer' });

// User & Product <-> Order & OrderItem
User.hasMany(Order, { foreignKey: 'buyerId', as: 'buyerOrders', onDelete: 'CASCADE' });
Order.belongsTo(User, { foreignKey: 'buyerId', as: 'buyer' });

User.hasMany(Order, { foreignKey: 'farmerId', as: 'farmerOrders' });
Order.belongsTo(User, { foreignKey: 'farmerId', as: 'farmer' });

Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

Product.hasMany(OrderItem, { foreignKey: 'productId', as: 'orderItems' });
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

User.hasMany(OrderItem, { foreignKey: 'farmerId', as: 'soldItems' });
OrderItem.belongsTo(User, { foreignKey: 'farmerId', as: 'farmer' });

// Chat associations
ChatRoom.belongsTo(User, { foreignKey: 'user1', as: 'User1' });
ChatRoom.belongsTo(User, { foreignKey: 'user2', as: 'User2' });
ChatRoom.hasMany(Message, { foreignKey: 'roomId', as: 'messages', onDelete: 'CASCADE' });
Message.belongsTo(ChatRoom, { foreignKey: 'roomId', as: 'chatRoom' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

// Negotiation associations
Negotiation.belongsTo(User, { foreignKey: 'buyerId', as: 'buyer' });
Negotiation.belongsTo(User, { foreignKey: 'farmerId', as: 'farmer' });
Negotiation.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Notification associations
Notification.belongsTo(User, { foreignKey: 'recipientId', as: 'recipient' });

// Rating associations
Rating.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
Rating.belongsTo(User, { foreignKey: 'ratedBy', as: 'rater' });
Rating.belongsTo(User, { foreignKey: 'ratedUser', as: 'rated' });

// Activity & Login logs
ActivityLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });
LoginLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Feedback & SuccessStories
Feedback.belongsTo(User, { foreignKey: 'userId', as: 'user' });
SuccessStory.belongsTo(User, { foreignKey: 'farmerId', as: 'farmer' });

// Transaction
Transaction.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

module.exports = {
  sequelize,
  User,
  Farmer,
  Buyer,
  Product,
  Order,
  OrderItem,
  ChatRoom,
  Message,
  Negotiation,
  Notification,
  Rating,
  ActivityLog,
  LoginLog,
  Complaint,
  Feedback,
  Location,
  PendingRegistration,
  SuccessStory,
  Transaction
};
