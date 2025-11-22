import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import apiService from '../../services/api';
import '../../styles/Checkout.css';

const Checkout = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        street: '',
        city: '',
        state: '',
        pincode: '',
        phone: '',
        notes: '',
        paymentMethod: 'cod' // Default to Cash on Delivery
    });

    useEffect(() => {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        if (cart.length === 0) {
            toast.error('Your cart is empty');
            navigate('/cart');
            return;
        }
        setCartItems(cart);

        // Pre-fill phone if available in user profile
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.phone) {
            setFormData(prev => ({ ...prev, phone: user.phone }));
        }
    }, [navigate]);

    const calculateTotal = () => {
        return cartItems.reduce((sum, item) => sum + parseFloat(item.totalPrice), 0).toFixed(2);
    };

    const calculateShipping = () => {
        return parseFloat(calculateTotal()) > 1000 ? 0 : 100;
    };

    const calculateFinalTotal = () => {
        return (parseFloat(calculateTotal()) + calculateShipping()).toFixed(2);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Prepare order data
            const orderData = {
                items: cartItems.map(item => ({
                    product: item.productId,
                    quantity: item.quantity
                })),
                shippingAddress: {
                    street: formData.street,
                    city: formData.city,
                    state: formData.state,
                    pincode: formData.pincode,
                    phone: formData.phone
                },
                notes: formData.notes,
                paymentMethod: formData.paymentMethod
            };

            const response = await apiService.createOrder(orderData);

            if (response.success) {
                toast.success('Order placed successfully!');
                // Clear cart
                localStorage.setItem('cart', JSON.stringify([]));
                // Navigate to orders page
                navigate('/orders');
            } else {
                throw new Error(response.message || 'Failed to place order');
            }
        } catch (error) {
            console.error('Checkout error:', error);
            toast.error(error.message || 'Failed to place order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="checkout-page">
            <div className="checkout-container">
                <motion.div
                    className="checkout-header"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1>Checkout</h1>
                    <p>Complete your order</p>
                </motion.div>

                <div className="checkout-content">
                    <motion.div
                        className="checkout-form-section"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <form onSubmit={handleSubmit} className="checkout-form">
                            <div className="form-section">
                                <h2><i className="fas fa-map-marker-alt"></i> Shipping Address</h2>
                                <div className="form-group">
                                    <label>Street Address</label>
                                    <input
                                        type="text"
                                        name="street"
                                        value={formData.street}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="House No, Street Name"
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>City</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>State</label>
                                        <input
                                            type="text"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Pincode</label>
                                        <input
                                            type="text"
                                            name="pincode"
                                            value={formData.pincode}
                                            onChange={handleInputChange}
                                            required
                                            pattern="[0-9]{6}"
                                            title="Please enter valid 6 digit pincode"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            required
                                            pattern="[0-9]{10}"
                                            title="Please enter valid 10 digit phone number"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h2><i className="fas fa-credit-card"></i> Payment Method</h2>
                                <div className="payment-options">
                                    <label className={`payment-option ${formData.paymentMethod === 'cod' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="cod"
                                            checked={formData.paymentMethod === 'cod'}
                                            onChange={handleInputChange}
                                        />
                                        <div className="option-content">
                                            <i className="fas fa-money-bill-wave"></i>
                                            <span>Cash on Delivery</span>
                                        </div>
                                    </label>
                                    <label className={`payment-option ${formData.paymentMethod === 'online' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="online"
                                            checked={formData.paymentMethod === 'online'}
                                            onChange={handleInputChange}
                                        />
                                        <div className="option-content">
                                            <i className="fas fa-globe"></i>
                                            <span>Online Payment (UPI/Card)</span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div className="form-section">
                                <h2><i className="fas fa-sticky-note"></i> Order Notes (Optional)</h2>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    placeholder="Any special instructions for delivery..."
                                    rows="3"
                                ></textarea>
                            </div>

                            <button type="submit" className="place-order-btn" disabled={loading}>
                                {loading ? (
                                    <><i className="fas fa-spinner fa-spin"></i> Processing...</>
                                ) : (
                                    <><i className="fas fa-check-circle"></i> Confirm Order</>
                                )}
                            </button>
                        </form>
                    </motion.div>

                    <motion.div
                        className="order-summary-section"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="order-summary-card">
                            <h2>Order Summary</h2>
                            <div className="summary-items">
                                {cartItems.map(item => (
                                    <div key={item.productId} className="summary-item">
                                        <div className="item-info">
                                            <span className="item-name">{item.vegetableType}</span>
                                            <span className="item-qty">x {item.quantity} kg</span>
                                        </div>
                                        <span className="item-price">₹{item.totalPrice}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="summary-divider"></div>
                            <div className="summary-totals">
                                <div className="total-row">
                                    <span>Subtotal</span>
                                    <span>₹{calculateTotal()}</span>
                                </div>
                                <div className="total-row">
                                    <span>Shipping</span>
                                    <span>{calculateShipping() === 0 ? <span className="free">FREE</span> : `₹${calculateShipping()}`}</span>
                                </div>
                                <div className="summary-divider"></div>
                                <div className="total-row final-total">
                                    <span>Total Amount</span>
                                    <span>₹{calculateFinalTotal()}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
