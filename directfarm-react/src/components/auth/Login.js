import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import FacebookLogin from '@greatsumini/react-facebook-login';
import apiService from '../../services/api';
import authUtils from '../../utils/auth';
import '../../styles/Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [oauthData, setOauthData] = useState(null);
  const [phoneFormData, setPhoneFormData] = useState({
    phone: '',
    role: ''
  });
  const [phoneErrors, setPhoneErrors] = useState({});

  // Redirect if already logged in
  React.useEffect(() => {
    const auth = authUtils.getAuth();
    if (auth && auth.user) {
      const role = auth.user.role;
      if (role === 'farmer') navigate('/farmer-dashboard');
      else if (role === 'buyer') navigate('/buyer-dashboard');
      else if (role === 'admin') navigate('/admin-dashboard');
      else navigate('/');
    }
  }, [navigate]);

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
        autoClose: 2000,
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

      // Save token and user using authUtils (Hybrid Storage)
      authUtils.setAuth(token, cleanUserData);

      console.log('✅ Auth saved via authUtils');

      // Verify data was saved
      const verifyAuth = authUtils.getAuth();
      console.log('✅ Verification - Auth valid:', verifyAuth ? 'Yes' : 'No');

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
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Navigate based on user role after successful login
      const userRole = cleanUserData.role;
      console.log('🧭 Navigation - User Role:', userRole);

      // Navigate immediately
      if (userRole === 'farmer') {
        console.log('👉 Navigating to /farmer-dashboard');
        navigate('/farmer-dashboard');
      } else if (userRole === 'buyer') {
        console.log('👉 Navigating to /buyer-dashboard');
        navigate('/buyer-dashboard');
      } else if (userRole === 'admin') {
        console.log('👉 Navigating to /admin-dashboard');
        navigate('/admin-dashboard');
      } else {
        console.log('👉 Navigating to / (Home) - Unknown role');
        navigate('/');
      }

    } catch (error) {
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
        autoClose: 2000,
        hideProgressBar: false
      });

    } finally {
      setIsLoading(false);
    }

  };

  // Google OAuth Handler
  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    try {
      // First try to login/register without phone (for existing users)
      const response = await apiService.post('/auth/google', {
        credential: credentialResponse.credential
      });

      if (response.success) {
        // User already exists, complete login
        await completeOAuthLogin(response);
      }
    } catch (error) {
      // New user - needs phone and role
      if (error.data?.needsAdditionalInfo) {
        setOauthData({
          type: 'google',
          credential: credentialResponse.credential
        });
        setShowPhoneModal(true);
      } else {
        toast.error(error.message || 'Google login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error('Google login failed. Please try again.');
  };

  // Facebook OAuth Handler
  const handleFacebookResponse = async (response) => {
    if (!response.accessToken) {
      toast.error('Facebook login cancelled');
      return;
    }

    setIsLoading(true);
    try {
      // Try to login/register without phone (for existing users)
      const apiResponse = await apiService.post('/auth/facebook', {
        accessToken: response.accessToken,
        userID: response.userID
      });

      if (apiResponse.success) {
        await completeOAuthLogin(apiResponse);
      }
    } catch (error) {
      // New user - needs phone and role
      if (error.data?.needsAdditionalInfo) {
        setOauthData({
          type: 'facebook',
          accessToken: response.accessToken,
          userID: response.userID
        });
        setShowPhoneModal(true);
      } else {
        toast.error(error.message || 'Facebook login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Complete OAuth login after getting user data
  const completeOAuthLogin = async (response) => {
    const token = response.data?.token || response.token;
    let userData = response.data?.user || response.user;

    if (!token || !userData) {
      throw new Error('Invalid response from server');
    }

    const cleanUserData = {
      id: userData._id || userData.id,
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      role: userData.role,
      address: userData.address,
      isActive: userData.isActive,
      createdAt: userData.createdAt,
      profilePicture: userData.profilePicture
    };

    authUtils.setAuth(token, cleanUserData);
    window.dispatchEvent(new Event('userChanged'));

    toast.success('Login successful! Welcome!');

    // Navigate based on role
    const userRole = cleanUserData.role;
    if (userRole === 'farmer') {
      navigate('/farmer-dashboard');
    } else if (userRole === 'buyer') {
      navigate('/buyer-dashboard');
    } else if (userRole === 'admin') {
      navigate('/admin-dashboard');
    } else {
      navigate('/');
    }
  };

  // Handle phone and role submission for new OAuth users
  const handlePhoneSubmit = async (e) => {
    e.preventDefault();

    // Validate phone and role
    const newErrors = {};
    if (!phoneFormData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(phoneFormData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    if (!phoneFormData.role) {
      newErrors.role = 'Please select your role';
    }

    if (Object.keys(newErrors).length > 0) {
      setPhoneErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      let response;
      if (oauthData.type === 'google') {
        response = await apiService.post('/auth/google', {
          credential: oauthData.credential,
          phone: phoneFormData.phone,
          role: phoneFormData.role
        });
      } else if (oauthData.type === 'facebook') {
        response = await apiService.post('/auth/facebook', {
          accessToken: oauthData.accessToken,
          userID: oauthData.userID,
          phone: phoneFormData.phone,
          role: phoneFormData.role
        });
      }

      if (response.success) {
        setShowPhoneModal(false);
        await completeOAuthLogin(response);
      }
    } catch (error) {
      toast.error(error.message || 'Registration failed');
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
              <div className="google-oauth-wrapper">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="outline"
                  size="large"
                  text="continue_with"
                  shape="rectangular"
                />
              </div>
              <FacebookLogin
                appId={process.env.REACT_APP_FACEBOOK_APP_ID || 'your-facebook-app-id'}
                onSuccess={handleFacebookResponse}
                onFail={(error) => console.error('Facebook login error:', error)}
                onProfileSuccess={(response) => console.log('Facebook profile:', response)}
                render={({ onClick }) => (
                  <motion.button
                    className="social-btn facebook"
                    onClick={onClick}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                  >
                    <i className="fab fa-facebook-f"></i>
                    Facebook
                  </motion.button>
                )}
              />
            </div>
          </motion.div>

          {/* Phone and Role Modal for new OAuth users */}
          {showPhoneModal && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setShowPhoneModal(false)}
            >
              <motion.div
                className="modal-content"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={(e) => e.stopPropagation()}
              >
                <h2>Complete Your Profile</h2>
                <p>Please provide additional information to complete registration</p>
                <form onSubmit={handlePhoneSubmit} className="phone-form">
                  <div className="form-group">
                    <label htmlFor="phone">
                      <i className="fas fa-phone"></i>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={phoneFormData.phone}
                      onChange={(e) => {
                        setPhoneFormData({ ...phoneFormData, phone: e.target.value });
                        setPhoneErrors({ ...phoneErrors, phone: '' });
                      }}
                      className={phoneErrors.phone ? 'error' : ''}
                      placeholder="Enter 10-digit phone number"
                    />
                    {phoneErrors.phone && <span className="error-message">{phoneErrors.phone}</span>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="role">
                      <i className="fas fa-user-tag"></i>
                      I am a
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={phoneFormData.role}
                      onChange={(e) => {
                        setPhoneFormData({ ...phoneFormData, role: e.target.value });
                        setPhoneErrors({ ...phoneErrors, role: '' });
                      }}
                      className={phoneErrors.role ? 'error' : ''}
                    >
                      <option value="">Select your role</option>
                      <option value="farmer">Farmer</option>
                      <option value="buyer">Buyer</option>
                    </select>
                    {phoneErrors.role && <span className="error-message">{phoneErrors.role}</span>}
                  </div>
                  <div className="modal-buttons">
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={() => setShowPhoneModal(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn-submit" disabled={isLoading}>
                      {isLoading ? 'Submitting...' : 'Complete Registration'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

// Wrap with GoogleOAuthProvider
const LoginWithProvider = () => (
  <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || 'your-google-client-id'}>
    <Login />
  </GoogleOAuthProvider>
);

export default LoginWithProvider;
