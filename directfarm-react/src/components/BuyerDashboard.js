import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import apiService from '../services/api';
import './BuyerDashboard.css';

const BuyerDashboard = () => {
  const [location, setLocation] = useState({
    state: '',
    district: '',
    subdistrict: '',
    village: '',
    coordinates: null
  });
  const [locationData, setLocationData] = useState({
    states: [],
    districts: [],
    subdistricts: [],
    villages: []
  });
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [filters, setFilters] = useState({
    vegetableType: '',
    harvestingDate: '',
    uploadedDate: '',
    minPrice: '',
    maxPrice: '',
    searchQuery: ''
  });
  const [crops, setCrops] = useState([]);
  const [filteredCrops, setFilteredCrops] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState({});

  // Location data structure (same as farmer dashboard)
  const indianStates = [
    { name: 'Bihar', districts: ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Saran', 'Sitamarhi', 'Samastipur', 'Bhojpur'] },
    { name: 'Uttar Pradesh', districts: ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Meerut', 'Allahabad', 'Bareilly', 'Ghaziabad', 'Moradabad', 'Aligarh'] },
    { name: 'Jharkhand', districts: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar', 'Hazaribagh', 'Giridih', 'Dumka', 'Palamu', 'Garhwa'] },
    { name: 'West Bengal', districts: ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Bardhaman', 'Malda', 'Nadia', 'North 24 Parganas', 'South 24 Parganas'] },
    { name: 'Odisha', districts: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri', 'Balasore', 'Bhadrak', 'Jajpur', 'Kendrapada'] },
    { name: 'Madhya Pradesh', districts: ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Ujjain', 'Sagar', 'Dewas', 'Satna', 'Ratlam', 'Rewa'] },
    { name: 'Rajasthan', districts: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner', 'Ajmer', 'Bharatpur', 'Alwar', 'Sikar', 'Pali'] },
    { name: 'Gujarat', districts: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Gandhinagar', 'Anand', 'Nadiad'] },
    { name: 'Maharashtra', districts: ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Solapur', 'Amravati', 'Kolhapur', 'Sangli', 'Satara'] },
    { name: 'Karnataka', districts: ['Bangalore', 'Mysore', 'Hubli', 'Mangalore', 'Belgaum', 'Gulbarga', 'Davanagere', 'Bellary', 'Bijapur', 'Shimoga'] }
  ];

  const getSubdistricts = (district) => {
    const subdistrictMap = {
      'Patna': ['Patna Sadar', 'Danapur', 'Phulwari', 'Paliganj', 'Bikram'],
      'Gaya': ['Gaya Sadar', 'Bodh Gaya', 'Sherghati', 'Tekari', 'Belaganj'],
      'Muzaffarpur': ['Muzaffarpur Sadar', 'Kanti', 'Motipur', 'Sakra', 'Bochaha'],
      'Bhagalpur': ['Bhagalpur Sadar', 'Kahalgaon', 'Nathnagar', 'Pirpainti', 'Sabour'],
      'Lucknow': ['Lucknow Sadar', 'Malihabad', 'Bakshi Ka Talab', 'Mohaan', 'Chinhat'],
      'Kanpur': ['Kanpur Sadar', 'Kalyanpur', 'Govind Nagar', 'Kidwai Nagar', 'Panki'],
      'Ranchi': ['Ranchi Sadar', 'Kanke', 'Namkum', 'Ormanjhi', 'Angara'],
      'Jamshedpur': ['Jamshedpur Sadar', 'Golmuri', 'Kadma', 'Sonari', 'Telco']
    };
    return subdistrictMap[district] || [];
  };

  const getVillages = (subdistrict) => {
    const villageMap = {
      'Patna Sadar': ['Patna City', 'Bankipur', 'Kankarbagh', 'Rajendra Nagar', 'New Patna'],
      'Danapur': ['Danapur Cantonment', 'Khagaul', 'Maner', 'Fatuha', 'Bakhtiarpur'],
      'Gaya Sadar': ['Gaya City', 'Bodh Gaya', 'Sherghati', 'Tekari', 'Belaganj'],
      'Muzaffarpur Sadar': ['Muzaffarpur City', 'Kanti', 'Motipur', 'Sakra', 'Bochaha'],
      'Lucknow Sadar': ['Lucknow City', 'Hazratganj', 'Aminabad', 'Chowk', 'Nakhas'],
      'Kanpur Sadar': ['Kanpur City', 'Civil Lines', 'Swaroop Nagar', 'Govind Nagar', 'Panki']
    };
    return villageMap[subdistrict] || [];
  };

  // Vegetable types for filtering
  const vegetableTypes = [
    'Tomato', 'Potato', 'Onion', 'Carrot', 'Cabbage', 'Cauliflower',
    'Spinach', 'Lettuce', 'Cucumber', 'Bell Pepper', 'Broccoli', 'Radish',
    'Beetroot', 'Turnip', 'Sweet Potato', 'Ginger', 'Garlic', 'Green Beans',
    'Peas', 'Corn', 'Eggplant', 'Okra', 'Pumpkin', 'Squash', 'Zucchini'
  ];

  // Mock crop data (in real app, this would come from API)
  const mockCrops = [
    {
      id: 1,
      farmerName: 'Rajesh Kumar',
      farmerId: 'F001',
      vegetableType: 'Tomato',
      quantity: 50,
      ratePerKg: 25,
      totalRate: 1250,
      description: 'Fresh organic tomatoes from my farm',
      images: ['https://via.placeholder.com/300x200?text=Tomato'],
      location: {
        state: 'Bihar',
        district: 'Patna',
        subdistrict: 'Patna Sadar',
        village: 'Patna City',
        coordinates: { latitude: 25.5941, longitude: 85.1376 }
      },
      uploadDate: '2024-01-15T10:30:00Z',
      harvestingDate: '2024-01-10T08:00:00Z',
      status: 'Available',
      contact: '+91 9876543210'
    },
    {
      id: 2,
      farmerName: 'Suresh Singh',
      farmerId: 'F002',
      vegetableType: 'Potato',
      quantity: 100,
      ratePerKg: 18,
      totalRate: 1800,
      description: 'Premium quality potatoes, freshly harvested',
      images: ['https://via.placeholder.com/300x200?text=Potato'],
      location: {
        state: 'Bihar',
        district: 'Gaya',
        subdistrict: 'Gaya Sadar',
        village: 'Gaya City',
        coordinates: { latitude: 24.7955, longitude: 84.9994 }
      },
      uploadDate: '2024-01-14T14:20:00Z',
      harvestingDate: '2024-01-12T06:00:00Z',
      status: 'Available',
      contact: '+91 9876543211'
    },
    {
      id: 3,
      farmerName: 'Amit Verma',
      farmerId: 'F003',
      vegetableType: 'Onion',
      quantity: 75,
      ratePerKg: 30,
      totalRate: 2250,
      description: 'Red onions with excellent shelf life',
      images: ['https://via.placeholder.com/300x200?text=Onion'],
      location: {
        state: 'Uttar Pradesh',
        district: 'Lucknow',
        subdistrict: 'Lucknow Sadar',
        village: 'Lucknow City',
        coordinates: { latitude: 26.8467, longitude: 80.9462 }
      },
      uploadDate: '2024-01-13T09:15:00Z',
      harvestingDate: '2024-01-11T07:00:00Z',
      status: 'Available',
      contact: '+91 9876543212'
    },
    {
      id: 4,
      farmerName: 'Vikram Sharma',
      farmerId: 'F004',
      vegetableType: 'Carrot',
      quantity: 40,
      ratePerKg: 35,
      totalRate: 1400,
      description: 'Sweet and crunchy carrots, perfect for salads',
      images: ['https://via.placeholder.com/300x200?text=Carrot'],
      location: {
        state: 'Jharkhand',
        district: 'Ranchi',
        subdistrict: 'Ranchi Sadar',
        village: 'Ranchi City',
        coordinates: { latitude: 23.3441, longitude: 85.3096 }
      },
      uploadDate: '2024-01-12T16:45:00Z',
      harvestingDate: '2024-01-10T05:00:00Z',
      status: 'Available',
      contact: '+91 9876543213'
    },
    {
      id: 5,
      farmerName: 'Manoj Tiwari',
      farmerId: 'F005',
      vegetableType: 'Cabbage',
      quantity: 60,
      ratePerKg: 20,
      totalRate: 1200,
      description: 'Fresh green cabbage, pesticide-free',
      images: ['https://via.placeholder.com/300x200?text=Cabbage'],
      location: {
        state: 'Bihar',
        district: 'Muzaffarpur',
        subdistrict: 'Muzaffarpur Sadar',
        village: 'Muzaffarpur City',
        coordinates: { latitude: 26.1209, longitude: 85.3647 }
      },
      uploadDate: '2024-01-11T11:30:00Z',
      harvestingDate: '2024-01-09T04:00:00Z',
      status: 'Available',
      contact: '+91 9876543214'
    }
  ];

  // Load user and products on component mount
  useEffect(() => {
    const loadUserAndProducts = async () => {
      try {
        // Get user from localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        }
        
        // Fetch all products from API
        await loadProducts();
      } catch (error) {
        console.error('Error loading user or products:', error);
      }
    };

    loadUserAndProducts();
  }, []);

  // Load products from API
  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getProducts();
      if (response.success && response.data) {
        // Transform products to match the display format
        const transformedProducts = response.data.map(product => ({
          id: product._id,
          productId: product._id,
          farmerId: product.farmerId?._id || product.farmerId,
          farmerName: product.farmerId?.name || product.farmer?.name || 'Unknown Farmer',
          vegetableType: product.name,
          quantity: product.quantity,
          ratePerKg: product.price,
          totalRate: (product.quantity * product.price).toFixed(2),
          harvestingDate: product.harvestingDate,
          description: product.description || '',
          images: product.images || [],
          uploadDate: product.createdAt,
          location: product.location || null
        }));
        setCrops(transformedProducts);
        setFilteredCrops(transformedProducts);
      } else {
        // Fallback to mock data if API fails
        setCrops(mockCrops);
        setFilteredCrops(mockCrops);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      // Fallback to mock data on error
      setCrops(mockCrops);
      setFilteredCrops(mockCrops);
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
        crop.vegetableType.toLowerCase().includes(filters.vegetableType.toLowerCase())
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

  // Location handling functions
  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    const locationField = name.split('.')[1];
    
    setLocation(prev => ({
      ...prev,
      [locationField]: value
    }));
    
    // Handle cascading dropdowns
    if (locationField === 'state') {
      const selectedState = indianStates.find(state => state.name === value);
      setLocationData(prev => ({
        ...prev,
        districts: selectedState ? selectedState.districts : [],
        subdistricts: [],
        villages: []
      }));
      setLocation(prev => ({
        ...prev,
        district: '',
        subdistrict: '',
        village: ''
      }));
    } else if (locationField === 'district') {
      const subdistricts = getSubdistricts(value);
      setLocationData(prev => ({
        ...prev,
        subdistricts: subdistricts,
        villages: []
      }));
      setLocation(prev => ({
        ...prev,
        subdistrict: '',
        village: ''
      }));
    } else if (locationField === 'subdistrict') {
      const villages = getVillages(value);
      setLocationData(prev => ({
        ...prev,
        villages: villages
      }));
      setLocation(prev => ({
        ...prev,
        village: ''
      }));
    }
  };

  // Get current location using geolocation API
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser');
      return;
    }

    setIsGettingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation(prev => ({
          ...prev,
          coordinates: { latitude, longitude }
        }));
        
        toast.success('Location captured successfully!', {
          position: "top-right",
          autoClose: 3000,
        });
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        let errorMessage = 'Unable to get your location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 4000,
        });
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  // Filter handling
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      vegetableType: '',
      harvestingDate: '',
      uploadedDate: '',
      minPrice: '',
      maxPrice: '',
      searchQuery: ''
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleContactFarmer = (crop) => {
    toast.success(`Contacting ${crop.farmerName}`, {
      position: "top-right",
      autoClose: 3000,
    });
  };

  // Handle order/buy product
  const handleOrder = async (crop) => {
    if (!user || !user._id) {
      toast.error('Please login to place an order');
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

    setIsLoading(true);
    try {
      // Prepare order data according to new schema
      const orderData = {
        buyerId: user._id,
        items: [
          {
            productId: crop.productId || crop.id,
            quantity: quantity,
            price: crop.ratePerKg,
            farmerId: crop.farmerId
          }
        ],
        totalAmount: quantity * crop.ratePerKg,
        status: 'pending'
      };

      // Call API to create order
      const response = await apiService.createOrder(orderData);

      if (response.success) {
        toast.success('Order placed successfully!', {
          position: "top-right",
          autoClose: 3000,
        });
        
        // Clear order quantity for this product
        setOrderQuantity(prev => {
          const newState = { ...prev };
          delete newState[crop.id];
          return newState;
        });

        // Reload products to update quantities
        await loadProducts();
      } else {
        throw new Error(response.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error(error.message || 'Failed to place order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="buyer-dashboard">
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

        {/* Location Selection */}
        <motion.div 
          className="location-section"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2>
            <i className="fas fa-map-marker-alt"></i>
            Select Your Location
          </h2>
          
          <div className="location-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="location.state">
                  <i className="fas fa-map"></i>
                  State
                </label>
                <select
                  id="location.state"
                  name="location.state"
                  value={location.state}
                  onChange={handleLocationChange}
                >
                  <option value="">Select State</option>
                  {indianStates.map(state => (
                    <option key={state.name} value={state.name}>{state.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="location.district">
                  <i className="fas fa-city"></i>
                  District
                </label>
                <select
                  id="location.district"
                  name="location.district"
                  value={location.district}
                  onChange={handleLocationChange}
                  disabled={!location.state}
                >
                  <option value="">Select District</option>
                  {locationData.districts.map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="location.subdistrict">
                  <i className="fas fa-building"></i>
                  Subdistrict/Block
                </label>
                <select
                  id="location.subdistrict"
                  name="location.subdistrict"
                  value={location.subdistrict}
                  onChange={handleLocationChange}
                  disabled={!location.district}
                >
                  <option value="">Select Subdistrict</option>
                  {locationData.subdistricts.map(subdistrict => (
                    <option key={subdistrict} value={subdistrict}>{subdistrict}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="location.village">
                  <i className="fas fa-home"></i>
                  Village/Town
                </label>
                <select
                  id="location.village"
                  name="location.village"
                  value={location.village}
                  onChange={handleLocationChange}
                  disabled={!location.subdistrict}
                >
                  <option value="">Select Village</option>
                  {locationData.villages.map(village => (
                    <option key={village} value={village}>{village}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="location-actions">
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                className="location-btn"
              >
                {isGettingLocation ? (
                  <motion.div
                    className="loading-spinner"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <i className="fas fa-spinner"></i>
                  </motion.div>
                ) : (
                  <>
                    <i className="fas fa-crosshairs"></i>
                    Share Current Location
                  </>
                )}
              </button>
              
              {location.coordinates && (
                <div className="coordinates-display">
                  <i className="fas fa-check-circle"></i>
                  <span>Location captured: {location.coordinates.latitude.toFixed(6)}, {location.coordinates.longitude.toFixed(6)}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

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
                  value={filters.searchQuery}
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
                  value={filters.vegetableType}
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
                  value={filters.harvestingDate}
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
                  value={filters.uploadedDate}
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
                  value={filters.minPrice}
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
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  placeholder="Max"
                  min="0"
                />
              </div>

              <button
                type="button"
                onClick={clearFilters}
                className="clear-filters-btn"
              >
                <i className="fas fa-times"></i>
                Clear Filters
              </button>
            </div>
          </div>
        </motion.div>

        {/* Results Section */}
        <motion.div 
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

          {filteredCrops.length === 0 ? (
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
                      <span className={`status ${crop.status.toLowerCase()}`}>
                        {crop.status}
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
                          onClick={() => handleOrder(crop)}
                          className="order-btn"
                          disabled={isLoading || !orderQuantity[crop.id] || parseFloat(orderQuantity[crop.id]) <= 0}
                        >
                          <i className="fas fa-shopping-bag"></i>
                          Order Now
                        </button>
                      </div>
                      <button
                        onClick={() => handleContactFarmer(crop)}
                        className="contact-btn"
                      >
                        <i className="fas fa-phone"></i>
                        Contact
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
