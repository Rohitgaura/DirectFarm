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
    const [filterMode, setFilterMode] = useState('unread_first'); // 'unread_first', 'all', 'unread'

    useEffect(() => {
        const storedUser = authUtils.getUser();
        if (storedUser) {
            setUser(storedUser);
        }
        loadConversations();
    }, []);

    const totalUnread = React.useMemo(() => {
        return conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
    }, [conversations]);

    const displayedConversations = React.useMemo(() => {
        let list = [...conversations];
        if (filterMode === 'unread') {
            list = list.filter(c => (c.unreadCount || 0) > 0);
        } else if (filterMode === 'unread_first') {
            list.sort((a, b) => {
                const aUnread = a.unreadCount || 0;
                const bUnread = b.unreadCount || 0;
                if (aUnread > 0 && bUnread === 0) return -1;
                if (aUnread === 0 && bUnread > 0) return 1;
                return new Date(b.lastMessage?.createdAt || 0) - new Date(a.lastMessage?.createdAt || 0);
            });
        }
        return list;
    }, [conversations, filterMode]);

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
                    {conversations.length > 0 && (
                        <div style={{
                            display: 'flex',
                            gap: '8px',
                            marginBottom: '1rem',
                            background: '#ffffff',
                            padding: '8px 12px',
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap'
                        }}>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                <button
                                    onClick={() => setFilterMode('unread_first')}
                                    style={{
                                        padding: '5px 12px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        background: filterMode === 'unread_first' ? '#10b981' : '#f1f5f9',
                                        color: filterMode === 'unread_first' ? '#ffffff' : '#334155',
                                        fontWeight: '700',
                                        fontSize: '0.84rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}
                                >
                                    <i className="fas fa-arrow-up-wide-short"></i> 🔝 Unread on Top
                                </button>
                                <button
                                    onClick={() => setFilterMode('all')}
                                    style={{
                                        padding: '5px 12px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        background: filterMode === 'all' ? '#10b981' : '#f1f5f9',
                                        color: filterMode === 'all' ? '#ffffff' : '#334155',
                                        fontWeight: '600',
                                        fontSize: '0.84rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    All ({conversations.length})
                                </button>
                                {totalUnread > 0 && (
                                    <button
                                        onClick={() => setFilterMode('unread')}
                                        style={{
                                            padding: '5px 12px',
                                            borderRadius: '8px',
                                            border: 'none',
                                            background: filterMode === 'unread' ? '#ef4444' : '#fef2f2',
                                            color: filterMode === 'unread' ? '#ffffff' : '#ef4444',
                                            fontWeight: '700',
                                            fontSize: '0.84rem',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Unread Only ({totalUnread})
                                    </button>
                                )}
                            </div>
                            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                                {displayedConversations.length} conversation{displayedConversations.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                    )}

                    {isLoading ? (
                        <div className="loading-state">
                            <i className="fas fa-spinner fa-spin"></i>
                            <p>Loading conversations...</p>
                        </div>
                    ) : displayedConversations.length === 0 ? (
                        <div className="empty-state">
                            <i className="fas fa-inbox"></i>
                            <h3>{filterMode === 'unread' ? 'No unread messages' : 'No conversations yet'}</h3>
                            <p>{filterMode === 'unread' ? 'You have read all your incoming messages!' : 'Start chatting with farmers or buyers to see your conversations here'}</p>
                        </div>
                    ) : (
                        <div className="conversations-list">
                            {displayedConversations.map((conversation, index) => (
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
                                                {/* Status Indicator (Only if current user sent the last message) */}
                                                {conversation.lastMessage.senderId === (user._id || user.id) && (
                                                    <span className={`status-tick ${conversation.lastMessage.status}`}>
                                                        {conversation.lastMessage.status === 'sending' && <i className="fas fa-clock"></i>}
                                                        {conversation.lastMessage.status === 'sent' && <i className="fas fa-check"></i>}
                                                        {conversation.lastMessage.status === 'delivered' && <i className="fas fa-check-double"></i>}
                                                        {conversation.lastMessage.status === 'read' && <i className="fas fa-check-double read"></i>}
                                                    </span>
                                                )}
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
