import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../../styles/ProductDetailsModal.css';

import authUtils from '../../utils/auth';

const ProductDetailsModal = ({ isOpen, onClose, product, onTalkToFarmer, onAddToCart, onMakeOffer }) => {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        if (isOpen) {
            setSelectedImageIndex(0);
            setQuantity(1);
        }
    }, [isOpen, product]);

    if (!isOpen || !product) return null;

    // Check if logged in user is the owner of this product
    const currentUser = authUtils.getUser();
    const currentUserId = currentUser?._id || currentUser?.id;
    const farmerId = product.farmerId?.id || product.farmerId?._id || product.farmerId || product.farmer?.id || product.farmer?._id;
    const isOwner = Boolean(currentUserId && farmerId && String(currentUserId) === String(farmerId));

    // Normalize images list
    const rawImages = product.images || [];
    let images = [];
    if (Array.isArray(rawImages) && rawImages.length > 0) {
        images = rawImages.map(img => {
            if (typeof img === 'string') return img;
            if (img && typeof img === 'object') return img.url || img.secure_url || '';
            return '';
        }).filter(Boolean);
    } else if (product.image) {
        images = [typeof product.image === 'string' ? product.image : product.image.url];
    }

    if (images.length === 0) {
        images = ["data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect fill='%23f1f5f9' width='600' height='400'/%3E%3Ctext fill='%2394a3b8' font-family='system-ui, sans-serif' font-size='24' font-weight='600' x='50%25' y='50%25' text-anchor='middle' dy='8'%3ENo Image Uploaded%3C/text%3E%3C/svg%3E"];
    }

    const productName = product.name || product.vegetableType || 'Agricultural Product';
    const price = product.pricePerKg !== undefined ? product.pricePerKg : (product.ratePerKg !== undefined ? product.ratePerKg : (product.price || 0));
    const availableQty = parseFloat(product.quantity) || 0;
    const farmerName = product.farmerName || (product.farmer && product.farmer.name) || 'DirectFarm Producer';
    const farmerRating = parseFloat(product.farmerRating || (product.farmer && product.farmer.averageRating) || 0);

    // Location formatting
    let locationText = '';
    if (product.location) {
        if (typeof product.location === 'string') {
            locationText = product.location;
        } else if (typeof product.location === 'object') {
            locationText = [product.location.village, product.location.subdistrict, product.location.district, product.location.state]
                .filter(Boolean)
                .join(', ');
        }
    }

    const handlePrevImage = (e) => {
        e.stopPropagation();
        setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleNextImage = (e) => {
        e.stopPropagation();
        setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const handleAddToCartClick = () => {
        if (onAddToCart) {
            onAddToCart(product, quantity);
        }
    };

    const handleTalkClick = () => {
        if (onTalkToFarmer) {
            onTalkToFarmer(product);
        }
    };

    const handleOfferClick = () => {
        if (onMakeOffer) {
            onMakeOffer(product);
        }
    };

    return (
        <AnimatePresence>
            <div className="modal-overlay" onClick={onClose}>
                <motion.div
                    className="product-details-modal"
                    onClick={(e) => e.stopPropagation()}
                    initial={{ opacity: 0, scale: 0.92, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: 20 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                    <button className="close-btn" onClick={onClose} aria-label="Close product details">
                        <i className="fas fa-times"></i>
                    </button>

                    <div className="modal-content-grid">
                        {/* Left: Image Gallery */}
                        <div className="gallery-section">
                            <div className="main-image">
                                <img
                                    src={images[selectedImageIndex]}
                                    alt={`${productName} - view ${selectedImageIndex + 1}`}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect fill='%23f1f5f9' width='600' height='400'/%3E%3Ctext fill='%2394a3b8' font-family='system-ui, sans-serif' font-size='24' font-weight='600' x='50%25' y='50%25' text-anchor='middle' dy='8'%3ENo Image%3C/text%3E%3C/svg%3E";
                                    }}
                                />

                                {images.length > 1 && (
                                    <>
                                        <button className="nav-arrow prev-arrow" onClick={handlePrevImage} title="Previous picture">
                                            <i className="fas fa-chevron-left"></i>
                                        </button>
                                        <button className="nav-arrow next-arrow" onClick={handleNextImage} title="Next picture">
                                            <i className="fas fa-chevron-right"></i>
                                        </button>
                                        <div className="image-counter">
                                            <i className="fas fa-camera"></i> {selectedImageIndex + 1} / {images.length}
                                        </div>
                                    </>
                                )}

                                {product.category && (
                                    <span className="gallery-category-badge">{product.category}</span>
                                )}
                            </div>

                            {/* Thumbnail strip */}
                            {images.length > 1 && (
                                <div className="thumbnails">
                                    {images.map((img, index) => (
                                        <div
                                            key={index}
                                            className={`thumbnail ${selectedImageIndex === index ? 'active' : ''}`}
                                            onClick={() => setSelectedImageIndex(index)}
                                            title={`Photo ${index + 1}`}
                                        >
                                            <img
                                                src={img}
                                                alt={`Thumbnail ${index + 1}`}
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='60' viewBox='0 0 80 60'%3E%3Crect fill='%23f1f5f9' width='80' height='60'/%3E%3C/svg%3E";
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right: Product Info & Details */}
                        <div className="info-section">
                            <div className="header-info">
                                <h2>{productName}</h2>
                                <div className="farmer-badge">
                                    <i className="fas fa-user-circle"></i>
                                    <span>{farmerName}</span>
                                    {farmerRating > 0 && (
                                        <span className="rating">
                                            <i className="fas fa-star"></i> {farmerRating.toFixed(1)}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="price-tag">
                                <span className="amount">₹{price}</span>
                                <span className="unit">/ kg</span>
                            </div>

                            <div className="details-grid">
                                <div className="detail-item">
                                    <span className="label"><i className="fas fa-boxes"></i> In Stock</span>
                                    <span className="value">{availableQty} kg</span>
                                </div>
                                <div className="detail-item">
                                    <span className="label"><i className="fas fa-tag"></i> Category</span>
                                    <span className="value">{product.category || 'General'}</span>
                                </div>
                                {product.harvestingDate && (
                                    <div className="detail-item">
                                        <span className="label"><i className="fas fa-calendar-check"></i> Harvest Date</span>
                                        <span className="value">{new Date(product.harvestingDate).toLocaleDateString()}</span>
                                    </div>
                                )}
                                {product.shelfLife && (
                                    <div className="detail-item">
                                        <span className="label"><i className="fas fa-hourglass-half"></i> Shelf Life</span>
                                        <span className="value">{product.shelfLife}</span>
                                    </div>
                                )}
                            </div>

                            {locationText && (
                                <div className="location-info">
                                    <i className="fas fa-map-marker-alt"></i>
                                    <span>{locationText}</span>
                                </div>
                            )}

                            {product.description && (
                                <div className="description">
                                    <h3><i className="fas fa-align-left" style={{ marginRight: '0.5rem', color: '#10b981' }}></i>Description</h3>
                                    <p>{product.description}</p>
                                </div>
                            )}

                            {/* Quantity & Actions for Buyers vs Owner Banner */}
                            {isOwner ? (
                                <div className="owner-product-banner" style={{
                                    background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                                    border: '1px solid #a7f3d0',
                                    borderRadius: '14px',
                                    padding: '1.25rem',
                                    marginTop: '1.5rem',
                                    textAlign: 'center',
                                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.08)'
                                }}>
                                    <div style={{ color: '#047857', fontWeight: 800, fontSize: '1.05rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                        <i className="fas fa-user-check" style={{ color: '#10b981' }}></i>
                                        This is your listed crop
                                    </div>
                                    <p style={{ color: '#065f46', fontSize: '0.85rem', margin: '0.4rem 0 0 0', lineHeight: 1.4 }}>
                                        Buyers can view details and submit offers for this produce. You can manage status, edit details, and review received bids directly from your Farmer Dashboard.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* Quantity Selection */}
                                    <div className="quantity-selection">
                                        <label><i className="fas fa-balance-scale"></i> Purchase Quantity</label>
                                        <div className="quantity-control-wrapper">
                                            <div className="quantity-controls">
                                                <button
                                                    type="button"
                                                    className="qty-btn"
                                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                    disabled={quantity <= 1}
                                                >
                                                    <i className="fas fa-minus"></i>
                                                </button>
                                                <input
                                                    type="number"
                                                    value={quantity}
                                                    onChange={(e) => {
                                                        const val = parseFloat(e.target.value);
                                                        if (!isNaN(val)) {
                                                            setQuantity(Math.min(availableQty, Math.max(1, val)));
                                                        }
                                                    }}
                                                    max={availableQty}
                                                    min="1"
                                                    className="qty-input"
                                                />
                                                <button
                                                    type="button"
                                                    className="qty-btn"
                                                    onClick={() => setQuantity(Math.min(availableQty, quantity + 1))}
                                                    disabled={quantity >= availableQty}
                                                >
                                                    <i className="fas fa-plus"></i>
                                                </button>
                                            </div>
                                            <span className="qty-unit">kg (Total: ₹{(price * quantity).toFixed(2)})</span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="action-buttons">
                                        <div className="action-row">
                                            {onTalkToFarmer && (
                                                <button className="btn-chat" onClick={handleTalkClick}>
                                                    <i className="fas fa-comment-dots"></i> Chat with Farmer
                                                </button>
                                            )}
                                            {onMakeOffer && (
                                                <button className="btn-offer" onClick={handleOfferClick}>
                                                    <i className="fas fa-handshake"></i> Make an Offer
                                                </button>
                                            )}
                                        </div>
                                        {onAddToCart && (
                                            <button
                                                className="btn-cart"
                                                onClick={handleAddToCartClick}
                                                disabled={availableQty <= 0}
                                            >
                                                <i className="fas fa-cart-plus"></i> Add to Cart • ₹{(price * quantity).toFixed(2)}
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ProductDetailsModal;
