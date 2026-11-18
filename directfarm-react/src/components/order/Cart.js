import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useLanguage } from '../../context/LanguageContext';
import '../../styles/Cart.css';

const Cart = () => {
    const { t } = useLanguage();
    const [cartItems, setCartItems] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        loadCart();

        const handleStorageChange = () => {
            loadCart();
        }

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        }
    }, []);

    const loadCart = () => {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartItems(cart);
    };

    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity < 1) return;

        const updatedCart = cartItems.map(item =>
            item.productId === productId
                ? { ...item, quantity: newQuantity, totalPrice: (newQuantity * item.pricePerKg).toFixed(2) }
                : item
        );

        setCartItems(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));

    };

    const removeItem = (productId) => {
        const updatedCart = cartItems.filter(item => item.productId !== productId);
        setCartItems(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        toast.success('Item removed from cart');
    };

    const calculateTotal = () => {
        return cartItems.reduce((sum, item) => sum + parseFloat(item.totalPrice), 0).toFixed(2);
    };

    const clearCart = () => {
        setCartItems([]);
        localStorage.setItem('cart', JSON.stringify([]));
        toast.success('Cart cleared');
    };

    return (
        <div className="cart-page">
            <div className="cart-container">
                <motion.div
                    className="cart-header"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1>
                        <i className="fas fa-shopping-cart"></i>
                        {t('cart.title')}
                    </h1>
                    <p>{t('cart.itemsCount', { count: cartItems.length })}</p>
                </motion.div>

                {cartItems.length === 0 ? (
                    <motion.div
                        className="empty-cart"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <i className="fas fa-shopping-basket"></i>
                        <h2>{t('cart.emptyTitle')}</h2>
                        <p>{t('cart.emptySubtitle')}</p>
                        <button onClick={() => navigate('/buyer-dashboard')} className="browse-btn">
                            <i className="fas fa-leaf"></i>
                            {t('cart.browseProducts')}
                        </button>
                    </motion.div>
                ) : (
                    <>
                        <motion.div
                            className="cart-items"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            {cartItems.map((item, index) => (
                                <motion.div
                                    key={item.productId}
                                    className="cart-item"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.4, delay: index * 0.1 }}
                                >
                                    <div className="item-info">
                                        <div className="item-icon">
                                            <i className="fas fa-seedling"></i>
                                        </div>
                                        <div className="item-details">
                                            <h3>{t(`items.${item.vegetableType}`) !== `items.${item.vegetableType}` ? t(`items.${item.vegetableType}`) : item.vegetableType}</h3>
                                            <p className="farmer-name">
                                                <i className="fas fa-user"></i>
                                                {item.farmerName}
                                            </p>
                                            <p className="price-per-kg">₹{item.pricePerKg}/kg</p>
                                        </div>
                                    </div>

                                    <div className="item-actions">
                                        <div className="quantity-control">
                                            <button
                                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                                className="qty-btn"
                                            >
                                                <i className="fas fa-minus"></i>
                                            </button>
                                            <span className="quantity">{item.quantity} kg</span>
                                            <button
                                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                                className="qty-btn"
                                            >
                                                <i className="fas fa-plus"></i>
                                            </button>
                                        </div>

                                        <div className="item-total">
                                            <span className="total-label">{t('cart.total')}:</span>
                                            <span className="total-price">₹{item.totalPrice}</span>
                                        </div>

                                        <button
                                            onClick={() => removeItem(item.productId)}
                                            className="remove-btn"
                                            title="Remove item"
                                        >
                                            <i className="fas fa-trash-alt"></i>
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>

                        <motion.div
                            className="cart-summary"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                        >
                            <div className="summary-content">
                                <div className="summary-row">
                                    <span>{t('cart.subtotal')}:</span>
                                    <span>₹{calculateTotal()}</span>
                                </div>
                                <div className="summary-row">
                                    <span>{t('cart.deliveryCharge')}:</span>
                                    <span className="free-delivery">{t('cart.freeDelivery')}</span>
                                </div>
                                <div className="summary-divider"></div>
                                <div className="summary-row total-row">
                                    <span>{t('cart.grandTotal')}:</span>
                                    <span className="total-amount">₹{calculateTotal()}</span>
                                </div>
                            </div>

                            <div className="summary-actions">
                                <button onClick={() => navigate('/checkout')} className="pay-btn">
                                    <i className="fas fa-shopping-bag"></i>
                                    {t('cart.proceedToCheckout')}
                                </button>
                                <button onClick={clearCart} className="clear-cart-btn">
                                    <i className="fas fa-trash"></i>
                                    {t('cart.clearCart')}
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Cart;
