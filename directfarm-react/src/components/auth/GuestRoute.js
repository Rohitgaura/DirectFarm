import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import authUtils from '../../utils/auth';

const GuestRoute = ({ children, type = "login" }) => {
  const [checking, setChecking] = useState(true);
  const [allowGuest, setAllowGuest] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const isAuthenticated = authUtils.isAuthenticated();

    if (isAuthenticated) {
      // User already logged in
      let msg =
        type === "register"
          ? "You have already registered!"
          : "You are already logged in!";

      toast.info(msg, { autoClose: 2000 });

      setAllowGuest(false);
      setChecking(false);
      return;
    }

    // Guest → allow login/register
    setAllowGuest(true);
    setChecking(false);
  }, [location.pathname, type]);

  if (checking) return null;

  // If user is logged in → redirect to previous page or home
  if (!allowGuest) {
    const from = location.state?.from?.pathname || "/";
    return <Navigate to={from} replace />;
  }

  return children;
};

export default GuestRoute;
