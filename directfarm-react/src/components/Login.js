import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import apiService from '../services/api';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    
    // Show validation errors as toasts
    if (Object.keys(newErrors).length > 0) {
      const errorMessages = Object.values(newErrors).join(', ');
      toast.error(`Please fix the following errors: ${errorMessages}`, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
    
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);

    
    
    try {
      // Simulate API call - replace with actual API call

      console.log('form is running and data is sent');
      console.log('Login attempt:', formData);
      
      // Call actual API for login
      const response = await apiService.login(formData);
      
      console.log('✅ Login successful - Full response:', response);
      
      // Extract token and user from response
      // Backend returns: { success: true, data: { user: {...}, token: "..." } }
      const token = response.data?.token || response.token;
      let userData = response.data?.user || response.user;
      
      if (!token) {
        console.error('❌ No token in response:', response);
        throw new Error('No token received from server');
      }
      
      if (!userData) {
        console.error('❌ No user data in response:', response);
        throw new Error('No user data received from server');
      }
      
      // Clean user data - remove sensitive fields and MongoDB internals
      const cleanUserData = {
        id: userData._id || userData.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: userData.role,
        address: userData.address,
        isActive: userData.isActive,
        createdAt: userData.createdAt,
        lastLogin: userData.lastLogin
      };
      
      // Save token and user to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(cleanUserData));
      
      console.log('✅ Token saved:', token ? 'Yes' : 'No');
      console.log('✅ User saved to localStorage:', cleanUserData);
      console.log('✅ localStorage.user:', localStorage.getItem('user'));
      
      // Verify data was saved
      const verifyUser = localStorage.getItem('user');
      const verifyToken = localStorage.getItem('token');
      console.log('✅ Verification - User in localStorage:', verifyUser ? 'Yes' : 'No');
      console.log('✅ Verification - Token in localStorage:', verifyToken ? 'Yes' : 'No');
      
      // Dispatch custom event to notify Navbar immediately (localStorage is synchronous)
      console.log('📢 Dispatching userChanged event');
      window.dispatchEvent(new Event('userChanged'));
      console.log('✅ userChanged event dispatched');
      
      // Force a re-render by dispatching multiple events
      // This ensures the Navbar picks up the change even if there's a timing issue
      setTimeout(() => {
        window.dispatchEvent(new Event('userChanged'));
      }, 10);

      // Success handling
      toast.success('Login successful! Welcome back!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      // Navigate based on user role after successful login
      const userRole = cleanUserData.role;
      setTimeout(() => {
        if (userRole === 'farmer') {
          navigate('/farmer-dashboard');
        } else if (userRole === 'buyer') {
          navigate('/buyer-dashboard');
        } else {
          navigate('/');
        }
      }, 1000);
      
    }  catch (error) {
      console.error('❌ Login failed:', error);
    
      // The error structure is now ALWAYS:
      // { success:false, message:"...", status:401, data:... }
    
      const errorMessage =
        error?.message ||
        error?.data?.message ||
        "Login failed. Please try again.";
    
      // Show the error on page (below inputs or top)
      setErrors(prev => ({
        ...prev,
        global: errorMessage
      }));
    
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false
      });
    
    } finally {
      setIsLoading(false);
    }

  };

  return (
    <div className="auth-page">
      <div className="auth-background">
        <div className="auth-overlay"></div>
      </div>
      
      <div className="auth-container">
        <motion.div 
          className="auth-card"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="auth-header">
            <motion.div 
              className="auth-logo"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <i className="fas fa-seedling"></i>
              <span>DirectFarm</span>
            </motion.div>
            <h1>Welcome Back</h1>
            <p>Sign in to your DirectFarm account</p>
          </div>
          {errors.global && (
  <div className="global-error">
    <i className="fas fa-exclamation-triangle"></i>
    {errors.global}
  </div>
)}


          <form onSubmit={handleSubmit} className="auth-form">
            <motion.div 
              className="form-group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label htmlFor="email">
                <i className="fas fa-envelope"></i>
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
                placeholder="Enter your email"
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </motion.div>

            <motion.div 
              className="form-group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label htmlFor="password">
                <i className="fas fa-lock"></i>
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? 'error' : ''}
                placeholder="Enter your password"
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </motion.div>

            <motion.div 
              className="form-options"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="checkbox-container">
                <input type="checkbox" />
                <span className="checkmark"></span>
                Remember me
              </label>
              <Link to="/forgot-password" className="forgot-link">
                Forgot Password?
              </Link>
            </motion.div>

            <motion.button
              type="submit"
              className="auth-submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {isLoading ? (
                <motion.div
                  className="loading-spinner"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <i className="fas fa-spinner"></i>
                </motion.div>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt"></i>
                  Sign In
                </>
              )}
            </motion.button>
          </form>

          <motion.div 
            className="auth-footer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="auth-link">
                Sign up here
              </Link>
            </p>
          </motion.div>

          <motion.div 
            className="social-login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <p>Or continue with</p>
            <div className="social-buttons">
              <motion.button
                className="social-btn google"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <i className="fab fa-google"></i>
                Google
              </motion.button>
              <motion.button
                className="social-btn facebook"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <i className="fab fa-facebook-f"></i>
                Facebook
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
