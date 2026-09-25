const { sequelize, User, Notification } = require('../models');

async function clearRameshNotifications() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database.');

    // Find all users with email ramesh or role farmer named Ramesh
    const rameshUsers = await User.findAll({
      where: {
        email: { [sequelize.Sequelize.Op.iLike]: '%ramesh%' }
      }
    });

    console.log(`Found ${rameshUsers.length} Ramesh user(s).`);

    for (const u of rameshUsers) {
      console.log(`User: ID=${u.id}, Name=${u.name}, Email=${u.email}`);
      const deletedCount = await Notification.destroy({
        where: { recipientId: u.id }
      });
      console.log(`Cleared ${deletedCount} notification(s) for user ${u.email}`);
    }

    // Also clear notifications where message contains Ramesh or recipient matches
    const orphanNotifications = await Notification.destroy({
      where: {
        message: { [sequelize.Sequelize.Op.iLike]: '%ramesh%' }
      }
    });
    console.log(`Cleared ${orphanNotifications} additional Ramesh-related notification(s).`);

    console.log('✅ Successfully removed all notifications for Ramesh!');
    process.exit(0);
  } catch (error) {
    console.error('Error clearing notifications:', error);
    process.exit(1);
  }
}

clearRameshNotifications();
