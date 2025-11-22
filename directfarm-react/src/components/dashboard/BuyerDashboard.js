import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import apiService from '../../services/api';
import '../../styles/BuyerDashboard.css';
import LocationSelector from './LocationSelector';

const BuyerDashboard = () => {
  const [location, setLocation] = useState({
    state: '',
    district: '',
    subdistrict: '',
    village: '',
    coordinates: null
  });
  const [locationAddress, setLocationAddress] = useState(null);
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [filters, setFilters] = useState({
    vegetableType: '',
    harvestingDate: '',
    uploadedDate: '',
    minPrice: '',
    maxPrice: '',
    searchQuery: '',
    radius: '50' // Default 50km
  });
  // Temporary filters for manual application
  const [tempFilters, setTempFilters] = useState({
    vegetableType: '',
    harvestingDate: '',
    uploadedDate: '',
    minPrice: '',
    maxPrice: '',
    searchQuery: '',
    radius: '50'
  });
  const [crops, setCrops] = useState([]);
  const [filteredCrops, setFilteredCrops] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState({});
  const [selectedCropForOffer, setSelectedCropForOffer] = useState(null);
  const [offerData, setOfferData] = useState({ price: '', quantity: '' });

  // Vegetable types for filtering
  const vegetableTypes = [
    'Tomato', 'Potato', 'Onion', 'Carrot', 'Cabbage', 'Cauliflower',
    'Spinach', 'Lettuce', 'Cucumber', 'Bell Pepper', 'Broccoli', 'Radish',
    'Beetroot', 'Turnip', 'Sweet Potato', 'Ginger', 'Garlic', 'Green Beans',
    'Peas', 'Corn', 'Eggplant', 'Okra', 'Pumpkin', 'Squash', 'Zucchini'
  ];

  // Load user on component mount (products will be loaded after location is set)
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Get user from localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        }
      } catch (error) {
        console.error('Error loading user:', error);
      }
    };

    loadUser();
  }, []);

  // Load products from API
  const loadProducts = async (customParams = {}) => {
    setIsLoading(true);
    try {
      // Prepare params
      const params = { ...customParams };

      // Add location params if available - ALWAYS include radius for geospatial filtering
      if (location.coordinates) {
        params.latitude = location.coordinates.latitude;
        params.longitude = location.coordinates.longitude;
        // Always use radius (default to 50km if not specified in filters)
        params.radius = filters.radius || '50';
      }

      // Add other filters if they are server-supported (optional, but good for future)
      // For now, we stick to what the server supports: search, minPrice, maxPrice
      if (filters.searchQuery) params.search = filters.searchQuery;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;

      // Increase limit to get more results for client-side filtering of other fields
      params.limit = 100;

      const response = await apiService.getProducts(params);
      if (response.success && response.data) {
        // Transform products to match the display format
        const transformedProducts = response.data.map(product => ({
          id: product._id,
          productId: product._id,
          farmerId: product.farmerId?._id || product.farmerId,
          farmerName: product.farmerId?.name || product.farmer?.name || 'Unknown Farmer',
          vegetableType: product.name,
          quantity: product.quantity,
          ratePerKg: product.pricePerKg || product.price, // Handle both field names
          totalRate: (product.quantity * (product.pricePerKg || product.price)).toFixed(2),
          harvestingDate: product.harvestingDate,
          description: product.description || '',
          images: product.images || [],
          uploadDate: product.createdAt,
          location: product.location || null,
          status: product.quantity > 0 ? 'Available' : 'Sold Out'
        }));
        setCrops(transformedProducts);
        setFilteredCrops(transformedProducts);
      } else {
        // No products found - show empty list
        setCrops([]);
        setFilteredCrops([]);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      // Show empty list on error instead of mock data
      setCrops([]);
      setFilteredCrops([]);
      toast.error('Failed to load products. Please try again.', {
        position: "top-right",
        autoClose: 2000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter crops based on current filters
  useEffect(() => {
    let filtered = crops;

    // Filter by vegetable type
    if (filters.vegetableType) {
      filtered = filtered.filter(crop =>
        crop.vegetableType?.toLowerCase().includes(filters.vegetableType.toLowerCase())
      );
    }

    // Filter by harvesting date (if available)
    if (filters.harvestingDate && filters.harvestingDate !== '') {
      const filterDate = new Date(filters.harvestingDate);
      filtered = filtered.filter(crop => {
        if (crop.harvestingDate) {
          const harvestDate = new Date(crop.harvestingDate);
          return harvestDate.toDateString() === filterDate.toDateString();
        }
        return false;
      });
    }

    // Filter by uploaded date
    if (filters.uploadedDate && filters.uploadedDate !== '') {
      const filterDate = new Date(filters.uploadedDate);
      filtered = filtered.filter(crop => {
        if (crop.uploadDate) {
          const uploadDate = new Date(crop.uploadDate);
          return uploadDate.toDateString() === filterDate.toDateString();
        }
        return false;
      });
    }

    // Filter by price range
    if (filters.minPrice) {
      filtered = filtered.filter(crop => crop.ratePerKg >= parseFloat(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(crop => crop.ratePerKg <= parseFloat(filters.maxPrice));
    }

    // Filter by search query
    if (filters.searchQuery) {
      filtered = filtered.filter(crop =>
        crop.vegetableType?.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        crop.description?.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        crop.farmerName?.toLowerCase().includes(filters.searchQuery.toLowerCase())
      );
    }

    setFilteredCrops(filtered);
  }, [filters, crops]);

  // Reload products when location or radius changes
  useEffect(() => {
    if (location.coordinates) {
      loadProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.coordinates, filters.radius]);

  // Reverse geocode coordinates to get address
  useEffect(() => {
    const fetchAddress = async () => {
      if (location.coordinates) {
        try {
          const response = await apiService.reverseGeocodeLocation(
            location.coordinates.latitude,
            location.coordinates.longitude
          );
          if (response.success) {
            setLocationAddress(response.data);
          }
        } catch (error) {
          console.error('Error fetching address:', error);
        }
      } else {
        setLocationAddress(null);
      }
    };
    fetchAddress();
  }, [location.coordinates]);

  // Handle location selection from selector
  const handleLocationSelect = (locationData) => {
    if (locationData.type === 'current') {
      setLocation(prev => ({
        ...prev,
        coordinates: {
          latitude: locationData.coordinates[1],
          longitude: locationData.coordinates[0]
        }
      }));
      toast.success('Location captured successfully!');
    } else {
      setLocation(prev => ({
        ...prev,
        state: locationData.details.state,
        district: locationData.details.district,
        subdistrict: locationData.details.subdistrict,
        village: locationData.details.village,
        coordinates: {
          latitude: locationData.coordinates[1],
          longitude: locationData.coordinates[0]
        }
      }));
      toast.success(`Location set to ${locationData.address}`);
    }
    setShowLocationSelector(false);
  };

  // Auto-show location selector if location not set
  useEffect(() => {
    if (user && !location.coordinates) {
      // Check if we already have location in user profile
      if (user.location && user.location.coordinates) {
        setLocation(prev => ({
          ...prev,
          coordinates: {
            latitude: user.location.coordinates[1],
            longitude: user.location.coordinates[0]
          }
        }));
      } else {
        // Show selector instead of auto-requesting
        setShowLocationSelector(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Update backend when location is captured
  useEffect(() => {
    const updateBackendLocation = async () => {
      if (user && location.coordinates) {
        try {
          await apiService.updateProfile({
            latitude: location.coordinates.latitude,
            longitude: location.coordinates.longitude
          });
          // Update local user object
          const updatedUser = { ...user, location: { coordinates: [location.coordinates.longitude, location.coordinates.latitude] } };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        } catch (error) {
          console.error('Failed to update location in profile:', error);
        }
      }
    };

    if (user && location.coordinates) {
      const currentLat = location.coordinates.latitude;
      const currentLng = location.coordinates.longitude;
      const storedLat = user.location?.coordinates?.[1];
      const storedLng = user.location?.coordinates?.[0];

      if (currentLat !== storedLat || currentLng !== storedLng) {
        updateBackendLocation();
      }
    }
  }, [location.coordinates, user]);

  // Filter handling
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setTempFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = () => {
    setFilters(tempFilters);
    toast.info('Filters applied');
  };

  const clearFilters = () => {
    const resetFilters = {
      vegetableType: '',
      harvestingDate: '',
      uploadedDate: '',
      minPrice: '',
      maxPrice: '',
      searchQuery: '',
      radius: '50'
    };
    setTempFilters(resetFilters);
    setFilters(resetFilters);
    toast.info('Filters cleared');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleContactFarmer = (crop) => {
    toast.success(`Contacting ${crop.farmerName}`, {
      position: "top-right",
      autoClose: 2000,
    });
  };

  // Handle add to cart
  const handleAddToCart = (crop) => {
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }

    const quantity = parseFloat(orderQuantity[crop.id]) || 1;

    if (quantity <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    if (quantity > crop.quantity) {
      toast.error(`Only ${crop.quantity} kg available`);
      return;
    }

    // Get existing cart from localStorage
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');

    // Check if item already exists in cart
    const existingItemIndex = cart.findIndex(item => item.productId === crop.id);

    if (existingItemIndex !== -1) {
      // Update quantity if item exists
      cart[existingItemIndex].quantity += quantity;
      cart[existingItemIndex].totalPrice = (cart[existingItemIndex].quantity * cart[existingItemIndex].pricePerKg).toFixed(2);
      toast.success('Cart updated!');
    } else {
      // Add new item to cart
      const cartItem = {
        productId: crop.id,
        vegetableType: crop.vegetableType,
        quantity: quantity,
        pricePerKg: crop.ratePerKg,
        farmerName: crop.farmerName,
        farmerId: crop.farmerId,
        totalPrice: (quantity * crop.ratePerKg).toFixed(2)
      };
      cart.push(cartItem);
      toast.success('Added to cart!');
    }

    // Save updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));

    // Clear quantity input
    setOrderQuantity(prev => {
      const newState = { ...prev };
      delete newState[crop.id];
      return newState;
    });
  };

  const handleMakeOffer = (crop) => {
    if (!user) {
      toast.error('Please login to make an offer');
      return;
    }
    setSelectedCropForOffer(crop);
    setOfferData({
      price: '',
      quantity: ''
    });
  };

  const submitOffer = async () => {
    if (!offerData.price || !offerData.quantity) {
      toast.error('Please enter both price and quantity');
      return;
    }

    try {
      const response = await apiService.createNegotiation({
        productId: selectedCropForOffer.id,
        offeredPrice: parseFloat(offerData.price),
        quantity: parseFloat(offerData.quantity)
      });

      if (response.success) {
        toast.success('Offer sent successfully!');
        setSelectedCropForOffer(null);
      } else {
        toast.error(response.message || 'Failed to send offer');
      }
    } catch (error) {
      console.error('Error sending offer:', error);
      toast.error('Failed to send offer');
    }
  };

  return (
    <div className="buyer-dashboard">
      {selectedCropForOffer && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Make an Offer for {selectedCropForOffer.vegetableType}</h3>
            <div className="form-group">
              <label>Quantity (kg):</label>
              <input
                type="number"
                value={offerData.quantity}
                onChange={(e) => setOfferData({ ...offerData, quantity: e.target.value })}
                max={selectedCropForOffer.quantity}
              />
            </div>
            <div className="form-group">
              <label>Your Price (₹/kg):</label>
              <input
                type="number"
                value={offerData.price}
                onChange={(e) => setOfferData({ ...offerData, price: e.target.value })}
              />
            </div>
            <div className="modal-actions">
              <button onClick={submitOffer} className="submit-btn">Send Offer</button>
              <button onClick={() => setSelectedCropForOffer(null)} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}
      <div className="dashboard-container">
        <motion.div
          className="dashboard-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>Buyer Dashboard</h1>
          <p>Find fresh produce from local farmers</p>
        </motion.div>

        {/* Location Section */}
        <motion.div
          className="location-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2>
            <i className="fas fa-map-marker-alt"></i>
            Location Settings
          </h2>

          {location.coordinates ? (
            <div className="location-active-card">
              <div className="location-status">
                <div className="status-icon">
                  <i className="fas fa-check-circle"></i>
                </div>
                <div className="status-info">
                  <h3>Location Active</h3>
                  <p>Showing products near you</p>
                  {locationAddress ? (
                    <div className="address-badge">
                      <i className="fas fa-map-marker-alt"></i>
                      <span>
                        {locationAddress.district && `${locationAddress.district}, `}
                        {locationAddress.state}
                      </span>
                    </div>
                  ) : (
                    <div className="coordinates-badge">
                      <i className="fas fa-satellite-dish"></i>
                      <span>{location.coordinates.latitude.toFixed(4)}, {location.coordinates.longitude.toFixed(4)}</span>
                    </div>
                  )}
                </div>
              </div>
              <button
                className="change-location-btn"
                onClick={() => setLocation(prev => ({ ...prev, coordinates: null }))}
              >
                <i className="fas fa-sync-alt"></i>
                Refresh Location
              </button>
            </div>
          ) : (
            <div className="location-request-container">
              <div className="location-icon-large">
                <i className="fas fa-map-marked-alt"></i>
              </div>
              <h3>Find Fresh Produce Near You</h3>
              <p>Select your location to see products from farmers in your area (50km radius).</p>

              <button
                onClick={() => setShowLocationSelector(true)}
                className="find-products-btn"
              >
                <i className="fas fa-location-arrow"></i>
                Select Location
              </button>
            </div>
          )}
        </motion.div>

        <AnimatePresence>
          {showLocationSelector && (
            <LocationSelector
              onLocationSelect={handleLocationSelect}
              onClose={() => setShowLocationSelector(false)}
            />
          )}
        </AnimatePresence>

        {/* Filter Navbar */}
        <motion.div
          className="filter-navbar"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="filter-section">
            <h3>
              <i className="fas fa-filter"></i>
              Filter Products
            </h3>

            <div className="filter-controls">
              <div className="filter-group">
                <label htmlFor="searchQuery">
                  <i className="fas fa-search"></i>
                  Search
                </label>
                <input
                  type="text"
                  id="searchQuery"
                  name="searchQuery"
                  value={tempFilters.searchQuery}
                  onChange={handleFilterChange}
                  placeholder="Search vegetables, farmers..."
                />
              </div>

              <div className="filter-group">
                <label htmlFor="vegetableType">
                  <i className="fas fa-seedling"></i>
                  Vegetable Type
                </label>
                <select
                  id="vegetableType"
                  name="vegetableType"
                  value={tempFilters.vegetableType}
                  onChange={handleFilterChange}
                >
                  <option value="">All Vegetables</option>
                  {vegetableTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="harvestingDate">
                  <i className="fas fa-calendar-alt"></i>
                  Harvesting Date
                </label>
                <input
                  type="date"
                  id="harvestingDate"
                  name="harvestingDate"
                  value={tempFilters.harvestingDate}
                  onChange={handleFilterChange}
                />
              </div>

              <div className="filter-group">
                <label htmlFor="uploadedDate">
                  <i className="fas fa-upload"></i>
                  Uploaded Date
                </label>
                <input
                  type="date"
                  id="uploadedDate"
                  name="uploadedDate"
                  value={tempFilters.uploadedDate}
                  onChange={handleFilterChange}
                />
              </div>

              <div className="filter-group">
                <label htmlFor="minPrice">
                  <i className="fas fa-rupee-sign"></i>
                  Min Price (₹/kg)
                </label>
                <input
                  type="number"
                  id="minPrice"
                  name="minPrice"
                  value={tempFilters.minPrice}
                  onChange={handleFilterChange}
                  placeholder="Min"
                  min="0"
                />
              </div>

              <div className="filter-group">
                <label htmlFor="maxPrice">
                  <i className="fas fa-rupee-sign"></i>
                  Max Price (₹/kg)
                </label>
                <input
                  type="number"
                  id="maxPrice"
                  name="maxPrice"
                  value={tempFilters.maxPrice}
                  onChange={handleFilterChange}
                  placeholder="Max"
                  min="0"
                />
              </div>

              <div className="filter-group">
                <label htmlFor="radius">
                  <i className="fas fa-bullseye"></i>
                  Radius (km)
                </label>
                <input
                  type="number"
                  id="radius"
                  name="radius"
                  value={tempFilters.radius}
                  onChange={handleFilterChange}
                  placeholder="50"
                  min="1"
                  max="500"
                  disabled={!location.coordinates}
                  title={!location.coordinates ? "Enable location to use radius" : "Search radius in km"}
                />
              </div>

              <div className="filter-actions">
                <button
                  type="button"
                  onClick={applyFilters}
                  className="apply-filters-btn"
                >
                  <i className="fas fa-check"></i>
                  Apply Filters
                </button>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="clear-filters-btn"
                >
                  <i className="fas fa-times"></i>
                  Clear
                </button>
              </div>
            </div>
          </div>
        </motion.div >

        {/* Results Section */}
        < motion.div
          className="results-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="results-header">
            <h2>
              <i className="fas fa-shopping-cart"></i>
              Available Crops ({filteredCrops.length})
            </h2>
          </div>

          {
            filteredCrops.length === 0 ? (
              <div className="no-results">
                <i className="fas fa-search"></i>
                <h3>No crops found</h3>
                <p>Try adjusting your filters or search criteria</p>
              </div>
            ) : (
              <div className="crops-grid">
                {filteredCrops.map((crop) => (
                  <motion.div
                    key={crop.id}
                    className="crop-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                  >
                    <div className="crop-image">
                      <img src={crop.images[0]} alt={crop.vegetableType} />
                      <div className="crop-status">
                        <span className={`status ${crop.status?.toLowerCase() || 'available'}`}>
                          {crop.status || 'Available'}
                        </span>
                      </div>
                    </div>

                    <div className="crop-content">
                      <div className="crop-header">
                        <h3>{crop.vegetableType}</h3>
                        <div className="farmer-info">
                          <i className="fas fa-user"></i>
                          <span>{crop.farmerName}</span>
                        </div>
                      </div>

                      <div className="crop-details">
                        <div className="detail-item">
                          <i className="fas fa-weight"></i>
                          <span>{crop.quantity} kg</span>
                        </div>
                        <div className="detail-item">
                          <i className="fas fa-rupee-sign"></i>
                          <span>₹{crop.ratePerKg}/kg</span>
                        </div>
                        <div className="detail-item total">
                          <i className="fas fa-calculator"></i>
                          <span>Total: ₹{crop.totalRate}</span>
                        </div>
                      </div>

                      {crop.description && (
                        <p className="crop-description">{crop.description}</p>
                      )}

                      {crop.location && (
                        <div className="crop-location">
                          <i className="fas fa-map-marker-alt"></i>
                          <span>
                            {crop.location.village && `${crop.location.village}, `}
                            {crop.location.subdistrict && `${crop.location.subdistrict}, `}
                            {crop.location.district && `${crop.location.district}, `}
                            {crop.location.state || 'Location not specified'}
                          </span>
                        </div>
                      )}

                      <div className="crop-dates">
                        {crop.harvestingDate && (
                          <div className="date-item">
                            <i className="fas fa-calendar-alt"></i>
                            <span>Harvested: {formatDate(crop.harvestingDate)}</span>
                          </div>
                        )}
                        {crop.uploadDate && (
                          <div className="date-item">
                            <i className="fas fa-upload"></i>
                            <span>Uploaded: {formatDate(crop.uploadDate)}</span>
                          </div>
                        )}
                      </div>

                      <div className="crop-actions">
                        <div className="order-quantity">
                          <label>
                            <i className="fas fa-shopping-cart"></i>
                            Quantity (kg):
                          </label>
                          <input
                            type="number"
                            min="1"
                            max={crop.quantity}
                            value={orderQuantity[crop.id] || ''}
                            onChange={(e) => setOrderQuantity(prev => ({
                              ...prev,
                              [crop.id]: e.target.value
                            }))}
                            placeholder="Qty"
                            style={{
                              width: '80px',
                              padding: '8px',
                              margin: '0 10px',
                              borderRadius: '4px',
                              border: '1px solid #ddd'
                            }}
                          />
                          <button
                            onClick={() => handleAddToCart(crop)}
                            className="order-btn"
                            disabled={isLoading || !orderQuantity[crop.id] || parseFloat(orderQuantity[crop.id]) <= 0}
                          >
                            <i className="fas fa-shopping-cart"></i>
                            Add to Cart
                          </button>
                        </div>
                        <button
                          onClick={() => handleContactFarmer(crop)}
                          className="contact-btn"
                        >
                          <i className="fas fa-phone"></i>
                          Contact
                        </button>
                        <button
                          onClick={() => handleMakeOffer(crop)}
                          className="offer-btn"
                          style={{ marginTop: '10px', width: '100%', backgroundColor: '#ff9800', color: 'white', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          <i className="fas fa-handshake"></i>
                          Make Offer
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )
          }
        </motion.div >
      </div >
    </div >
  );
};

export default BuyerDashboard;
