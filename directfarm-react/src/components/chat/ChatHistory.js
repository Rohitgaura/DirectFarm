import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import apiService from '../../services/api';
import authUtils from '../../utils/auth';
import ChatModal from './ChatModal';
import '../../styles/ChatHistory.css';

const ChatHistory = () => {
    const [conversations, setConversations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [showChat, setShowChat] = useState(false);
    const [selectedPartner, setSelectedPartner] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);

    useEffect(() => {
        const storedUser = authUtils.getUser();
        if (storedUser) {
            setUser(storedUser);
        }
        loadConversations();
    }, []);

    const loadConversations = async () => {
        setIsLoading(true);
        try {
            const response = await apiService.getConversations();
            if (response.success) {
                setConversations(response.data);
            }
        } catch (error) {
            console.error('Error loading conversations:', error);
            toast.error('Failed to load conversations');
        } finally {
            setIsLoading(false);
        }
    };

    const openChat = (conversation) => {
        setSelectedPartner({
            id: conversation.user._id,
            name: conversation.user.name
        });

        // Check if there's product context in last message
        if (conversation.lastMessage?.productId) {
            setSelectedProduct({
                id: conversation.lastMessage.productId._id,
                vegetableType: conversation.lastMessage.productId.name
            });
        } else {
            setSelectedProduct(null);
        }

        setShowChat(true);
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);

        if (hours < 1) {
            return 'Just now';
        } else if (hours < 24) {
            return `${hours}h ago`;
        } else if (days < 7) {
            return `${days}d ago`;
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
        }
    };

    return (
        <div className="chat-history-page">
            <div className="chat-history-container">
                <motion.div
                    className="chat-history-header"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1>
                        <i className="fas fa-comments"></i>
                        Messages
                    </h1>
                    <p>Your conversations</p>
                </motion.div>

                <div className="conversations-wrapper">
                    {isLoading ? (
                        <div className="loading-state">
                            <i className="fas fa-spinner fa-spin"></i>
                            <p>Loading conversations...</p>
                        </div>
                    ) : conversations.length === 0 ? (
                        <div className="empty-state">
                            <i className="fas fa-inbox"></i>
                            <h3>No conversations yet</h3>
                            <p>Start chatting with farmers or buyers to see your conversations here</p>
                        </div>
                    ) : (
                        <div className="conversations-list">
                            {conversations.map((conversation, index) => (
                                <motion.div
                                    key={conversation.user._id}
                                    className="conversation-card"
                                    onClick={() => openChat(conversation)}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <div className="conversation-avatar">
                                        <i className="fas fa-user-circle"></i>
                                        {conversation.unreadCount > 0 && (
                                            <span className="unread-badge">{conversation.unreadCount}</span>
                                        )}
                                    </div>

                                    <div className="conversation-content">
                                        <div className="conversation-header">
                                            <h3>{conversation.user.name}</h3>
                                            <span className="conversation-time">
                                                {formatTime(conversation.lastMessage.createdAt)}
                                            </span>
                                        </div>

                                        <div className="conversation-preview">
                                            <p className={conversation.unreadCount > 0 ? 'unread' : ''}>
                                                {conversation.lastMessage.message}
                                            </p>
                                            {conversation.lastMessage.productId && (
                                                <span className="product-tag">
                                                    <i className="fas fa-leaf"></i>
                                                    {conversation.lastMessage.productId.name}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="conversation-arrow">
                                        <i className="fas fa-chevron-right"></i>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Modal */}
            {showChat && selectedPartner && (
                <ChatModal
                    isOpen={showChat}
                    onClose={() => {
                        setShowChat(false);
                        setSelectedPartner(null);
                        setSelectedProduct(null);
                        loadConversations(); // Refresh to update unread counts
                    }}
                    farmer={selectedPartner}
                    product={selectedProduct}
                    currentUser={user}
                />
            )}
        </div>
    );
};

export default ChatHistory;
