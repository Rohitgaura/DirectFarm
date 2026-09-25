import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import apiService from '../../services/api';
import ChatModal from '../chat/ChatModal';
import '../../styles/ProductBidsPage.css';

const ProductBidsPage = () => {
    const { productId } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [bids, setBids] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    // Sorting & Filtering State
    const [sortBy, setSortBy] = useState('date_desc');
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Counter offer state
    const [activeCounterBidId, setActiveCounterBidId] = useState(null);
    const [counterPrice, setCounterPrice] = useState('');
    const [submittingAction, setSubmittingAction] = useState(false);

    // Chat modal state
    const [showChat, setShowChat] = useState(false);
    const [selectedBuyerForChat, setSelectedBuyerForChat] = useState(null);

    useEffect(() => {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                setCurrentUser(JSON.parse(userStr));
            }
        } catch (e) {
            console.error('Error reading current user:', e);
        }
    }, []);

    const [clearedCount, setClearedCount] = useState(0);

    const fetchProductBids = useCallback(async () => {
        if (!productId) return;
        try {
            setLoading(true);
            const response = await apiService.getProductBids(productId);
            if (response.success) {
                setProduct(response.data.product);
                setBids(response.data.bids || []);
                setStats(response.data.stats || null);

                // Mark all notifications for this product as read & update navbar badge immediately
                try {
                    const readRes = await apiService.markProductNotificationsRead(productId);
                    if (readRes.success && readRes.count > 0) {
                        setClearedCount(readRes.count);
                    }
                    window.dispatchEvent(new Event('notificationUpdated'));
                } catch (readErr) {
                    console.error('Error marking product notifications read:', readErr);
                }
            } else {
                setError(response.message || 'Failed to load bids for this product');
            }
        } catch (err) {
            console.error('Error fetching product bids:', err);
            setError(err.response?.data?.message || 'Error fetching bids data');
        } finally {
            setLoading(false);
        }
    }, [productId]);

    useEffect(() => {
        fetchProductBids();
    }, [fetchProductBids]);

    // Handle Accept / Reject / Counter-Offer Actions
    const handleStatusUpdate = async (bidId, status, customCounterPrice = null) => {
        try {
            setSubmittingAction(true);
            const payload = { status };
            if (status === 'counter_offer') {
                const parsedPrice = parseFloat(customCounterPrice || counterPrice);
                if (isNaN(parsedPrice) || parsedPrice <= 0) {
                    toast.error('Please enter a valid counter offer price per kg');
                    return;
                }
                payload.counterOfferPrice = parsedPrice;
            }

            const response = await apiService.updateNegotiationStatus(bidId, payload);
            if (response.success) {
                toast.success(`Bid ${status === 'counter_offer' ? 'counter-offer sent' : status} successfully!`);
                setActiveCounterBidId(null);
                setCounterPrice('');
                fetchProductBids(); // Refresh bid list & stats
                window.dispatchEvent(new Event('notificationUpdated'));
            } else {
                toast.error(response.message || 'Failed to update bid status');
            }
        } catch (err) {
            console.error('Error updating bid status:', err);
            toast.error(err.response?.data?.message || 'Failed to process action');
        } finally {
            setSubmittingAction(false);
        }
    };

    // Filter and Sort Bids
    const filteredAndSortedBids = useMemo(() => {
        let result = [...bids];

        // 1. Status Filter
        if (filterStatus !== 'all') {
            result = result.filter(b => b.status === filterStatus);
        }

        // 2. Search Query (Buyer Name or Email)
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(b => {
                const buyerName = (b.buyer?.name || b.buyerId?.name || '').toLowerCase();
                const buyerEmail = (b.buyer?.email || b.buyerId?.email || '').toLowerCase();
                return buyerName.includes(query) || buyerEmail.includes(query);
            });
        }

        // 3. Sorting
        result.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            const priceA = parseFloat(a.offeredPrice) || 0;
            const priceB = parseFloat(b.offeredPrice) || 0;
            const qtyA = parseFloat(a.quantity) || 0;
            const qtyB = parseFloat(b.quantity) || 0;

            switch (sortBy) {
                case 'date_desc':
                    return dateB - dateA;
                case 'date_asc':
                    return dateA - dateB;
                case 'price_desc':
                    return priceB - priceA;
                case 'price_asc':
                    return priceA - priceB;
                case 'quantity_desc':
                    return qtyB - qtyA;
                case 'quantity_asc':
                    return qtyA - qtyB;
                default:
                    return dateB - dateA;
            }
        });

        return result;
    }, [bids, filterStatus, searchQuery, sortBy]);

    // Handle opening Chat with bidder
    const handleChatWithBuyer = (bid) => {
        const buyer = bid.buyer || bid.buyerId;
        if (!buyer) {
            toast.error('Buyer details not available');
            return;
        }

        setSelectedBuyerForChat({
            id: buyer.id || buyer._id,
            name: buyer.name
        });
        setShowChat(true);
    };

    if (loading) {
        return (
            <div className="bids-page-container loading-state">
                <div className="bids-loading-spinner"></div>
                <p>Loading bids & negotiations for this product...</p>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="bids-page-container error-state">
                <div className="error-card">
                    <i className="fas fa-exclamation-triangle"></i>
                    <h2>Product or Bids Not Found</h2>
                    <p>{error || 'The requested product could not be located.'}</p>
                    <button className="btn-back-dashboard" onClick={() => navigate('/farmer-dashboard')}>
                        <i className="fas fa-arrow-left"></i> Return to Farmer Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const firstImage = product.images && product.images.length > 0
        ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url)
        : null;

    return (
        <div className="bids-management-page">
            <div className="bids-container">
                {/* Top Navigation */}
                <div className="bids-nav-header">
                    <button className="btn-back-link" onClick={() => navigate('/farmer-dashboard')}>
                        <i className="fas fa-arrow-left"></i> Back to Dashboard
                    </button>
                    <div className="breadcrumbs">
                        <span>Farmer Dashboard</span> / <span>Product Bidding</span> / <span className="active">{product.name}</span>
                    </div>
                </div>

                {/* Notifications Cleared Confirmation Banner */}
                {clearedCount > 0 && (
                    <motion.div
                        className="notifications-cleared-banner"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            background: '#ecfdf5',
                            border: '1px solid #a7f3d0',
                            color: '#065f46',
                            padding: '0.75rem 1.25rem',
                            borderRadius: '14px',
                            marginBottom: '1.25rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '0.75rem',
                            fontSize: '0.92rem',
                            fontWeight: '600',
                            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.08)'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <i className="fas fa-check-circle" style={{ color: '#10b981', fontSize: '1.1rem' }}></i>
                            <span>
                                <strong>{clearedCount} notification{clearedCount > 1 ? 's' : ''}</strong> for <em>{product.name}</em> marked as read. Top notification count has been updated.
                            </span>
                        </div>
                        <button
                            onClick={() => setClearedCount(0)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#059669',
                                cursor: 'pointer',
                                fontSize: '0.85rem'
                            }}
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </motion.div>
                )}

                {/* Product Summary Header Card */}
                <motion.div
                    className="product-overview-banner"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="product-media">
                        {firstImage ? (
                            <img
                                src={firstImage}
                                alt={product.name}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect fill='%23f1f5f9' width='200' height='200'/%3E%3Ctext fill='%2394a3b8' font-family='sans-serif' font-size='16' font-weight='bold' x='50%25' y='50%25' text-anchor='middle' dy='6'%3ENo Image%3C/text%3E%3C/svg%3E";
                                }}
                            />
                        ) : (
                            <div className="product-no-img">
                                <i className="fas fa-leaf"></i>
                            </div>
                        )}
                        {product.images && product.images.length > 1 && (
                            <span className="media-count-badge">
                                <i className="fas fa-camera"></i> {product.images.length} photos
                            </span>
                        )}
                    </div>

                    <div className="product-details-summary">
                        <div className="title-row">
                            <h1>{product.name}</h1>
                            {product.category && (
                                <span className="badge-category">{product.category}</span>
                            )}
                        </div>

                        <p className="product-desc-snippet">
                            {product.description || 'No description provided.'}
                        </p>

                        <div className="meta-tags-list">
                            <div className="meta-tag base-price">
                                <span className="meta-label">Original Asking Price</span>
                                <span className="meta-val">₹{product.pricePerKg} <small>/ kg</small></span>
                            </div>

                            <div className="meta-tag remaining-stock">
                                <span className="meta-label">Remaining Stock</span>
                                <span className="meta-val highlight-stock">
                                    <i className="fas fa-boxes"></i> {product.quantity} kg Available
                                </span>
                            </div>

                            {product.harvestingDate && (
                                <div className="meta-tag">
                                    <span className="meta-label">Harvest Date</span>
                                    <span className="meta-val">
                                        <i className="fas fa-calendar-alt"></i> {new Date(product.harvestingDate).toLocaleDateString()}
                                    </span>
                                </div>
                            )}

                            {product.location && (product.location.district || product.location.state) && (
                                <div className="meta-tag">
                                    <span className="meta-label">Farm Location</span>
                                    <span className="meta-val">
                                        <i className="fas fa-map-marker-alt"></i> {[product.location.village, product.location.district, product.location.state].filter(Boolean).join(', ')}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Bidding KPI Stats Grid */}
                <div className="bids-kpi-grid">
                    <div className="kpi-card">
                        <div className="kpi-icon icon-bids">
                            <i className="fas fa-gavel"></i>
                        </div>
                        <div className="kpi-body">
                            <span className="kpi-title">Total Bids Placed</span>
                            <span className="kpi-number">{stats?.totalBids || bids.length}</span>
                        </div>
                    </div>

                    <div className="kpi-card">
                        <div className="kpi-icon icon-highest">
                            <i className="fas fa-arrow-trend-up"></i>
                        </div>
                        <div className="kpi-body">
                            <span className="kpi-title">Highest Bid Rate</span>
                            <span className="kpi-number text-green">
                                {stats?.highestBid ? `₹${stats.highestBid}/kg` : '—'}
                            </span>
                        </div>
                    </div>

                    <div className="kpi-card">
                        <div className="kpi-icon icon-lowest">
                            <i className="fas fa-arrow-trend-down"></i>
                        </div>
                        <div className="kpi-body">
                            <span className="kpi-title">Lowest Bid Rate</span>
                            <span className="kpi-number text-orange">
                                {stats?.lowestBid ? `₹${stats.lowestBid}/kg` : '—'}
                            </span>
                        </div>
                    </div>

                    <div className="kpi-card">
                        <div className="kpi-icon icon-avg">
                            <i className="fas fa-scale-balanced"></i>
                        </div>
                        <div className="kpi-body">
                            <span className="kpi-title">Average Offer</span>
                            <span className="kpi-number">
                                {stats?.averageBid ? `₹${stats.averageBid}/kg` : '—'}
                            </span>
                        </div>
                    </div>

                    <div className="kpi-card">
                        <div className="kpi-icon icon-demand">
                            <i className="fas fa-truck-ramp-box"></i>
                        </div>
                        <div className="kpi-body">
                            <span className="kpi-title">Total Demand</span>
                            <span className="kpi-number">
                                {stats?.totalQuantityDemanded || 0} kg
                            </span>
                        </div>
                    </div>
                </div>

                {/* Controls: Filter Tabs, Search & Sorter */}
                <div className="bids-control-bar">
                    {/* Status Tabs */}
                    <div className="filter-status-tabs">
                        {[
                            { key: 'all', label: 'All Bids', count: bids.length },
                            { key: 'pending', label: 'Pending', count: bids.filter(b => b.status === 'pending').length },
                            { key: 'accepted', label: 'Accepted', count: bids.filter(b => b.status === 'accepted').length },
                            { key: 'counter_offer', label: 'Counter Offered', count: bids.filter(b => b.status === 'counter_offer').length },
                            { key: 'rejected', label: 'Declined', count: bids.filter(b => b.status === 'rejected').length },
                        ].map(tab => (
                            <button
                                key={tab.key}
                                className={`tab-btn ${filterStatus === tab.key ? 'active' : ''}`}
                                onClick={() => setFilterStatus(tab.key)}
                            >
                                {tab.label}
                                <span className="tab-badge">{tab.count}</span>
                            </button>
                        ))}
                    </div>

                    {/* Right side: Search & Sorting */}
                    <div className="sort-search-wrapper">
                        <div className="search-box">
                            <i className="fas fa-search"></i>
                            <input
                                type="text"
                                placeholder="Search bidder name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button className="clear-search" onClick={() => setSearchQuery('')}>
                                    <i className="fas fa-times"></i>
                                </button>
                            )}
                        </div>

                        <div className="sort-selector">
                            <label><i className="fas fa-sort-amount-down"></i> Sort By:</label>
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                <option value="date_desc">📅 Date & Time (Newest First)</option>
                                <option value="date_asc">📅 Date & Time (Oldest First)</option>
                                <option value="price_desc">💰 Highest Price (₹ / kg)</option>
                                <option value="price_asc">🏷️ Lowest Price (₹ / kg)</option>
                                <option value="quantity_desc">⚖️ Highest Quantity (kg)</option>
                                <option value="quantity_asc">📦 Lowest Quantity (kg)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Bids List Section */}
                <div className="bids-list-wrapper">
                    {filteredAndSortedBids.length === 0 ? (
                        <div className="no-bids-card">
                            <i className="fas fa-inbox"></i>
                            <h3>No Bids Found</h3>
                            <p>
                                {bids.length === 0
                                    ? 'No buyers have placed offers or bids on this product yet.'
                                    : 'No bids match your selected filters or search criteria.'}
                            </p>
                            {filterStatus !== 'all' && (
                                <button className="btn-reset-filters" onClick={() => { setFilterStatus('all'); setSearchQuery(''); }}>
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="bids-cards-grid">
                            {filteredAndSortedBids.map((bid) => {
                                const buyer = bid.buyer || bid.buyerId || {};
                                const priceDiff = ((bid.offeredPrice - product.pricePerKg) / product.pricePerKg) * 100;
                                const isCounterOpen = activeCounterBidId === bid.id;
                                const totalValue = (parseFloat(bid.quantity) * parseFloat(bid.offeredPrice)).toFixed(2);

                                return (
                                    <motion.div
                                        key={bid.id}
                                        className={`bid-card status-${bid.status}`}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        layout
                                    >
                                        <div className="bid-card-header">
                                            <div className="bidder-profile">
                                                <div className="bidder-avatar">
                                                    {(buyer.name || 'B').charAt(0).toUpperCase()}
                                                </div>
                                                <div className="bidder-info">
                                                    <h4>{buyer.name || 'Interested Buyer'}</h4>
                                                    <span className="bidder-contact">
                                                        {buyer.phone ? <><i className="fas fa-phone"></i> {buyer.phone}</> : (buyer.email || '')}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="bid-status-pill">
                                                <span className={`badge-status ${bid.status}`}>
                                                    {bid.status === 'counter_offer'
                                                        ? 'Counter Offered'
                                                        : (bid.status || 'pending').toUpperCase()}
                                                </span>
                                                <span className="bid-timestamp">
                                                    <i className="fas fa-clock"></i> {new Date(bid.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="bid-card-metrics">
                                            <div className="metric-box rate-box">
                                                <span className="metric-label">Offered Price</span>
                                                <span className="metric-value price-val">
                                                    ₹{bid.offeredPrice} <small>/ kg</small>
                                                </span>
                                                <span className={`diff-tag ${priceDiff >= 0 ? 'above' : 'below'}`}>
                                                    {priceDiff >= 0 ? `+${priceDiff.toFixed(1)}% above base` : `${priceDiff.toFixed(1)}% below base`}
                                                </span>
                                            </div>

                                            <div className="metric-box qty-box">
                                                <span className="metric-label">Requested Quantity</span>
                                                <span className="metric-value">
                                                    {bid.quantity} <small>kg</small>
                                                </span>
                                                <span className="stock-ratio">
                                                    ({((bid.quantity / product.quantity) * 100).toFixed(0)}% of stock)
                                                </span>
                                            </div>

                                            <div className="metric-box total-box">
                                                <span className="metric-label">Total Bid Value</span>
                                                <span className="metric-value total-val">
                                                    ₹{totalValue}
                                                </span>
                                            </div>
                                        </div>

                                        {bid.counterOfferPrice && (
                                            <div className="counter-offer-banner">
                                                <i className="fas fa-exchange-alt"></i>
                                                <span>Your Counter-Offer: <strong>₹{bid.counterOfferPrice}/kg</strong> (Total: ₹{(bid.quantity * bid.counterOfferPrice).toFixed(2)})</span>
                                            </div>
                                        )}

                                        {/* Action Buttons for Farmer */}
                                        <div className="bid-card-actions">
                                            {bid.status === 'pending' && !isCounterOpen && (
                                                <div className="pending-actions-row">
                                                    <button
                                                        className="btn-action btn-accept"
                                                        disabled={submittingAction}
                                                        onClick={() => handleStatusUpdate(bid.id, 'accepted')}
                                                        title="Accept this offer and confirm order"
                                                    >
                                                        <i className="fas fa-check"></i> Accept Bid
                                                    </button>
                                                    <button
                                                        className="btn-action btn-counter"
                                                        disabled={submittingAction}
                                                        onClick={() => {
                                                            setActiveCounterBidId(bid.id);
                                                            setCounterPrice(bid.counterOfferPrice || product.pricePerKg);
                                                        }}
                                                        title="Send a counter price to this buyer"
                                                    >
                                                        <i className="fas fa-handshake"></i> Counter Offer
                                                    </button>
                                                    <button
                                                        className="btn-action btn-decline"
                                                        disabled={submittingAction}
                                                        onClick={() => handleStatusUpdate(bid.id, 'rejected')}
                                                        title="Decline this offer"
                                                    >
                                                        <i className="fas fa-times"></i> Decline
                                                    </button>
                                                </div>
                                            )}

                                            {isCounterOpen && (
                                                <div className="counter-input-panel">
                                                    <div className="counter-inline-form">
                                                        <label>Propose Counter Price (₹ / kg):</label>
                                                        <div className="input-group">
                                                            <span className="currency-symbol">₹</span>
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                min="1"
                                                                value={counterPrice}
                                                                onChange={(e) => setCounterPrice(e.target.value)}
                                                                placeholder="Enter price per kg"
                                                                autoFocus
                                                            />
                                                            <button
                                                                className="btn-send-counter"
                                                                disabled={submittingAction}
                                                                onClick={() => handleStatusUpdate(bid.id, 'counter_offer')}
                                                            >
                                                                Send Counter
                                                            </button>
                                                            <button
                                                                className="btn-cancel-counter"
                                                                onClick={() => setActiveCounterBidId(null)}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Chat button always accessible */}
                                            <button
                                                className="btn-chat-buyer"
                                                onClick={() => handleChatWithBuyer(bid)}
                                            >
                                                <i className="fas fa-comment-dots"></i> Chat with {buyer.name || 'Buyer'}
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Modal with Bidder */}
            {showChat && selectedBuyerForChat && (
                <ChatModal
                    isOpen={showChat}
                    onClose={() => {
                        setShowChat(false);
                        setSelectedBuyerForChat(null);
                    }}
                    farmer={selectedBuyerForChat}
                    product={{
                        id: product.id,
                        name: product.name
                    }}
                    currentUser={currentUser}
                />
            )}
        </div>
    );
};

export default ProductBidsPage;
