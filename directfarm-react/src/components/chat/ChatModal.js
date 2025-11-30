import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import apiService from '../../services/api';
import '../../styles/ChatModal.css';

const ChatModal = ({ isOpen, onClose, farmer, product, currentUser }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef(null);

    // Load conversation
    useEffect(() => {
        if (isOpen && farmer) {
            loadConversation();
            // Poll for new messages every 10 seconds
            const interval = setInterval(loadConversation, 10000);
            return () => clearInterval(interval);
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

    const loadConversation = async () => {
        if (!farmer) return;

        setIsLoading(true);
        try {
            const response = await apiService.getConversation(farmer.id);
            if (response.success) {
                setMessages(response.data);
            }
        } catch (error) {
            console.error('Error loading conversation:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!newMessage.trim()) return;

        setIsSending(true);
        try {
            const response = await apiService.sendMessage({
                recipientId: farmer.id,
                productId: product?.id || null,
                message: newMessage.trim()
            });

            if (response.success) {
                setMessages([...messages, response.data]);
                setNewMessage('');
                scrollToBottom();
            } else {
                toast.error('Failed to send message');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Failed to send message');
        } finally {
            setIsSending(false);
        }
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
                                    const isOwnMessage = senderId === currentUser.id || senderId === currentUser._id;
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
                                                    <span className="message-time">{formatTime(msg.createdAt)}</span>
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
                            {isSending ? (
                                <i className="fas fa-spinner fa-spin"></i>
                            ) : (
                                <i className="fas fa-paper-plane"></i>
                            )}
                        </button>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ChatModal;
