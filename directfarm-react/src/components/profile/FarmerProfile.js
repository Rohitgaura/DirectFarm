import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import apiService from '../../services/api';
import authUtils from '../../utils/auth';
import StarRating from '../common/StarRating';
import ProductDetailsModal from '../product/ProductDetailsModal';
import ChatModal from '../chat/ChatModal';
import '../../styles/BuyerDashboard.css';
import '../../styles/FarmerProfile.css';

const FarmerProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [farmer, setFarmer] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    // Filters & Sorting State
    const [dateFilter, setDateFilter] = useState('all'); // 'all', 'today', 'yesterday', 'grouped'
    const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'price_high', 'price_low', 'quantity_high'
    const [searchQuery, setSearchQuery] = useState('');

    // Modals state
    const [selectedProductDetails, setSelectedProductDetails] = useState(null);
    const [showChat, setShowChat] = useState(false);
    const [chatProduct, setChatProduct] = useState(null);

    // Offer / Negotiation state
    const [showOfferModal, setShowOfferModal] = useState(false);
    const [selectedProductForOffer, setSelectedProductForOffer] = useState(null);
    const [offerData, setOfferData] = useState({ price: '', quantity: '' });
    const [submittingOffer, setSubmittingOffer] = useState(false);

    useEffect(() => {
        // Load logged in user using authUtils
        const user = authUtils.getUser();
        if (user) {
            setCurrentUser(user);
        }

        const fetchFarmerData = async () => {
            try {
                setLoading(true);
                const response = await apiService.getFarmer(id);
                if (response.success) {
                    setFarmer(response.data.farmer);
                    setProducts(response.data.products.items || []);
                } else {
                    setError('Failed to load farmer data');
                }
            } catch (err) {
                console.error('Error fetching farmer profile:', err);
                setError('Error loading profile');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchFarmerData();
        }
    }, [id]);

    // Check whether current user is the owner farmer
    const isFarmerOwner = useMemo(() => {
        if (!currentUser || !farmer) return false;
        const currentUserId = currentUser.id || currentUser._id;
        const farmerId = farmer.id || farmer._id;
        return String(currentUserId) === String(farmerId);
    }, [currentUser, farmer]);

    // Date Helper Functions
    const isToday = (dateString) => {
        if (!dateString) return false;
        const d = new Date(dateString);
        const today = new Date();
        return d.getDate() === today.getDate() &&
            d.getMonth() === today.getMonth() &&
            d.getFullYear() === today.getFullYear();
    };

    const isYesterday = (dateString) => {
        if (!dateString) return false;
        const d = new Date(dateString);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return d.getDate() === yesterday.getDate() &&
            d.getMonth() === yesterday.getMonth() &&
            d.getFullYear() === yesterday.getFullYear();
    };

    // Filter Unsold / Active Products
    const unsoldProducts = useMemo(() => {
        return products.filter(p => {
            const qty = parseFloat(p.quantity) || 0;
            const isSoldOut = p.isSold || p.status === 'sold' || p.status === 'out_of_stock';
            return qty > 0 && !isSoldOut;
        });
    }, [products]);

    // Active product list depending on whether viewer is farmer owner or buyer
    const displayProducts = useMemo(() => {
        return isFarmerOwner ? products : unsoldProducts;
    }, [isFarmerOwner, products, unsoldProducts]);

    // Calculate Date Counts
    const todayCount = useMemo(() => {
        return displayProducts.filter(p => isToday(p.createdAt)).length;
    }, [displayProducts]);

    const yesterdayCount = useMemo(() => {
        return displayProducts.filter(p => isYesterday(p.createdAt)).length;
    }, [displayProducts]);

    // Filter & Sort Products
    const processedProducts = useMemo(() => {
        let result = [...displayProducts];

        // 1. Search Query Filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(p =>
                (p.name && p.name.toLowerCase().includes(query)) ||
                (p.category && p.category.toLowerCase().includes(query)) ||
                (p.description && p.description.toLowerCase().includes(query))
            );
        }

        // 2. Date Filter Tabs
        if (dateFilter === 'today') {
            result = result.filter(p => isToday(p.createdAt));
        } else if (dateFilter === 'yesterday') {
            result = result.filter(p => isYesterday(p.createdAt));
        }

        // 3. Sorting
        result.sort((a, b) => {
            const priceA = a.pricePerKg !== undefined ? a.pricePerKg : (a.ratePerKg || a.price || 0);
            const priceB = b.pricePerKg !== undefined ? b.pricePerKg : (b.ratePerKg || b.price || 0);
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();

            switch (sortBy) {
                case 'newest':
                    return dateB - dateA;
                case 'oldest':
                    return dateA - dateB;
                case 'price_high':
                    return priceB - priceA;
                case 'price_low':
                    return priceA - priceB;
                case 'quantity_high':
                    return (b.quantity || 0) - (a.quantity || 0);
                default:
                    return dateB - dateA;
            }
        });

        return result;
    }, [displayProducts, searchQuery, dateFilter, sortBy]);

    // Group Products by Date Group
    const groupedProducts = useMemo(() => {
        if (dateFilter !== 'grouped') return null;

        const groups = {
            today: {
                title: "🌱 Today's Uploads",
                badge: "Today",
                color: "#10b981",
                items: []
            },
            yesterday: {
                title: "📅 Uploaded Yesterday",
                badge: "Yesterday",
                color: "#3b82f6",
                items: []
            },
            earlier: {
                title: "🗓️ Earlier Listings",
                badge: "Earlier",
                color: "#64748b",
                items: []
            }
        };

        processedProducts.forEach(product => {
            if (isToday(product.createdAt)) {
                groups.today.items.push(product);
            } else if (isYesterday(product.createdAt)) {
                groups.yesterday.items.push(product);
            } else {
                groups.earlier.items.push(product);
            }
        });

        return groups;
    }, [processedProducts, dateFilter]);

    // Handle clicking a product card to view full details
    const handleProductClick = (product) => {
        const enrichedProduct = {
            ...product,
            farmerId: farmer.id || farmer._id,
            farmerName: farmer.name,
            farmerRating: farmer.averageRating || 0,
            farmerLocation: farmer.address
        };
        setSelectedProductDetails(enrichedProduct);
    };

    // Handle Direct View Bids
    const handleViewBids = (e, product) => {
        e.stopPropagation();
        const productId = product.id || product._id;
        navigate(`/farmer/product-bids/${productId}`);
    };

    // Handle Add To Cart
    const handleAddToCart = (product, qty = 1) => {
        if (!currentUser) {
            toast.error('Please login to add items to your cart');
            navigate('/login');
            return;
        }

        const quantity = parseFloat(qty) || 1;
        const availableStock = parseFloat(product.quantity) || 0;

        if (quantity <= 0) {
            toast.error('Please enter a valid quantity');
            return;
        }

        if (quantity > availableStock) {
            toast.error(`Only ${availableStock} kg available`);
            return;
        }

        try {
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            const productId = product.id || product._id;
            const existingIndex = cart.findIndex(item => (item.id || item._id) === productId);
            const price = product.pricePerKg !== undefined ? product.pricePerKg : (product.ratePerKg || product.price || 0);

            if (existingIndex > -1) {
                const newTotalQty = cart[existingIndex].quantity + quantity;
                if (newTotalQty > availableStock) {
                    toast.warning(`Total in cart cannot exceed available stock (${availableStock} kg)`);
                    return;
                }
                cart[existingIndex].quantity = newTotalQty;
                cart[existingIndex].totalPrice = cart[existingIndex].quantity * price;
            } else {
                cart.push({
                    id: productId,
                    _id: productId,
                    productId: productId,
                    name: product.name || product.vegetableType,
                    vegetableType: product.name || product.vegetableType,
                    pricePerKg: price,
                    ratePerKg: price,
                    quantity: quantity,
                    totalPrice: price * quantity,
                    farmerId: farmer.id || farmer._id,
                    farmerName: farmer.name,
                    image: product.images && product.images.length > 0 ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url) : null
                });
            }

            localStorage.setItem('cart', JSON.stringify(cart));
            window.dispatchEvent(new Event('storage'));
            toast.success(`Added ${quantity} kg of ${product.name || 'product'} to cart!`);
            setSelectedProductDetails(null);
        } catch (e) {
            console.error('Error adding to cart:', e);
            toast.error('Failed to add to cart');
        }
    };

    // Handle Talk to Farmer
    const handleTalkToFarmer = (product) => {
        if (!currentUser) {
            toast.error('Please login to chat with the farmer');
            navigate('/login');
            return;
        }

        setSelectedProductDetails(null);
        setChatProduct({
            id: product.id || product._id,
            name: product.name || product.vegetableType
        });
        setShowChat(true);
    };

    // Handle Make Offer
    const handleOpenMakeOffer = (e, product) => {
        if (e && e.stopPropagation) e.stopPropagation();
        if (!currentUser) {
            toast.error('Please login to make an offer');
            navigate('/login');
            return;
        }

        setSelectedProductDetails(null);
        setSelectedProductForOffer(product);
        setOfferData({
            price: product.pricePerKg || product.ratePerKg || '',
            quantity: '1'
        });
        setShowOfferModal(true);
    };

    const handleSubmitOffer = async (e) => {
        e.preventDefault();
        if (!offerData.price || !offerData.quantity) {
            toast.error('Please enter both offered price and quantity');
            return;
        }

        const offeredPrice = parseFloat(offerData.price);
        const quantity = parseFloat(offerData.quantity);

        if (offeredPrice <= 0 || quantity <= 0) {
            toast.error('Price and quantity must be greater than zero');
            return;
        }

        if (quantity > (parseFloat(selectedProductForOffer.quantity) || 0)) {
            toast.error(`Quantity cannot exceed available stock (${selectedProductForOffer.quantity} kg)`);
            return;
        }

        try {
            setSubmittingOffer(true);
            const response = await apiService.createNegotiation({
                productId: selectedProductForOffer.id || selectedProductForOffer._id,
                offeredPrice,
                quantity
            });

            if (response.success) {
                toast.success('Offer submitted to farmer successfully!');
                setShowOfferModal(false);
                setSelectedProductForOffer(null);
            } else {
                toast.error(response.message || 'Failed to submit offer');
            }
        } catch (err) {
            console.error('Offer submission error:', err);
            toast.error(err.response?.data?.message || 'Error submitting offer');
        } finally {
            setSubmittingOffer(false);
        }
    };

    // Render Single Product Card
    const renderProductCard = (product) => {
        const imagesCount = product.images ? product.images.length : 0;
        const firstImage = product.images && product.images.length > 0
            ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url)
            : null;

        const uploadedToday = isToday(product.createdAt);
        const uploadedYesterday = isYesterday(product.createdAt);

        return (
            <motion.div
                key={product.id || product._id}
                className="product-card"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -6 }}
                onClick={() => handleProductClick(product)}
                title="Click to view all photos & details"
            >
                <div className="product-image">
                    {firstImage ? (
                        <img
                            src={firstImage}
                            alt={product.name}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect fill='%23f1f5f9' width='300' height='200'/%3E%3Ctext fill='%2394a3b8' font-family='sans-serif' font-size='18' font-weight='bold' x='50%25' y='50%25' text-anchor='middle' dy='6'%3ENo Image%3C/text%3E%3C/svg%3E";
                            }}
                        />
                    ) : (
                        <div className="no-image">
                            <i className="fas fa-leaf"></i>
                        </div>
                    )}

                    {/* Date-wise Upload Badge on Image Corner */}
                    <div className={`product-date-badge ${uploadedToday ? 'today-glow' : (uploadedYesterday ? 'yesterday' : 'regular')}`}>
                        {uploadedToday ? (
                            <span><i className="fas fa-sparkles"></i> 🌱 Uploaded Today</span>
                        ) : uploadedYesterday ? (
                            <span><i className="fas fa-history"></i> Yesterday</span>
                        ) : (
                            <span><i className="fas fa-calendar-alt"></i> {new Date(product.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                        )}
                    </div>

                    <div className="product-stock-badge">
                        <i className="fas fa-box" style={{ marginRight: '4px' }}></i>{product.quantity} kg
                    </div>

                    {imagesCount > 1 && (
                        <div className="photo-count-badge">
                            <i className="fas fa-camera"></i> {imagesCount} Photos
                        </div>
                    )}

                    <div className="card-hover-overlay">
                        <span><i className="fas fa-expand-arrows-alt"></i> View Full Details & Gallery</span>
                    </div>
                </div>

                <div className="product-info">
                    <div className="product-header">
                        <div>
                            <h3>{product.name}</h3>
                            <span className="product-category-tag">{product.category || 'Vegetables'}</span>
                        </div>
                        <span className="price">₹{product.pricePerKg || product.ratePerKg || product.price}/kg</span>
                    </div>

                    <p className="description">
                        {product.description || 'Fresh harvested produce direct from the farm.'}
                    </p>

                    <div className="product-meta">
                        <div className="meta-row">
                            <span>
                                <i className="fas fa-clock" style={{ color: '#3b82f6' }}></i>
                                Uploaded: <strong>{new Date(product.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong>
                            </span>
                        </div>

                        {product.harvestingDate && (
                            <div className="meta-row">
                                <span>
                                    <i className="fas fa-seedling" style={{ color: '#10b981' }}></i>
                                    Harvested: {new Date(product.harvestingDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons Section */}
                    <div className="product-actions-toolbar" style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '10px' }}>
                        {/* Option: View Bid & Offers */}
                        <button
                            className="view-bids-card-btn"
                            onClick={(e) => handleViewBids(e, product)}
                            title="View all live bids, negotiations and offers on this crop"
                            style={{
                                flex: 1,
                                padding: '0.65rem 0.75rem',
                                background: '#3b82f6',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '10px',
                                fontSize: '0.85rem',
                                fontWeight: '700',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                boxShadow: '0 2px 6px rgba(59, 130, 246, 0.25)'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = '#2563eb'}
                            onMouseOut={(e) => e.currentTarget.style.background = '#3b82f6'}
                        >
                            <i className="fas fa-gavel"></i> View Bids
                        </button>

                        {/* Make Offer / Bid Button for Buyers */}
                        {!isFarmerOwner && (
                            <button
                                className="make-offer-card-btn"
                                onClick={(e) => handleOpenMakeOffer(e, product)}
                                style={{
                                    padding: '0.65rem 0.85rem',
                                    background: '#ecfdf5',
                                    color: '#059669',
                                    border: '1px solid #a7f3d0',
                                    borderRadius: '10px',
                                    fontSize: '0.85rem',
                                    fontWeight: '700',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                <i className="fas fa-handshake"></i> Offer
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        );
    };

    if (loading) {
        return (
            <div className="dashboard-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (error || !farmer) {
        return (
            <div className="dashboard-container" style={{ textAlign: 'center', padding: '4rem' }}>
                <h2>Farmer not found</h2>
                <button className="btn btn-primary" onClick={() => navigate(-1)}>Go Back</button>
            </div>
        );
    }

    return (
        <div className="buyer-dashboard" style={{ minHeight: '90vh', background: '#f8fafc', padding: '100px 1rem 3rem 1rem' }}>
            <div className="dashboard-container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <button
                    className="btn btn-outline"
                    onClick={() => navigate(-1)}
                    style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#334155', borderColor: '#cbd5e1', background: '#ffffff' }}
                >
                    <i className="fas fa-arrow-left"></i> Back
                </button>

                {/* Farmer Header Profile Card */}
                <motion.div
                    className="farmer-profile-header"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="farmer-avatar">
                        <i className="fas fa-user-circle"></i>
                    </div>

                    <h1 style={{ marginBottom: '0.35rem', color: '#0f172a', fontWeight: '800' }}>{farmer.name}</h1>

                    {farmer.farmName && (
                        <h3 style={{ color: '#10b981', marginBottom: '0.75rem', fontWeight: '700' }}>
                            <i className="fas fa-tractor" style={{ marginRight: '0.5rem' }}></i>
                            {farmer.farmName}
                        </h3>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                        <StarRating rating={farmer.averageRating || 0} readOnly size="1.2rem" />
                        <span style={{ color: '#64748b', fontWeight: '600' }}>
                            ({farmer.totalRatings || 0} customer reviews)
                        </span>
                    </div>

                    <div style={{ display: 'flex', gap: '1.5rem', color: '#64748b', flexWrap: 'wrap', justifyContent: 'center', fontSize: '0.9rem' }}>
                        {farmer.address && (
                            <span><i className="fas fa-map-marker-alt" style={{ marginRight: '0.4rem', color: '#ef4444' }}></i>{farmer.address}</span>
                        )}
                        <span><i className="fas fa-calendar-alt" style={{ marginRight: '0.4rem', color: '#3b82f6' }}></i>Member since {new Date(farmer.createdAt).getFullYear()}</span>
                        <span><i className="fas fa-seedling" style={{ marginRight: '0.4rem', color: '#10b981' }}></i>{displayProducts.length} Available Crops</span>
                    </div>
                </motion.div>

                {/* Date-wise Filter & Controls Toolbar */}
                <div style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    padding: '1.25rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                    border: '1px solid #e2e8f0',
                    marginBottom: '2rem'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '1rem',
                        marginBottom: '1rem'
                    }}>
                        <div>
                            <h2 style={{ margin: '0 0 0.25rem 0', fontSize: '1.4rem', color: '#0f172a', fontWeight: '800' }}>
                                Available Unsold Produce ({displayProducts.length})
                            </h2>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '0.88rem' }}>
                                View all freshly available unsold crops with live order and bidding access
                            </p>
                        </div>

                        {/* Search Input */}
                        <div style={{ position: 'relative', width: '260px' }}>
                            <i className="fas fa-search" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
                            <input
                                type="text"
                                placeholder="Search crops by name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.55rem 0.75rem 0.55rem 2.2rem',
                                    borderRadius: '10px',
                                    border: '1px solid #cbd5e1',
                                    fontSize: '0.88rem',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    {/* Filter Tabs & Sort Dropdown */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '0.75rem',
                        borderTop: '1px solid #f1f5f9',
                        paddingTop: '0.85rem'
                    }}>
                        {/* Date Wise Tabs */}
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <button
                                onClick={() => setDateFilter('all')}
                                style={{
                                    padding: '0.45rem 0.9rem',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: dateFilter === 'all' ? '#10b981' : '#f1f5f9',
                                    color: dateFilter === 'all' ? '#ffffff' : '#334155',
                                    fontWeight: '700',
                                    fontSize: '0.85rem',
                                    cursor: 'pointer'
                                }}
                            >
                                All Produce ({products.length})
                            </button>

                            <button
                                onClick={() => setDateFilter('today')}
                                style={{
                                    padding: '0.45rem 0.9rem',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: dateFilter === 'today' ? '#059669' : (todayCount > 0 ? '#ecfdf5' : '#f1f5f9'),
                                    color: dateFilter === 'today' ? '#ffffff' : (todayCount > 0 ? '#059669' : '#64748b'),
                                    fontWeight: '700',
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <span>🌱 Today's Uploads</span>
                                <span style={{
                                    background: dateFilter === 'today' ? '#ffffff' : '#10b981',
                                    color: dateFilter === 'today' ? '#059669' : '#ffffff',
                                    borderRadius: '10px',
                                    padding: '1px 6px',
                                    fontSize: '0.72rem',
                                    fontWeight: 'bold'
                                }}>
                                    {todayCount}
                                </span>
                            </button>

                            <button
                                onClick={() => setDateFilter('yesterday')}
                                style={{
                                    padding: '0.45rem 0.9rem',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: dateFilter === 'yesterday' ? '#3b82f6' : '#f1f5f9',
                                    color: dateFilter === 'yesterday' ? '#ffffff' : '#334155',
                                    fontWeight: '600',
                                    fontSize: '0.85rem',
                                    cursor: 'pointer'
                                }}
                            >
                                📅 Yesterday ({yesterdayCount})
                            </button>

                            <button
                                onClick={() => setDateFilter('grouped')}
                                style={{
                                    padding: '0.45rem 0.9rem',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: dateFilter === 'grouped' ? '#6366f1' : '#f1f5f9',
                                    color: dateFilter === 'grouped' ? '#ffffff' : '#334155',
                                    fontWeight: '700',
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}
                            >
                                <i className="fas fa-layer-group"></i> Group Date-Wise
                            </button>
                        </div>

                        {/* Sort Dropdown */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>Sort by:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                style={{
                                    padding: '0.45rem 0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid #cbd5e1',
                                    fontSize: '0.85rem',
                                    fontWeight: '600',
                                    color: '#1e293b',
                                    outline: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="newest">📅 Upload Date (Newest First)</option>
                                <option value="oldest">📅 Upload Date (Oldest First)</option>
                                <option value="price_high">💰 Price (High to Low)</option>
                                <option value="price_low">🏷️ Price (Low to High)</option>
                                <option value="quantity_high">⚖️ Available Quantity (High to Low)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Produce Listings Section */}
                {processedProducts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3.5rem 2rem', background: 'white', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <i className="fas fa-seedling" style={{ fontSize: '3rem', color: '#cbd5e1', marginBottom: '1rem', display: 'block' }}></i>
                        <h3 style={{ color: '#475569', marginBottom: '0.5rem' }}>No products found</h3>
                        <p style={{ color: '#94a3b8' }}>
                            {dateFilter === 'today'
                                ? "No crops were uploaded today yet. Try selecting 'All Produce'."
                                : "No crops match your current search or filter criteria."}
                        </p>
                    </div>
                ) : dateFilter === 'grouped' && groupedProducts ? (
                    // Grouped Date-Wise Sections
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                        {/* Today's Section */}
                        {groupedProducts.today.items.length > 0 && (
                            <div className="date-group-section">
                                <div className="date-group-header today">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span className="date-group-icon">🌱</span>
                                        <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#065f46', fontWeight: '800' }}>
                                            Today's Uploads
                                        </h3>
                                    </div>
                                    <span className="date-group-count-badge today">
                                        {groupedProducts.today.items.length} fresh crop{groupedProducts.today.items.length > 1 ? 's' : ''}
                                    </span>
                                </div>
                                <div className="products-grid">
                                    {groupedProducts.today.items.map(renderProductCard)}
                                </div>
                            </div>
                        )}

                        {/* Yesterday's Section */}
                        {groupedProducts.yesterday.items.length > 0 && (
                            <div className="date-group-section">
                                <div className="date-group-header yesterday">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span className="date-group-icon">📅</span>
                                        <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1e40af', fontWeight: '800' }}>
                                            Uploaded Yesterday
                                        </h3>
                                    </div>
                                    <span className="date-group-count-badge yesterday">
                                        {groupedProducts.yesterday.items.length} crop{groupedProducts.yesterday.items.length > 1 ? 's' : ''}
                                    </span>
                                </div>
                                <div className="products-grid">
                                    {groupedProducts.yesterday.items.map(renderProductCard)}
                                </div>
                            </div>
                        )}

                        {/* Earlier Section */}
                        {groupedProducts.earlier.items.length > 0 && (
                            <div className="date-group-section">
                                <div className="date-group-header earlier">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span className="date-group-icon">🗓️</span>
                                        <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#334155', fontWeight: '800' }}>
                                            Earlier Listings
                                        </h3>
                                    </div>
                                    <span className="date-group-count-badge earlier">
                                        {groupedProducts.earlier.items.length} crop{groupedProducts.earlier.items.length > 1 ? 's' : ''}
                                    </span>
                                </div>
                                <div className="products-grid">
                                    {groupedProducts.earlier.items.map(renderProductCard)}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    // Regular Products Grid
                    <div className="products-grid">
                        {processedProducts.map(renderProductCard)}
                    </div>
                )}
            </div>

            {/* Product Details & Gallery Modal */}
            <ProductDetailsModal
                isOpen={!!selectedProductDetails}
                onClose={() => setSelectedProductDetails(null)}
                product={selectedProductDetails}
                onTalkToFarmer={handleTalkToFarmer}
                onAddToCart={handleAddToCart}
                onMakeOffer={(product) => handleOpenMakeOffer(null, product)}
            />

            {/* Chat Modal */}
            {showChat && farmer && (
                <ChatModal
                    isOpen={showChat}
                    onClose={() => {
                        setShowChat(false);
                        setChatProduct(null);
                    }}
                    farmer={{
                        id: farmer.id || farmer._id,
                        name: farmer.name
                    }}
                    product={chatProduct}
                    currentUser={currentUser}
                />
            )}

            {/* Make Offer / Negotiation Modal */}
            <AnimatePresence>
                {showOfferModal && selectedProductForOffer && (
                    <div className="modal-overlay" onClick={() => setShowOfferModal(false)}>
                        <motion.div
                            className="offer-modal-content"
                            onClick={(e) => e.stopPropagation()}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            style={{
                                background: '#ffffff',
                                borderRadius: '20px',
                                padding: '2rem',
                                width: '100%',
                                maxWidth: '450px',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ margin: 0, color: '#0f172a' }}>Make an Offer / Bid</h3>
                                <button
                                    onClick={() => setShowOfferModal(false)}
                                    style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer' }}
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>

                            <div style={{ marginBottom: '1.25rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <h4 style={{ margin: '0 0 0.25rem 0', color: '#1e293b' }}>{selectedProductForOffer.name}</h4>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#64748b' }}>
                                    <span>Asking: <strong>₹{selectedProductForOffer.pricePerKg || selectedProductForOffer.ratePerKg || selectedProductForOffer.price}/kg</strong></span>
                                    <span>Stock: <strong>{selectedProductForOffer.quantity} kg</strong></span>
                                </div>
                            </div>

                            <form onSubmit={handleSubmitOffer}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.9rem', color: '#334155' }}>
                                        Your Offer Price (₹ per kg)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        min="1"
                                        placeholder="e.g. 32"
                                        value={offerData.price}
                                        onChange={(e) => setOfferData({ ...offerData, price: e.target.value })}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            borderRadius: '10px',
                                            border: '1px solid #cbd5e1',
                                            fontSize: '1rem',
                                            outline: 'none'
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.9rem', color: '#334155' }}>
                                        Required Quantity (kg)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max={selectedProductForOffer.quantity}
                                        placeholder={`Max ${selectedProductForOffer.quantity} kg`}
                                        value={offerData.quantity}
                                        onChange={(e) => setOfferData({ ...offerData, quantity: e.target.value })}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            borderRadius: '10px',
                                            border: '1px solid #cbd5e1',
                                            fontSize: '1rem',
                                            outline: 'none'
                                        }}
                                    />
                                </div>

                                {offerData.price && offerData.quantity && (
                                    <div style={{
                                        background: '#ecfdf5',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '10px',
                                        border: '1px solid #a7f3d0',
                                        marginBottom: '1.5rem',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <span style={{ color: '#065f46', fontSize: '0.9rem', fontWeight: '600' }}>Estimated Total:</span>
                                        <span style={{ color: '#059669', fontSize: '1.2rem', fontWeight: '800' }}>
                                            ₹{(parseFloat(offerData.price || 0) * parseFloat(offerData.quantity || 0)).toFixed(2)}
                                        </span>
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <button
                                        type="button"
                                        onClick={() => setShowOfferModal(false)}
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem',
                                            borderRadius: '10px',
                                            border: '1px solid #cbd5e1',
                                            background: '#f8fafc',
                                            fontWeight: '600',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submittingOffer}
                                        style={{
                                            flex: 2,
                                            padding: '0.75rem',
                                            borderRadius: '10px',
                                            border: 'none',
                                            background: '#10b981',
                                            color: '#ffffff',
                                            fontWeight: '700',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {submittingOffer ? 'Submitting...' : 'Send Offer to Farmer'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FarmerProfile;
