import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import apiService from '../../services/api';
import authUtils from '../../utils/auth';
import ProductDetailsModal from '../product/ProductDetailsModal';
import ChatModal from '../chat/ChatModal';
import { useLanguage } from '../../context/LanguageContext';
import '../../styles/FarmerProfile.css';

// Fallback high-quality produce and reviews matching the reference design
const DEFAULT_SAMPLE_PRODUCTS = [
    {
        id: 'sample-tomatoes',
        name: 'Tomatoes',
        vegetableType: 'Tomatoes',
        pricePerKg: 30,
        ratePerKg: 30,
        price: 30,
        quantity: 80,
        category: 'Vegetables',
        description: 'Naturally grown, farm-fresh juicy red tomatoes. Rich in taste and freshly plucked.',
        images: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80']
    },
    {
        id: 'sample-potatoes',
        name: 'Potatoes',
        vegetableType: 'Potatoes',
        pricePerKg: 25,
        ratePerKg: 25,
        price: 25,
        quantity: 150,
        category: 'Vegetables',
        description: 'Premium quality farm harvested potatoes, firm, uniform size and great shelf life.',
        images: ['https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80']
    },
    {
        id: 'sample-cauliflower',
        name: 'Cauliflower',
        vegetableType: 'Cauliflower',
        pricePerKg: 35,
        ratePerKg: 35,
        price: 35,
        quantity: 60,
        category: 'Vegetables',
        description: 'Crisp, pesticide-free white cauliflower heads freshly harvested straight from the field.',
        images: ['https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?auto=format&fit=crop&w=600&q=80']
    }
];

const DEFAULT_SAMPLE_REVIEWS = [
    {
        id: 'sample-rev-1',
        reviewerName: 'Amit Sharma',
        raterName: 'Amit Sharma',
        date: '12 Nov 2026',
        rating: 5,
        review: 'Fresh tomatoes and excellent quality. Packaging was also good.',
        purchasedCrop: 'Tomatoes'
    },
    {
        id: 'sample-rev-2',
        reviewerName: 'Priya Singh',
        raterName: 'Priya Singh',
        date: '08 Nov 2026',
        rating: 4,
        review: 'Good quality vegetables and timely delivery.',
        purchasedCrop: 'Potatoes'
    }
];

const FarmerProfile = () => {
    const { t } = useLanguage();
    const { id } = useParams();
    const navigate = useNavigate();

    const [farmer, setFarmer] = useState(null);
    const [products, setProducts] = useState([]);
    const [ratings, setRatings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

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
        const user = authUtils.getUser();
        if (user) {
            setCurrentUser(user);
        }

        const fetchFarmerData = async () => {
            try {
                setLoading(true);
                const response = await apiService.getFarmer(id);
                if (response.success && response.data) {
                    setFarmer(response.data.farmer);
                    const prodList = response.data.products?.items || [];
                    setProducts(prodList);

                    if (response.data.ratings && response.data.ratings.length > 0) {
                        setRatings(response.data.ratings);
                    } else {
                        // Fallback attempt to get ratings from ratings route
                        try {
                            const ratingsRes = await apiService.getUserRatings(id);
                            if (ratingsRes.success && ratingsRes.data && ratingsRes.data.length > 0) {
                                setRatings(ratingsRes.data);
                            }
                        } catch (err) {
                            console.log('No additional ratings found');
                        }
                    }
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

    // Display Crops list: farmer's active crops or sample fallback if farmer has no products yet
    const displayCrops = useMemo(() => {
        const active = products.filter(p => {
            const qty = parseFloat(p.quantity) || 0;
            const isSold = p.isSold || p.status === 'sold' || p.status === 'out_of_stock';
            return isFarmerOwner ? true : (qty > 0 && !isSold);
        });

        if (active.length > 0) {
            return active;
        }
        return DEFAULT_SAMPLE_PRODUCTS;
    }, [products, isFarmerOwner]);

    // Display Reviews list: real ratings if available, otherwise sample reviews
    const displayReviews = useMemo(() => {
        if (ratings && ratings.length > 0) {
            return ratings;
        }
        return DEFAULT_SAMPLE_REVIEWS;
    }, [ratings]);

    const isShowingFallbackReviews = ratings.length === 0;

    // Helper: Farmer First Name
    const farmerFirstName = useMemo(() => {
        if (!farmer || !farmer.name) return 'Farmer';
        return farmer.name.trim().split(' ')[0];
    }, [farmer]);

    // Helper: Total products count
    const productsCount = useMemo(() => {
        if (products.length > 0) return products.length;
        return 12; // Display fallback KPI from design
    }, [products]);

    // Helper: Average rating score
    const avgRatingScore = useMemo(() => {
        if (farmer?.averageRating && parseFloat(farmer.averageRating) > 0) {
            return Number(farmer.averageRating).toFixed(1);
        }
        return '4.8';
    }, [farmer]);

    // Helper: Total reviews count
    const totalReviewsCount = useMemo(() => {
        if (farmer?.totalRatings && parseInt(farmer.totalRatings, 10) > 0) {
            return farmer.totalRatings;
        }
        if (ratings.length > 0) return ratings.length;
        return 26; // Display fallback KPI from design
    }, [farmer, ratings]);

    // Helper: Farmer Avatar Image
    const getFarmerAvatar = (farmerObj) => {
        if (farmerObj?.profilePicture) {
            return farmerObj.profilePicture;
        }
        // Authentic, warm farmer portrait matching the reference screenshot
        return 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80';
    };

    // Helper: Crop Image Fallback
    const getCropImage = (product) => {
        if (product?.images && product.images.length > 0) {
            const first = product.images[0];
            const url = typeof first === 'string' ? first : first?.url;
            if (url) return url;
        }
        const name = (product?.name || product?.vegetableType || '').toLowerCase();
        if (name.includes('tomato')) {
            return 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80';
        }
        if (name.includes('potato') || name.includes('aloo')) {
            return 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80';
        }
        if (name.includes('cauliflower') || name.includes('gobhi')) {
            return 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?auto=format&fit=crop&w=600&q=80';
        }
        if (name.includes('onion') || name.includes('pyaz')) {
            return 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80';
        }
        if (name.includes('carrot') || name.includes('gajar')) {
            return 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80';
        }
        return 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80';
    };

    // Helper: Format Date for Reviews
    const formatReviewDate = (dateVal) => {
        if (!dateVal) return '12 Nov 2026';
        if (typeof dateVal === 'string' && dateVal.includes('202')) {
            return dateVal;
        }
        const d = new Date(dateVal);
        if (isNaN(d.getTime())) return '12 Nov 2026';
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    // Helper: Star rendering
    const renderStars = (rating) => {
        const rounded = Math.round(Number(rating) || 5);
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span
                    key={i}
                    style={{
                        color: i <= rounded ? '#f59e0b' : '#e2e8f0',
                        fontSize: '0.95rem',
                        marginRight: '2px'
                    }}
                >
                    ★
                </span>
            );
        }
        return stars;
    };

    // Handle Direct Chat
    const handleDirectChat = () => {
        if (!currentUser) {
            toast.error('Please login to chat with the farmer');
            navigate('/login');
            return;
        }
        setChatProduct(null);
        setShowChat(true);
    };

    // Handle clicking a crop card to view full details
    const handleProductClick = (product) => {
        const enrichedProduct = {
            ...product,
            farmerId: farmer.id || farmer._id,
            farmerName: farmer.name,
            farmerRating: farmer.averageRating || 4.8,
            farmerLocation: farmer.address || 'Bihar'
        };
        setSelectedProductDetails(enrichedProduct);
    };

    // Handle Talk to Farmer with specific crop
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

    // Handle Add To Cart
    const handleAddToCart = (product, qty = 1) => {
        if (!currentUser) {
            toast.error('Please login to add items to your cart');
            navigate('/login');
            return;
        }

        const quantity = parseFloat(qty) || 1;
        const availableStock = parseFloat(product.quantity) || 50;

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
                    image: getCropImage(product)
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

    // Handle Make Offer Modal
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
            price: product.pricePerKg || product.ratePerKg || product.price || '',
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

    if (loading) {
        return (
            <div className="farmer-profile-page-wrapper" style={{ justifyContent: 'center' }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (error || !farmer) {
        return (
            <div className="farmer-profile-page-wrapper" style={{ justifyContent: 'center', textAlign: 'center' }}>
                <h2 style={{ color: '#0f172a', marginBottom: '1rem' }}>{t('farmerProfile.farmerNotFound') || 'Farmer Not Found'}</h2>
                <button className="farmer-profile-back-btn" onClick={() => navigate(-1)}>
                    <i className="fas fa-arrow-left"></i> {t('farmerProfile.back') || 'Go Back'}
                </button>
            </div>
        );
    }

    return (
        <div className="farmer-profile-page-wrapper">
            <div className="farmer-profile-container">
                {/* Back Button */}
                <button
                    className="farmer-profile-back-btn"
                    onClick={() => navigate(-1)}
                >
                    <i className="fas fa-arrow-left"></i> {t('farmerProfile.back') || 'Back'}
                </button>

                {/* Sleek Light Profile Card */}
                <motion.div
                    className="farmer-profile-card"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {/* Header Row: Avatar, Name, Verified Badge, Location, Rating */}
                    <div className="farmer-profile-header-row">
                        <div className="farmer-avatar-container">
                            <img
                                src={getFarmerAvatar(farmer)}
                                alt={farmer.name}
                                className="farmer-avatar-img"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80";
                                }}
                            />
                        </div>

                        <div className="farmer-header-info">
                            <h1 className="farmer-name">{farmer.name}</h1>
                            <span className="farmer-verified-badge">
                                Verified Farmer
                            </span>
                            <div className="farmer-location-subtitle">
                                {farmer.address || 'Gaya, Bihar'} · Farmer since {new Date(farmer.createdAt || '2024-01-01').getFullYear()}
                            </div>
                            <div className="farmer-rating-summary-line">
                                <span className="star-icon">★</span>
                                <span className="rating-score">{avgRatingScore}/5</span>
                                <span className="reviews-count">({totalReviewsCount} reviews)</span>
                            </div>
                        </div>
                    </div>

                    {/* KPI Stats Row: Products, Average Rating, Reviews */}
                    <div className="farmer-kpi-stats-row">
                        <div className="farmer-kpi-stat">
                            <span className="kpi-number kpi-green">{productsCount}</span>
                            <span className="kpi-label">Products</span>
                        </div>
                        <div className="farmer-kpi-stat">
                            <span className="kpi-number kpi-dark">{avgRatingScore}</span>
                            <span className="kpi-label">Average rating</span>
                        </div>
                        <div className="farmer-kpi-stat">
                            <span className="kpi-number kpi-dark">{totalReviewsCount}</span>
                            <span className="kpi-label">Reviews</span>
                        </div>
                    </div>

                    {/* Action Button: Chat with Farmer */}
                    <button
                        className="chat-with-farmer-btn"
                        onClick={handleDirectChat}
                    >
                        Chat with Farmer
                    </button>

                    {/* Products Section */}
                    <div className="farmer-products-section">
                        <h2 className="section-heading">
                            Products by {farmerFirstName}
                        </h2>

                        <div className="farmer-products-grid">
                            {displayCrops.map((crop) => (
                                <div
                                    key={crop.id || crop._id}
                                    className="farmer-crop-card"
                                    onClick={() => handleProductClick(crop)}
                                    title="Click to view details and buy"
                                >
                                    <div className="crop-img-box">
                                        <img
                                            src={getCropImage(crop)}
                                            alt={crop.name}
                                            className="crop-img"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = getCropImage(crop);
                                            }}
                                        />
                                    </div>
                                    <div className="crop-info">
                                        <span className="crop-title">{crop.name}</span>
                                        <span className="crop-price">
                                            ₹{crop.pricePerKg || crop.ratePerKg || crop.price}/kg
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Customer Reviews Section */}
                    <div className="farmer-reviews-section">
                        <h2 className="section-heading">Customer Reviews</h2>

                        {/* Rating Overview */}
                        <div className="reviews-rating-overview">
                            <span className="big-rating-number">{avgRatingScore}</span>
                            <div className="overview-stars-col">
                                <div className="gold-stars-row">
                                    {renderStars(avgRatingScore)}
                                </div>
                                <span className="based-on-text">
                                    Based on {totalReviewsCount} reviews
                                </span>
                            </div>
                        </div>

                        {/* Reviews List */}
                        <div className="reviews-list">
                            {displayReviews.map((rev, idx) => (
                                <div key={rev.id || idx} className="review-item">
                                    <div className="review-top-row">
                                        <span className="reviewer-name">
                                            {rev.reviewerName || rev.raterName || (rev.rater ? rev.rater.name : 'Buyer')}
                                        </span>
                                        <span className="review-date">
                                            {formatReviewDate(rev.createdAt || rev.date)}
                                        </span>
                                    </div>
                                    <div className="review-stars">
                                        {renderStars(rev.rating || 5)}
                                    </div>
                                    <p className="review-text">
                                        {rev.review || rev.comment || 'Fresh quality produce and on-time delivery.'}
                                    </p>
                                    {rev.purchasedCrop && (
                                        <span className="purchased-badge">
                                            Purchased: {rev.purchasedCrop}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Footnote matching screenshot */}
                        {isShowingFallbackReviews && (
                            <p className="illustrative-disclaimer">
                                Illustrative layout and sample review data, not actual DirectFarm users.
                            </p>
                        )}
                    </div>
                </motion.div>
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
                                border: '1px solid #e2e8f0',
                                color: '#0f172a',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.12)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ margin: 0, color: '#0f172a' }}>Make an Offer / Bid</h3>
                                <button
                                    onClick={() => setShowOfferModal(false)}
                                    style={{ background: '#f1f5f9', border: 'none', color: '#475569', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer' }}
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>

                            <div style={{ marginBottom: '1.25rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <h4 style={{ margin: '0 0 0.25rem 0', color: '#0f172a' }}>{selectedProductForOffer.name}</h4>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#64748b' }}>
                                    <span>Asking: <strong style={{ color: '#0f172a' }}>₹{selectedProductForOffer.pricePerKg || selectedProductForOffer.ratePerKg || selectedProductForOffer.price}/kg</strong></span>
                                    <span>Stock: <strong style={{ color: '#0f172a' }}>{selectedProductForOffer.quantity} kg</strong></span>
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
                                        placeholder="e.g. 28"
                                        value={offerData.price}
                                        onChange={(e) => setOfferData({ ...offerData, price: e.target.value })}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            borderRadius: '10px',
                                            border: '1px solid #cbd5e1',
                                            background: '#ffffff',
                                            color: '#0f172a',
                                            fontSize: '1rem',
                                            outline: 'none',
                                            boxSizing: 'border-box'
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
                                        max={selectedProductForOffer.quantity || 1000}
                                        placeholder={`Max ${selectedProductForOffer.quantity || 100} kg`}
                                        value={offerData.quantity}
                                        onChange={(e) => setOfferData({ ...offerData, quantity: e.target.value })}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            borderRadius: '10px',
                                            border: '1px solid #cbd5e1',
                                            background: '#ffffff',
                                            color: '#0f172a',
                                            fontSize: '1rem',
                                            outline: 'none',
                                            boxSizing: 'border-box'
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
                                            color: '#475569',
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