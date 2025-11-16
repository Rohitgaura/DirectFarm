import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuthorization = () => {
      try {
        // Check if user is logged in
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (!storedUser || !token) {
          // Not logged in - redirect to login
          setIsAuthorized(false);
          setIsChecking(false);
          toast.error('Please login to access this page', {
            position: "top-right",
            autoClose: 3000,
          });
          return;
        }

        // Parse user data
        const user = JSON.parse(storedUser);

        // If role is required, check if user role matches
        if (requiredRole && user.role !== requiredRole) {
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
            autoClose: 3000,
          });
          return;
        }

        // User is logged in and role matches (if required)
        setIsAuthorized(true);
        setIsChecking(false);
      } catch (error) {
        console.error('Error checking authorization:', error);
        // Clear invalid data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setIsAuthorized(false);
        setIsChecking(false);
        toast.error('Session expired. Please login again.', {
          position: "top-right",
          autoClose: 3000,
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
    const storedUser = localStorage.getItem('user');
    
    if (!storedUser) {
      // Not logged in - redirect to login with return URL
      return <Navigate to="/login" state={{ from: location }} replace />;
    }

    try {
      const user = JSON.parse(storedUser);
      
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

