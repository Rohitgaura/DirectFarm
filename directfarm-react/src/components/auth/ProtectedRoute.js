import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import authUtils from '../../utils/auth';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuthorization = () => {
      try {
        // Check if user is logged in
        const auth = authUtils.getAuth();
        console.log('🛡️ ProtectedRoute: Checking auth for path:', location.pathname);
        console.log('🛡️ ProtectedRoute: Auth data:', auth);

        if (!auth) {
          // Not logged in - redirect to login
          setIsAuthorized(false);
          setIsChecking(false);
          toast.error('Please login to access this page', {
            position: "top-right",
            autoClose: 2000,
          });
          return;
        }

        // Parse user data
        const user = auth.user;

        // If role is required, check if user role matches
        if (requiredRole && user.role !== requiredRole) {
          console.warn(`🛡️ ProtectedRoute: Role mismatch. Required: ${requiredRole}, Found: ${user.role}`);
          // Role doesn't match - redirect to appropriate dashboard or home
          setIsAuthorized(false);
          setIsChecking(false);

          let redirectMessage = '';
          if (user.role === 'farmer') {
            redirectMessage = 'You are logged in as a farmer. Redirecting to farmer dashboard...';
          } else if (user.role === 'buyer') {
            redirectMessage = 'You are logged in as a buyer. Redirecting to buyer dashboard...';
          } else {
            redirectMessage = 'You do not have access to this page.';
          }

          toast.warning(redirectMessage, {
            position: "top-right",
            autoClose: 2000,
          });
          return;
        }

        // User is logged in and role matches (if required)
        setIsAuthorized(true);
        setIsChecking(false);
      } catch (error) {
        console.error('Error checking authorization:', error);
        // Clear invalid data
        console.error('Error checking authorization:', error);
        // Clear invalid data
        authUtils.clearAuth();
        setIsAuthorized(false);
        setIsChecking(false);
        toast.error('Session expired. Please login again.', {
          position: "top-right",
          autoClose: 2000,
        });
      }
    };

    checkAuthorization();
  }, [requiredRole, location.pathname]);

  // Show loading state while checking
  if (isChecking) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #4CAF50',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: '#666', fontSize: '16px' }}>Checking authorization...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Not authorized - redirect based on situation
  if (!isAuthorized) {
    const auth = authUtils.getAuth();

    if (!auth) {
      // Not logged in - redirect to login with return URL
      return <Navigate to="/login" state={{ from: location }} replace />;
    }

    try {
      const user = auth.user;

      // Role mismatch - redirect to appropriate dashboard
      if (user.role === 'farmer') {
        return <Navigate to="/farmer-dashboard" replace />;
      } else if (user.role === 'buyer') {
        return <Navigate to="/buyer-dashboard" replace />;
      } else {
        // Unknown role - redirect to home
        return <Navigate to="/" replace />;
      }
    } catch (error) {
      // Invalid user data - redirect to login
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
  }

  // Authorized - render the protected component
  return children;
};

export default ProtectedRoute;

