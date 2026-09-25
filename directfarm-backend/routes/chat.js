const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { ChatRoom, Message, User } = require('../models');
const { protect } = require('../middleware/auth');

// POST /chat/room -> find or create a chat room
router.post('/room', protect, async (req, res) => {
  try {
    const { targetUserId } = req.body;
    const currentUserId = req.user.id;

    if (!targetUserId) {
      return res.status(400).json({ success: false, message: 'Target user ID is required' });
    }

    const id1 = currentUserId.toString();
    const id2 = targetUserId.toString();

    if (id1 === id2) {
      return res.status(400).json({ success: false, message: 'Cannot chat with yourself' });
    }

    const smallId = id1 < id2 ? id1 : id2;
    const largeId = id1 > id2 ? id1 : id2;

    let chatRoom = await ChatRoom.findOne({
      where: { user1: smallId, user2: largeId }
    });

    if (chatRoom) {
      return res.json({ success: true, roomId: chatRoom.id, chatRoom });
    }

    chatRoom = await ChatRoom.create({
      user1: smallId,
      user2: largeId,
      lastMessage: '',
      lastTime: new Date()
    });

    res.status(201).json({ success: true, roomId: chatRoom.id, chatRoom });
  } catch (error) {
    console.error('Error in /chat/room:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /chat/message -> send message
router.post('/message', protect, async (req, res) => {
  try {
    const { roomId, text } = req.body;
    const senderId = req.user.id;

    if (!roomId || !text) {
      return res.status(400).json({ success: false, message: 'roomId and text are required' });
    }

    const newMessage = await Message.create({
      roomId,
      senderId,
      text,
      time: new Date()
    });

    await ChatRoom.update(
      {
        lastMessage: text,
        lastMessageStatus: 'sent',
        lastMessageSenderId: senderId,
        lastTime: new Date()
      },
      { where: { id: roomId } }
    );

    const chatRoom = await ChatRoom.findByPk(roomId);

    if (chatRoom && req.io && req.onlineUsers) {
      const recipientId = chatRoom.user1 === senderId ? chatRoom.user2 : chatRoom.user1;
      const recipientSocketId = req.onlineUsers.get(recipientId);

      if (recipientSocketId) {
        req.io.to(recipientSocketId).emit('newMessage', newMessage.toJSON());
      }
    }

    res.status(201).json({ success: true, data: newMessage });
  } catch (error) {
    console.error('Error in /chat/message:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /chat/rooms/:userId -> get chat history list
router.get('/rooms/:userId', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const rooms = await ChatRoom.findAll({
      where: {
        [Op.or]: [{ user1: userId }, { user2: userId }]
      },
      include: [
        { model: User, as: 'User1', attributes: ['id', 'name', 'email', 'role'] },
        { model: User, as: 'User2', attributes: ['id', 'name', 'email', 'role'] }
      ],
      order: [['lastTime', 'DESC']]
    });

    const formattedRooms = rooms.map(room => {
      const json = room.toJSON();
      json.user1 = room.User1 ? room.User1.toJSON() : json.user1;
      json.user2 = room.User2 ? room.User2.toJSON() : json.user2;
      return json;
    });

    res.json({ success: true, data: formattedRooms });
  } catch (error) {
    console.error('Error in /chat/rooms:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /chat/messages/:roomId -> get messages for a room (with pagination)
router.get('/messages/:roomId', protect, async (req, res) => {
  try {
    const { roomId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const offset = (page - 1) * limit;

    const messages = await Message.findAll({
      where: { roomId },
      include: [{ model: User, as: 'sender', attributes: ['id', 'name'] }],
      order: [['time', 'DESC']],
      limit,
      offset
    });

    const formattedMessages = messages.map(m => {
      const json = m.toJSON();
      if (m.sender) {
        json.senderId = m.sender.toJSON();
      }
      return json;
    }).reverse();

    res.json({ success: true, count: formattedMessages.length, data: formattedMessages });
  } catch (error) {
    console.error('Error in /chat/messages:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
