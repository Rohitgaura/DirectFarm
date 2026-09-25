import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// import { toast } from 'react-toastify'; // Unused
import apiService from '../../services/api';
import socketService from '../../services/socket';
import localDB from '../../services/db';
import syncManager from '../../services/sync';
import '../../styles/ChatModal.css';

const ChatModal = ({ isOpen, onClose, farmer, product, currentUser }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef(null);
    const socket = useRef(null);

    // Initialize Socket
    useEffect(() => {
        if (currentUser) {
            socket.current = socketService.connect();
            socketService.join(currentUser.id || currentUser._id);

            socket.current.on('newMessage', (message) => {
                // Only add if it belongs to this conversation
                setMessages((prev) => {
                    // Check if message already exists (to avoid duplicates from optimistic UI)
                    if (prev.some(m => m._id === message._id)) return prev;

                    // If it belongs to current chat partner
                    if (message.senderId === farmer.id || message.senderId._id === farmer.id ||
                        message.roomId === (prev[0]?.roomId)) {

                        // If modal is open/active, mark as read immediately
                        socket.current.emit('markMessagesRead', {
                            roomId: message.roomId,
                            userId: currentUser.id || currentUser._id,
                            senderId: message.senderId._id || message.senderId
                        });

                        return [...prev, message];
                    }
                    return prev;
                });
                scrollToBottom();
            });

            // Listen for status updates (sent -> delivered -> read)
            socket.current.on('messageDelivered', ({ messageId, roomId }) => {
                setMessages(prev => prev.map(msg =>
                    msg._id === messageId ? { ...msg, status: 'delivered' } : msg
                ));
            });

            socket.current.on('messageRead', ({ roomId }) => {
                setMessages(prev => prev.map(msg =>
                    msg.status !== 'read' ? { ...msg, status: 'read' } : msg
                ));
            });
        }

        return () => {
            if (socket.current) {
                socket.current.off('newMessage');
                socket.current.off('messageDelivered');
                socket.current.off('messageRead');
            }
        };
    }, [currentUser, farmer?.id]);

    // Load conversation
    useEffect(() => {
        if (isOpen && farmer) {
            loadConversation();
            // Poll for new messages every 10 seconds -> REPLACED BY SOCKET
            // const interval = setInterval(loadConversation, 10000);
            // return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, farmer?.id]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Load conversation from LocalDB first, then API
    const loadConversation = async () => {
        if (!farmer) return;

        setIsLoading(true);
        try {
            // 1. Load from Local Cache immediately
            // We construct a roomId if we can, or just query by 'roomId' if we know it
            // Problem: We might not know roomId until we fetch from API if we haven't chatted before.
            // But we can try to find messages where participants match.
            // For now, let's rely on API to convert to roomId OR if we passed roomId prop.

            // To properly use LocalDB we need a stable roomId. 
            // In the simple architecture, maybe we query by partnerId? Not indexed yet.
            // Let's assume for now we fetch from API to get the latest (online-first for loading history)
            // AND we can save them to LocalDB for next time.

            const response = await apiService.getConversation(farmer.id);
            if (response.success) {
                const fetchedMessages = response.data;
                setMessages(fetchedMessages);

                // Save fetched messages to Local Cache
                for (const msg of fetchedMessages) {
                    await localDB.saveMessage(msg);
                }
            }
        } catch (error) {
            console.error('Error loading conversation:', error);
            // Fallback: Load from LocalDB if API fails (Offline)
            // But we need the roomId to query. 
            // If we don't have it, we might struggle. 
            // Workaround: We query all messages and filter in JS (inefficient but works for small sets)
            // Or better: Assume we found the roomId from a previous session?
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!newMessage.trim()) return;

        const tempId = `temp_${Date.now()}`;
        const timestamp = new Date().toISOString();
        const roomId = messages[0]?.roomId; // Best effort to get roomId

        // Optimistic Message Object
        const optimisticMessage = {
            _id: tempId,
            tempId: tempId, // helper to identify temp messages
            senderId: currentUser.id || currentUser._id,
            recipientId: farmer.id, // Needed for sync
            roomId: roomId,         // Might be undefined if first message
            productId: product?.id, // Needed for context
            message: newMessage.trim(),
            createdAt: timestamp,
            status: 'sending' // Start as sending (clock)
        };

        // 1. Update UI (Instant)
        setMessages(prev => [...prev, optimisticMessage]);
        setNewMessage('');
        setIsSending(true);
        scrollToBottom();

        // 2. Save to LocalDB (Persistence)
        try {
            await localDB.saveMessage(optimisticMessage);
            await localDB.addToSyncQueue(optimisticMessage);
        } catch (err) {
            console.error("LocalDB Error:", err);
        }

        // 3. Trigger Sync (Network Send)
        // If online, SyncManager will process the queue immediately
        if (navigator.onLine) {
            syncManager.processSyncQueue().then(() => {
                // After sync, we should reload messages or receive update via socket?
                // SyncManager updates DB. We need to reflect that `_id` change in UI.
                // A simple way is to re-load messages or listen for updates.
                // For now, let's just refresh messages from DB after a short delay
                setTimeout(async () => {
                    // We need to replace the temp message in UI with real one
                    // Just reloading from DB for this room might be easiest if we knew roomId
                    // Or just wait for socket 'newMessage' which we emit? 
                    // No, socket 'newMessage' comes from server.
                }, 500);
            });
        }

        setIsSending(false);
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
        }
    };

    // Render Status Tick
    const renderStatus = (msg) => {
        const senderId = typeof msg.senderId === 'object' ? msg.senderId._id : msg.senderId;
        const currentUserId = currentUser?.id || currentUser?._id;

        // Coerce to strings for comparison
        const isOwnMessage = String(senderId) === String(currentUserId);

        if (!isOwnMessage) return null;

        // internal status or default to sent (for old messages)
        const status = msg.status || 'sent';

        if (status === 'sending') {
            return <i className="fas fa-clock status-icon" title="Sending"></i>;
        } else if (status === 'sent') {
            return <i className="fas fa-check status-icon" title="Sent"></i>;
        } else if (status === 'delivered') {
            return <i className="fas fa-check-double status-icon" title="Delivered"></i>;
        } else if (status === 'read') {
            return <i className="fas fa-check-double status-icon read" title="Read" style={{ color: '#34b7f1' }}></i>;
        }
        return null;
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="chat-modal-overlay" onClick={onClose}>
                <motion.div
                    className="chat-modal"
                    onClick={(e) => e.stopPropagation()}
                    initial={{ opacity: 0, scale: 0.9, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 50 }}
                    transition={{ duration: 0.3 }}
                >
                    {/* Header */}
                    <div className="chat-header">
                        <div className="chat-header-info">
                            <div className="farmer-avatar">
                                <i className="fas fa-user-circle"></i>
                            </div>
                            <div>
                                <h3>{farmer.name}</h3>
                                {product && <p className="product-context">About: {product.vegetableType}</p>}
                            </div>
                        </div>
                        <button className="close-chat-btn" onClick={onClose}>
                            <i className="fas fa-times"></i>
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="chat-messages">
                        {isLoading && messages.length === 0 ? (
                            <div className="chat-loading">
                                <i className="fas fa-spinner fa-spin"></i>
                                <p>Loading conversation...</p>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="no-messages">
                                <i className="fas fa-comments"></i>
                                <p>No messages yet</p>
                                <span>Start the conversation!</span>
                            </div>
                        ) : (
                            <>
                                {messages.map((msg, index) => {
                                    // Handle both populated and non-populated senderId
                                    const senderId = typeof msg.senderId === 'object' ? msg.senderId._id : msg.senderId;
                                    const isOwnMessage = senderId === (currentUser.id || currentUser._id);
                                    const showDateDivider = index === 0 ||
                                        formatDate(messages[index - 1].createdAt) !== formatDate(msg.createdAt);

                                    return (
                                        <React.Fragment key={msg._id}>
                                            {showDateDivider && (
                                                <div className="date-divider">
                                                    <span>{formatDate(msg.createdAt)}</span>
                                                </div>
                                            )}
                                            <div className={`message ${isOwnMessage ? 'own' : 'other'}`}>
                                                <div className="message-bubble">
                                                    <p>{msg.message}</p>
                                                    <div className="message-meta">
                                                        <span className="message-time">{formatTime(msg.createdAt)}</span>
                                                        {renderStatus(msg)}
                                                    </div>
                                                </div>
                                            </div>
                                        </React.Fragment>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </>
                        )}
                    </div>

                    {/* Input */}
                    <form className="chat-input-container" onSubmit={handleSendMessage}>
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            disabled={isSending}
                            autoFocus
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim() || isSending}
                            className="send-btn"
                        >
                            <i className="fas fa-paper-plane"></i>
                        </button>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ChatModal;
