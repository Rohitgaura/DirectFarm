import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/common/Navbar';
import Home from './components/pages/Home';
import About from './components/pages/About';
import Features from './components/pages/Features';
import BusinessModel from './components/pages/BusinessModel';
import MarketOpportunity from './components/pages/MarketOpportunity';
import CompetitiveAdvantage from './components/pages/CompetitiveAdvantage';
import Implementation from './components/pages/Implementation';
import SocialImpact from './components/pages/SocialImpact';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import FarmerDashboard from './components/dashboard/FarmerDashboard';
import BuyerDashboard from './components/dashboard/BuyerDashboard';
import Cart from './components/order/Cart';
import Checkout from './components/order/Checkout';
import OrderHistory from './components/order/OrderHistory';
import Profile from './components/common/Profile';
import CropsHistory from './components/product/CropsHistory';
import Career from './components/pages/Career';
import NegotiationHistory from './components/negotiation/NegotiationHistory';
import FarmerNegotiationPage from './components/negotiation/FarmerNegotiationPage';
import HelpFeedback from './components/common/HelpFeedback';
import SuccessStories from './components/pages/SuccessStories';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Footer from './components/common/Footer';
import './App.css';
import GuestRoute from './components/auth/GuestRoute';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/features" element={<Features />} />
          <Route path="/business-model" element={<BusinessModel />} />
          <Route path="/market-opportunity" element={<MarketOpportunity />} />
          <Route path="/competitive-advantage" element={<CompetitiveAdvantage />} />
          <Route path="/implementation" element={<Implementation />} />
          <Route path="/social-impact" element={<SocialImpact />} />
          <Route
            path="/login"
            element={
              <GuestRoute type="login">
                <Login />
              </GuestRoute>
            }
          />

          <Route
            path="/register"
            element={
              <GuestRoute type="register">
                <Register />
              </GuestRoute>
            }
          />
          <Route
            path="/farmer-dashboard"
            element={
              <ProtectedRoute requiredRole="farmer">
                <FarmerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buyer-dashboard"
            element={
              <ProtectedRoute requiredRole="buyer">
                <BuyerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute requiredRole="buyer">
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute requiredRole="buyer">
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute requiredRole="buyer">
                <OrderHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/negotiations"
            element={
              <ProtectedRoute requiredRole="buyer">
                <NegotiationHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/negotiation/:id"
            element={
              <ProtectedRoute requiredRole="farmer">
                <FarmerNegotiationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/crops-history"
            element={
              <ProtectedRoute requiredRole="farmer">
                <CropsHistory />
              </ProtectedRoute>
            }
          />
          <Route path="/career" element={<Career />} />
          <Route path="/help" element={<HelpFeedback />} />
          <Route path="/success-stories" element={<SuccessStories />} />
        </Routes>
        <Footer />
        <ToastContainer />
      </div>
    </Router>
  );
}

export default App;
