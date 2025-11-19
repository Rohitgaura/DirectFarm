import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import Home from './components/Home';
import About from './components/About';
import Features from './components/Features';
import BusinessModel from './components/BusinessModel';
import MarketOpportunity from './components/MarketOpportunity';
import CompetitiveAdvantage from './components/CompetitiveAdvantage';
import Implementation from './components/Implementation';
import SocialImpact from './components/SocialImpact';
import Login from './components/Login';
import Register from './components/Register';
import FarmerDashboard from './components/FarmerDashboard';
import BuyerDashboard from './components/BuyerDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Footer from './components/Footer';
import './App.css';
import GuestRoute from './components/GuestRoute';

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
        </Routes>
        <Footer />
        <ToastContainer />
      </div>
    </Router>
  );
}

export default App;
