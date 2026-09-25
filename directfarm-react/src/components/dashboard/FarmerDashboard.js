import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import apiService from '../../services/api';
import authUtils from '../../utils/auth';
import { PRODUCT_CATEGORIES, CATEGORIES } from '../../constants/productCategories';
import StarRating from '../common/StarRating';
import LocationSelector from './LocationSelector';
import '../../styles/FarmerDashboard.css';

const FarmerDashboard = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    category: '',
    vegetableType: '',
    quantity: '',
    ratePerKg: '',
    harvestingDate: '',
    description: '',
    expiryDuration: '7',
    expiryUnit: 'days',
    status: 'active',
    images: []
  });
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'unsold', 'sold'
  const [selectedFiles, setSelectedFiles] = useState([]);

  // ... (location state remains same)

  const [location, setLocation] = useState({
    coordinates: null
  });
  const [locationAddress, setLocationAddress] = useState(null);
  const [showLocationSelector, setShowLocationSelector] = useState(false);

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

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedCrops, setUploadedCrops] = useState([]);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [user, setUser] = useState(null);

  // Load user and products on component mount
  useEffect(() => {
    const loadUserAndProducts = async () => {
      try {
        // Get user from authUtils
        let userData = authUtils.getUser();
        console.log('🌾 FarmerDashboard: Loaded user data:', userData);
        if (userData) {
          setUser(userData);
          console.log('🌾 FarmerDashboard: User state set');

          // Fetch fresh profile from backend to get up-to-date location
          try {
            const profileResponse = await apiService.getProfile();
            if (profileResponse.success && profileResponse.data) {
              const freshUser = { ...userData, ...profileResponse.data };
              setUser(freshUser);
              authUtils.updateUser(freshUser);
              userData = freshUser;
              console.log('🌾 FarmerDashboard: Updated user with fresh profile data');
            }
          } catch (profileError) {
            console.error('Error fetching fresh profile:', profileError);
          }

          // Fetch products for this farmer - use either _id or id
          const userId = userData._id || userData.id;
          if (userId) {
            try {
              const productsResponse = await apiService.getProducts({ farmerId: userId, includeSold: 'true', includeExpired: 'true' });
              console.log('🌾 FarmerDashboard: Products response:', productsResponse);
              if (productsResponse.success && productsResponse.data) {
                // Transform products to match the display format
                const transformedProducts = productsResponse.data.map(product => {
                  const qty = parseFloat(product.quantity);
                  const price = parseFloat(product.price || product.pricePerKg);

                  // Debug log for NaN investigation
                  if (isNaN(qty) || isNaN(price)) {
                    console.log('⚠️ Found NaN source:', {
                      id: product._id,
                      rawQty: product.quantity,
                      parsedQty: qty,
                      rawPrice: product.price,
                      rawPricePerKg: product.pricePerKg,
                      parsedPrice: price
                    });
                  }

                  const safeQty = isNaN(qty) ? 0 : qty;
                  const safePrice = isNaN(price) ? 0 : price;

                  return {
                    id: product.id || product._id,
                    _id: product.id || product._id,
                    category: product.category || 'Vegetables',
                    vegetableType: product.name,
                    quantity: product.quantity,
                    ratePerKg: product.pricePerKg || product.price,
                    totalRate: (safeQty * safePrice).toFixed(2),
                    description: product.description || '',
                    images: product.images || [],
                    uploadingDate: product.createdAt,
                    harvestingDate: product.harvestingDate,
                    location: product.location,
                    status: product.status || (product.quantity > 0 ? 'active' : 'sold'),
                    expiryDuration: product.expiryDuration || 7,
                    expiryUnit: product.expiryUnit || 'days',
                    autoRemoveEnabled: product.autoRemoveEnabled !== false
                  };
                });

                setUploadedCrops(transformedProducts);
              }
            } catch (error) {
              console.error('Error loading products:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error loading user:', error);
      }
    };

    loadUserAndProducts();
  }, []);

  // Check for edit crop data from navigation (e.g. from CropsHistory)
  const locationState = useLocation(); // Hook usage
  useEffect(() => {
    if (locationState.state && locationState.state.editCrop) {
      // We have a crop to edit!
      const cropToEdit = locationState.state.editCrop;
      // Need to wait for products to load? Or just set it directly?
      // Since handleEdit works with the crop object, we can just call it or set the state.
      // However, handleEdit relies on scrolling to form, so let's use that if possible.
      // But handleEdit is defined later. We should move this effect or call a function.

      // Better: Set a flag or call handleEdit after definition.
      // Since we are inside the component, we can't call handleEdit before it's defined.
      // Let's defer this check or move handleEdit definition up (not easy with state dependencies).

      // Alternative: Just set the editing state directly here, replicating handleEdit logic.
      console.log("🌾 Received crop to edit from history:", cropToEdit);
      setEditingCropId(cropToEdit._id || cropToEdit.id);
      setFormData({
        category: cropToEdit.category || 'Vegetables',
        vegetableType: cropToEdit.vegetableType || cropToEdit.name,
        quantity: cropToEdit.quantity,
        ratePerKg: cropToEdit.ratePerKg || cropToEdit.price || cropToEdit.pricePerKg, // Handle different field names
        harvestingDate: cropToEdit.harvestingDate ? new Date(cropToEdit.harvestingDate).toISOString().split('T')[0] : '',
        description: cropToEdit.description || '',
        images: cropToEdit.images || []
      });

      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Clear state so it doesn't re-trigger on refresh (optional, but good practice)
      // clean up state history... hard to do in React Router v6 without navigating again. 
      // We can just rely on the fact that this effect runs on mount/update. 
    }
  }, [locationState]);

  // ... (location effects remain same)

  // Auto-load saved location on mount if available
  useEffect(() => {
    if (user && !location.coordinates && !isGettingLocation) {
      // Check if we already have location in user profile
      if (user.location && user.location.coordinates) {
        setLocation(prev => ({
          ...prev,
          coordinates: {
            latitude: user.location.coordinates[1],
            longitude: user.location.coordinates[0]
          }
        }));
      }
      // Don't auto-request location, let user choose
    }
  }, [user, location.coordinates, isGettingLocation]);

  // Update backend when location is captured
  useEffect(() => {
    const updateBackendLocation = async () => {
      if (user && location.coordinates) {
        try {
          await apiService.updateProfile({
            latitude: location.coordinates.latitude,
            longitude: location.coordinates.longitude
          });
          // Update local user object to avoid re-requesting
          const updatedUser = { ...user, location: { coordinates: [location.coordinates.longitude, location.coordinates.latitude] } };
          setUser(updatedUser);
          authUtils.updateUser(updatedUser);
        } catch (error) {
          console.error('Failed to update location in profile:', error);
        }
      }
    };

    // Only update if it's a new capture or different from stored
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

  // Calculate total rate automatically with safety checks
  const calculateTotalRate = () => {
    const quantity = parseFloat(formData.quantity);
    const rate = parseFloat(formData.ratePerKg);
    if (isNaN(quantity) || isNaN(rate)) return '0.00';
    return (quantity * rate).toFixed(2);
  };

  const handleToggleStatus = async (cropId, currentStatus) => {
    const isCurrentlySold = (currentStatus || '').toLowerCase() === 'sold';
    const newStatus = isCurrentlySold ? 'active' : 'sold';
    try {
      const response = await apiService.updateProductStatus(cropId, { status: newStatus });
      if (response.success) {
        toast.success(isCurrentlySold ? 'Crop marked as Active & relisted!' : 'Crop marked as Sold Out & unlisted from public store!');
        setUploadedCrops(prev => prev.map(c => (c.id === cropId || c._id === cropId) ? { ...c, status: newStatus } : c));
      }
    } catch (error) {
      toast.error('Failed to update product status');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'category') {
      const isLongLifeCategory = ['grains', 'pulses', 'seeds', 'spices', 'dry fruits'].some(c => value.toLowerCase().includes(c));
      setFormData(prev => ({
        ...prev,
        category: value,
        vegetableType: '', // Reset item type when category changes
        expiryUnit: isLongLifeCategory ? 'never' : 'days'
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
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
          autoClose: 2000,
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
          default:
            errorMessage = 'An unknown error occurred';
            break;
        }

        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 2000,
        });
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    // Accept only image types: JPG, JPEG, PNG, GIF, WebP
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB per image

    const imageFiles = files.filter(file => {
      // Check file type
      const isImage = allowedTypes.includes(file.type.toLowerCase()) || file.type.startsWith('image/');
      if (!isImage) {
        toast.error(`${file.name} is not a valid image format. Please use JPG, JPEG, PNG, GIF, or WebP.`);
        return false;
      }

      // Check file size
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large. Maximum size is 5MB.`);
        return false;
      }

      return true;
    });

    if (imageFiles.length === 0) {
      return;
    }

    // Convert images to base64 for storage
    const imagePromises = imageFiles.map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          // Optional: Compress image if needed (can add image compression library later)
          resolve(e.target.result);
        };
        reader.onerror = (error) => {
          console.error('Error reading file:', error);
          reject(error);
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(imagePromises)
      .then(base64Images => {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...base64Images]
        }));
        setSelectedFiles(prev => [...prev, ...imageFiles]);
        toast.success(`${imageFiles.length} image(s) added successfully!`, {
          position: "top-right",
          autoClose: 2000,
        });
      })
      .catch(error => {
        console.error('Error processing images:', error);
        toast.error('Error processing images. Please try again.');
      });
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.vegetableType) {
      newErrors.vegetableType = 'Please select a vegetable type';
    }

    if (!formData.quantity) {
      newErrors.quantity = 'Quantity is required';
    } else if (parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }

    if (!formData.ratePerKg) {
      newErrors.ratePerKg = 'Rate per kg is required';
    } else if (parseFloat(formData.ratePerKg) <= 0) {
      newErrors.ratePerKg = 'Rate must be greater than 0';
    }

    // Location validation - check if global location is set
    if (!location.coordinates) {
      toast.error('Please enable location access to upload products');
      return false;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [editingCropId, setEditingCropId] = useState(null);

  // ... (existing effects)

  const handleEdit = (crop) => {
    setEditingCropId(crop.id);
    setFormData({
      category: crop.category,
      vegetableType: crop.vegetableType,
      quantity: crop.quantity,
      ratePerKg: crop.ratePerKg,
      harvestingDate: crop.harvestingDate ? new Date(crop.harvestingDate).toISOString().split('T')[0] : '',
      description: crop.description,
      expiryDuration: crop.expiryDuration ? String(crop.expiryDuration) : '7',
      expiryUnit: crop.expiryUnit || 'days',
      status: crop.status || 'active',
      images: crop.images.map(img => typeof img === 'string' ? img : img.url) // For preview
    });
    // Scroll to form
    document.querySelector('.dashboard-header').scrollIntoView({ behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingCropId(null);
    setFormData({
      category: '',
      vegetableType: '',
      quantity: '',
      ratePerKg: '',
      harvestingDate: '',
      description: '',
      expiryDuration: '7',
      expiryUnit: 'days',
      status: 'active',
      images: []
    });
    setSelectedFiles([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the form errors before submitting');
      return;
    }

    // Check if user is logged in
    let currentUser = user;
    if (!currentUser || (!currentUser._id && !currentUser.id)) {
      const userData = authUtils.getUser();
      if (userData) {
        currentUser = userData;
        setUser(currentUser);
      }
    }

    const userId = currentUser?._id || currentUser?.id;
    if (!userId) {
      toast.error('Please login to manage products');
      return;
    }

    setIsLoading(true);

    try {
      // Prepare product data using FormData
      const data = new FormData();
      if (!editingCropId) {
        data.append('farmerId', userId);
      }

      data.append('category', formData.category);
      data.append('name', formData.vegetableType);
      data.append('quantity', formData.quantity);
      data.append('price', formData.ratePerKg);
      if (formData.harvestingDate) data.append('harvestingDate', formData.harvestingDate);
      data.append('description', formData.description || '');
      data.append('expiryDuration', formData.expiryDuration || '7');
      data.append('expiryUnit', formData.expiryUnit || 'days');
      data.append('status', formData.status || 'active');

      // Append location as JSON string
      const locationData = {
        coordinates: location.coordinates ? [
          location.coordinates.longitude,
          location.coordinates.latitude
        ] : undefined
      };
      data.append('location', JSON.stringify(locationData));

      // Append images
      selectedFiles.forEach(file => {
        data.append('images', file);
      });

      let response;
      if (editingCropId) {
        response = await apiService.updateProduct(editingCropId, data);
      } else {
        response = await apiService.createProduct(data);
      }

      if (response.success) {
        // Construct displayed crop object
        const responseData = response.data.product || response.data || {}; // Handle variations in backend response
        const newProduct = {
          id: responseData._id || responseData.id,
          vegetableType: responseData.name,
          quantity: responseData.quantity,
          ratePerKg: responseData.price || responseData.pricePerKg,
          totalRate: (responseData.quantity * (responseData.price || responseData.pricePerKg)).toFixed(2),
          description: responseData.description || '',
          images: responseData.images || [], // Contains {url, public_id} objects
          uploadingDate: responseData.createdAt,
          harvestingDate: responseData.harvestingDate,
          location: responseData.location
        };

        if (editingCropId) {
          setUploadedCrops(prev => prev.map(crop => crop.id === editingCropId ? newProduct : crop));
          toast.success('Product updated successfully!');
          cancelEdit();
        } else {
          setUploadedCrops(prev => [newProduct, ...prev]);
          toast.success('Product uploaded successfully!');
          // Reset form
          setFormData({
            category: '',
            vegetableType: '',
            quantity: '',
            ratePerKg: '',
            harvestingDate: '',
            description: '',
            images: []
          });
          setSelectedFiles([]);
        }

      } else {
        throw new Error(response.message || `Failed to ${editingCropId ? 'update' : 'upload'} product`);
      }

    } catch (error) {
      console.error(`Error ${editingCropId ? 'updating' : 'uploading'} product:`, error);
      toast.error(error.message || `Failed to ${editingCropId ? 'update' : 'upload'} product. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCrop = async (cropId) => {
    try {
      const response = await apiService.deleteProduct(cropId);
      if (response.success) {
        const updatedCrops = uploadedCrops.filter(crop => crop.id !== cropId);
        setUploadedCrops(updatedCrops);
        toast.success('Product deleted successfully!');
      } else {
        throw new Error(response.message || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(error.message || 'Failed to delete product. Please try again.');
    }
  };

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
        coordinates: {
          latitude: locationData.coordinates[1],
          longitude: locationData.coordinates[0]
        }
      }));
      toast.success(`Location set to ${locationData.address}`);
    }
    setShowLocationSelector(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="farmer-dashboard">
      <div className="dashboard-container">
        <motion.div
          className="dashboard-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>Farmer Dashboard</h1>
          <p>Upload your crop details and manage your produce</p>
          {user && (
            <div className="dashboard-rating" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px', justifyContent: 'center' }}>
              <StarRating rating={user.averageRating || 0} readOnly size="1.5rem" />
              <span style={{ fontSize: '1.1rem', fontWeight: '600', color: '#333' }}>
                {(user.averageRating || 0).toFixed(1)} ({user.totalRatings || 0} reviews)
              </span>
            </div>
          )}
        </motion.div>

        {/* Quick Action Navigation Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate(`/farmer/${user._id || user.id}`)}
            style={{
              background: 'white',
              color: '#27ae60',
              border: '2px solid #27ae60',
              padding: '0.55rem 1.5rem',
              borderRadius: '25px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#27ae60';
              e.currentTarget.style.color = 'white';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.color = '#27ae60';
            }}
          >
            <i className="fas fa-eye"></i> View Public Profile
          </button>

          <button
            onClick={() => navigate('/farmer-analytics')}
            style={{
              background: '#10b981',
              color: '#ffffff',
              border: '2px solid #10b981',
              padding: '0.55rem 1.5rem',
              borderRadius: '25px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#059669';
              e.currentTarget.style.borderColor = '#059669';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = '#10b981';
              e.currentTarget.style.borderColor = '#10b981';
            }}
          >
            <i className="fas fa-chart-pie"></i> Crop & Quantity Analytics
          </button>
        </div>

        {/* Location Section - New Addition */}
        <motion.div
          className="location-section-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ marginBottom: '2rem', background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}
        >
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="fas fa-map-marker-alt" style={{ color: '#2ecc71' }}></i>
            Location Settings
          </h2>

          {location.coordinates ? (
            <div className="location-active-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f0fdf4', padding: '1rem', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
              <div className="location-status" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="status-icon" style={{ color: '#15803d', fontSize: '1.5rem' }}>
                  <i className="fas fa-check-circle"></i>
                </div>
                <div className="status-info">
                  <h3 style={{ margin: 0, fontSize: '1rem', color: '#166534' }}>Location Active</h3>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: '#15803d' }}>Your products will be shown to nearby buyers</p>
                  {locationAddress && (locationAddress.district || locationAddress.state) ? (
                    <div className="address-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', marginTop: '0.5rem', fontSize: '0.8rem', color: '#666' }}>
                      <i className="fas fa-map-marker-alt"></i>
                      <span>
                        {locationAddress.district && `${locationAddress.district}, `}
                        {locationAddress.state}
                      </span>
                    </div>
                  ) : (
                    <div className="coordinates-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', marginTop: '0.5rem', fontSize: '0.8rem', color: '#666' }}>
                      <i className="fas fa-satellite-dish"></i>
                      <span>{location.coordinates.latitude.toFixed(4)}, {location.coordinates.longitude.toFixed(4)}</span>
                    </div>
                  )}
                </div>
              </div>
              <button
                className="change-location-btn"
                onClick={() => setLocation(prev => ({ ...prev, coordinates: null }))}
                style={{ background: 'white', border: '1px solid #d1d5db', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <i className="fas fa-sync-alt"></i>
                Refresh
              </button>
            </div>
          ) : (
            <div className="location-request-container" style={{ textAlign: 'center', padding: '1rem' }}>
              <div className="location-icon-large" style={{ fontSize: '2rem', color: '#9ca3af', marginBottom: '1rem' }}>
                <i className="fas fa-map-marked-alt"></i>
              </div>
              <h3 style={{ margin: '0 0 0.5rem', color: '#374151' }}>Enable Location Access</h3>
              <p style={{ margin: '0 0 1.5rem', color: '#6b7280' }}>We need your location to show your products to buyers in your area.</p>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={getCurrentLocation}
                  disabled={isGettingLocation}
                  className="find-products-btn"
                  style={{ background: '#2ecc71', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  {isGettingLocation ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Detecting...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-location-arrow"></i>
                      Use Current Location
                    </>
                  )}
                </button>

                <button
                  onClick={() => setShowLocationSelector(true)}
                  style={{ background: 'white', color: '#2ecc71', border: '2px solid #2ecc71', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <i className="fas fa-map-marked-alt"></i>
                  Select Location
                </button>
              </div>
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

        {/* Live Crop Inventory & Quantity Analytics Strip */}
        {uploadedCrops.length > 0 && (
          <motion.div
            className="analytics-summary-strip"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '1.25rem 1.5rem',
              boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
              border: '1px solid #e2e8f0',
              marginBottom: '2rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fas fa-chart-pie" style={{ color: '#10b981', fontSize: '1.25rem' }}></i>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: '800' }}>
                  Live Crop Inventory & Quantity Analytics
                </h3>
              </div>
              <button
                onClick={() => navigate('/farmer-analytics')}
                style={{
                  background: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  color: '#059669',
                  padding: '5px 14px',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <span>View Full Analytics & Charts</span> <i className="fas fa-arrow-right"></i>
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem'
            }}>
              {/* Total Crops */}
              <div style={{ background: '#f8fafc', padding: '0.9rem 1.1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Active Uploaded Crops</span>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>
                  {uploadedCrops.length} Crops
                </div>
                <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '600' }}>Listed in marketplace</span>
              </div>

              {/* Total Quantity */}
              <div style={{ background: '#f8fafc', padding: '0.9rem 1.1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Total Available Quantity</span>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>
                  {uploadedCrops.reduce((sum, c) => sum + (parseFloat(c.quantity) || 0), 0).toLocaleString()} kg
                </div>
                <span style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: '600' }}>Ready for trade/dispatch</span>
              </div>

              {/* Total Valuation */}
              <div style={{ background: '#f8fafc', padding: '0.9rem 1.1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Inventory Valuation</span>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>
                  ₹{uploadedCrops.reduce((sum, c) => sum + ((parseFloat(c.quantity) || 0) * (parseFloat(c.ratePerKg) || 0)), 0).toLocaleString()}
                </div>
                <span style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: '600' }}>Total estimated value</span>
              </div>

              {/* Uploaded Today */}
              <div style={{ background: '#f8fafc', padding: '0.9rem 1.1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Uploaded Today</span>
                {(() => {
                  const today = new Date();
                  const isT = (d) => {
                    if (!d) return false;
                    const date = new Date(d);
                    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
                  };
                  const todayCrops = uploadedCrops.filter(c => isT(c.uploadingDate || c.createdAt));
                  const todayQty = todayCrops.reduce((sum, c) => sum + (parseFloat(c.quantity) || 0), 0);
                  return (
                    <>
                      <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>
                        {todayCrops.length} Crops
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#8b5cf6', fontWeight: '600' }}>
                        +{todayQty.toLocaleString()} kg added today
                      </span>
                    </>
                  );
                })()}
              </div>
            </div>
          </motion.div>
        )}

        <div className="dashboard-content">
          {/* Upload Form Section */}
          <motion.div
            className="upload-section"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2>{editingCropId ? 'Edit Product' : 'Upload New Crop'}</h2>
              {editingCropId && (
                <button
                  onClick={cancelEdit}
                  style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '5px', cursor: 'pointer' }}
                >
                  Cancel Edit
                </button>
              )}
            </div>
            <form onSubmit={handleSubmit} className="crop-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">
                    <i className="fas fa-layer-group"></i>
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={errors.category ? 'error' : ''}
                  >
                    <option value="">Select Category</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {errors.category && <span className="error-message">{errors.category}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="vegetableType">
                    <i className="fas fa-seedling"></i>
                    Product Name
                  </label>
                  <select
                    id="vegetableType"
                    name="vegetableType"
                    value={formData.vegetableType}
                    onChange={handleChange}
                    className={errors.vegetableType ? 'error' : ''}
                    disabled={!formData.category}
                  >
                    <option value="">Select Product</option>
                    {formData.category && PRODUCT_CATEGORIES[formData.category]?.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.vegetableType && <span className="error-message">{errors.vegetableType}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="quantity">
                    <i className="fas fa-weight"></i>
                    Quantity (kg)
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    className={errors.quantity ? 'error' : ''}
                    placeholder="Enter quantity in kg"
                    step="0.1"
                    min="0"
                  />
                  {errors.quantity && <span className="error-message">{errors.quantity}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="ratePerKg">
                    <i className="fas fa-rupee-sign"></i>
                    Rate per kg (₹)
                  </label>
                  <input
                    type="number"
                    id="ratePerKg"
                    name="ratePerKg"
                    value={formData.ratePerKg}
                    onChange={handleChange}
                    className={errors.ratePerKg ? 'error' : ''}
                    placeholder="Enter rate per kg"
                    step="0.01"
                    min="0"
                  />
                  {errors.ratePerKg && <span className="error-message">{errors.ratePerKg}</span>}
                </div>

                <div className="form-group">
                  <label>
                    <i className="fas fa-calculator"></i>
                    Total Rate (₹)
                  </label>
                  <div className="total-rate-display">
                    ₹{calculateTotalRate()}
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="harvestingDate">
                  <i className="fas fa-calendar"></i>
                  Harvesting Date
                </label>
                <input
                  type="date"
                  id="harvestingDate"
                  name="harvestingDate"
                  value={formData.harvestingDate}
                  onChange={handleChange}
                  className={errors.harvestingDate ? 'error' : ''}
                />
                {errors.harvestingDate && <span className="error-message">{errors.harvestingDate}</span>}
              </div>


              {/* Product Listing Status Option (Active / Unsold vs Sold Out) */}
              <div className="form-group" style={{ background: '#f8fafc', padding: '1rem 1.2rem', borderRadius: '14px', border: '1px solid #e2e8f0', margin: '0.75rem 0' }}>
                <label style={{ fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                  <i className="fas fa-store" style={{ color: '#3b82f6' }}></i>
                  Product Listing Status
                </label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 700, color: '#166534', background: formData.status === 'active' ? '#dcfce7' : 'white', padding: '0.5rem 0.85rem', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      checked={formData.status === 'active'}
                      onChange={handleChange}
                      style={{ width: '18px', height: '18px', accentColor: '#10b981' }}
                    />
                    <span>🟢 Active / Unsold (Visible to Buyers)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 700, color: '#991b1b', background: formData.status === 'sold' ? '#fee2e2' : 'white', padding: '0.5rem 0.85rem', borderRadius: '8px', border: '1px solid #fca5a5' }}>
                    <input
                      type="radio"
                      name="status"
                      value="sold"
                      checked={formData.status === 'sold'}
                      onChange={handleChange}
                      style={{ width: '18px', height: '18px', accentColor: '#ef4444' }}
                    />
                    <span>🔴 Sold Out (Hidden from Buyers)</span>
                  </label>
                </div>
              </div>

              {/* Auto-Remove Unsold Crop Duration Settings */}
              <div className="form-group expiry-card-container" style={{
                background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
                border: '1px solid #a7f3d0',
                borderRadius: '14px',
                padding: '1.2rem',
                margin: '0.75rem 0'
              }}>
                <label style={{ fontWeight: '700', color: '#065f46', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', margin: '0 0 0.25rem 0' }}>
                  <i className="fas fa-hourglass-half" style={{ color: '#059669' }}></i>
                  Auto-Remove Listing If Unsold
                </label>
                <p style={{ fontSize: '0.8rem', color: '#047857', margin: '0 0 0.85rem 0', lineHeight: '1.4' }}>
                  Specify after how long this crop will automatically unlist if not completely sold.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: formData.expiryUnit === 'never' ? '1fr' : '1fr 1fr', gap: '1rem' }}>
                  {formData.expiryUnit !== 'never' && (
                    <div className="form-group" style={{ margin: 0 }}>
                      <label htmlFor="expiryDuration" style={{ fontSize: '0.8rem', color: '#065f46', fontWeight: 600 }}>
                        Duration Value
                      </label>
                      <input
                        type="number"
                        id="expiryDuration"
                        name="expiryDuration"
                        min="1"
                        max="365"
                        value={formData.expiryDuration}
                        onChange={handleChange}
                        placeholder="e.g. 7"
                        style={{
                          width: '100%',
                          padding: '0.65rem 0.85rem',
                          borderRadius: '10px',
                          border: '1px solid #6ee7b7',
                          background: '#ffffff',
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          color: '#064e3b'
                        }}
                      />
                    </div>
                  )}

                  <div className="form-group" style={{ margin: 0 }}>
                    <label htmlFor="expiryUnit" style={{ fontSize: '0.8rem', color: '#065f46', fontWeight: 600 }}>
                      Time Unit & Setting
                    </label>
                    <select
                      id="expiryUnit"
                      name="expiryUnit"
                      value={formData.expiryUnit}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '10px',
                        border: '1px solid #6ee7b7',
                        background: '#ffffff',
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        color: '#064e3b'
                      }}
                    >
                      <option value="days">Days (Default)</option>
                      <option value="hours">Hours</option>
                      <option value="never">No Auto-Removal (Keep Listed for Grains/Spices)</option>
                    </select>
                  </div>
                </div>

                <div style={{
                  marginTop: '0.85rem',
                  fontSize: '0.8rem',
                  color: '#047857',
                  background: '#ffffff',
                  padding: '0.5rem 0.85rem',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: 600,
                  border: '1px solid #a7f3d0'
                }}>
                  <i className="fas fa-clock" style={{ color: '#10b981' }}></i>
                  {formData.expiryUnit === 'never' ? (
                    <span>🌾 <strong>No Auto-Removal:</strong> Long shelf-life produce (Grains/Seeds/Spices) will stay listed until marked as <strong>Sold Out</strong>.</span>
                  ) : (
                    <span>Product will auto-remove after <strong>{formData.expiryDuration || '7'} {formData.expiryUnit === 'hours' ? 'Hours' : 'Days'}</strong> if unsold.</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">
                  <i className="fas fa-align-left"></i>
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your crop (optional)"
                  rows="3"
                />
              </div>

              {/* Location Section Removed - Now handled globally */}

              <div className="form-group">
                <label htmlFor="images">
                  <i className="fas fa-images"></i>
                  Upload Images
                </label>
                <input
                  type="file"
                  id="images"
                  name="images"
                  onChange={handleImageUpload}
                  multiple
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  className="file-input"
                />
                <div className="image-preview">
                  {formData.images.map((image, index) => (
                    <div key={index} className="image-item">
                      <img src={image} alt={`Crop ${index + 1}`} />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="remove-image"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <motion.button
                type="submit"
                className="submit-btn"
                disabled={isLoading || !location.coordinates}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                title={!location.coordinates ? "Please enable location first" : (editingCropId ? "Update Product" : "Upload Product")}
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    {editingCropId ? 'Updating...' : 'Uploading...'}
                  </>
                ) : (
                  <>
                    <i className={editingCropId ? "fas fa-save" : "fas fa-upload"}></i>
                    {editingCropId ? 'Update Crop' : 'Upload Crop'}
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Your Items Section */}
          <motion.div
            className="items-section"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2>Your Items</h2>
            {/* Status Filter Tabs (All, Unsold, Sold Out) */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '20px',
                  border: '1px solid #cbd5e1',
                  background: statusFilter === 'all' ? '#0f172a' : '#ffffff',
                  color: statusFilter === 'all' ? '#ffffff' : '#475569',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                All ({uploadedCrops.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('unsold')}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '20px',
                  border: '1px solid #a7f3d0',
                  background: statusFilter === 'unsold' ? '#10b981' : '#ecfdf5',
                  color: statusFilter === 'unsold' ? '#ffffff' : '#047857',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                🟢 Unsold ({uploadedCrops.filter(c => c.status !== 'sold').length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('sold')}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '20px',
                  border: '1px solid #fca5a5',
                  background: statusFilter === 'sold' ? '#ef4444' : '#fef2f2',
                  color: statusFilter === 'sold' ? '#ffffff' : '#b91c1c',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                🔴 Sold Out ({uploadedCrops.filter(c => c.status === 'sold').length})
              </button>
            </div>

            {uploadedCrops.length === 0 ? (
              <div className="no-items">
                <i className="fas fa-seedling"></i>
                <p>No crops uploaded yet. Upload your first crop above!</p>
              </div>
            ) : (
              <div className="crops-grid">
                {uploadedCrops.filter(crop => {
                  if (statusFilter === 'unsold') return crop.status !== 'sold';
                  if (statusFilter === 'sold') return crop.status === 'sold';
                  return true;
                }).map((crop) => (
                  <motion.div
                    key={crop.id}
                    className="crop-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="crop-images">
                      {crop.images && crop.images.length > 0 ? (
                        <img
                          src={(() => {
                            const img = crop.images[0];
                            if (!img) return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect fill='%23f0f0f0' width='300' height='200'/%3E%3Ctext fill='%23888888' font-family='sans-serif' font-size='20' dy='7' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3ENo Image%3C/text%3E%3C/svg%3E";
                            return typeof img === 'string' ? img : (img.url || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect fill='%23f0f0f0' width='300' height='200'/%3E%3Ctext fill='%23888888' font-family='sans-serif' font-size='20' dy='7' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3ENo Image%3C/text%3E%3C/svg%3E");
                          })()}
                          alt={crop.vegetableType}
                          onError={(e) => { e.target.onerror = null; e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect fill='%23f0f0f0' width='300' height='200'/%3E%3Ctext fill='%23888888' font-family='sans-serif' font-size='20' dy='7' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3ENo Image%3C/text%3E%3C/svg%3E"; }}
                        />
                      ) : (
                        <div className="no-image">
                          <i className="fas fa-image"></i>
                        </div>
                      )}
                    </div>
                    <div className="crop-info">
                      <h3>{crop.vegetableType}</h3>
                      <div className="crop-details">
                        <span className="quantity">Quantity: {crop.quantity} kg</span>
                        <span className="rate">Rate: ₹{crop.ratePerKg}/kg</span>
                        <span className="total">Total: ₹{(parseFloat(crop.ratePerKg || 0) * parseFloat(crop.quantity || 0)).toLocaleString()}</span>
                      </div>
                      {crop.description && (
                        <p className="description">Description: {crop.description}</p>
                      )}

                      <div className="crop-meta" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.5rem' }}>
                        <span className="upload-date">
                          <i className="fas fa-calendar"></i>
                          Uploaded: {formatDate(crop.uploadingDate)}
                        </span>

                        <span className="expiry-date-pill" style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: '#047857',
                          background: '#ecfdf5',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '6px',
                          border: '1px solid #a7f3d0',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}>
                          <i className="fas fa-hourglass-half" style={{ color: '#d97706' }}></i>
                          Auto-removes in {crop.expiryDuration || 7} {crop.expiryUnit === 'hours' ? 'Hours' : 'Days'} if unsold
                        </span>

                        <span className={`status ${(crop.status ?? "").toLowerCase()}`}>
                          {crop.status ?? "Active"}
                        </span>
                      </div>
                      <div className="card-actions" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                        <button
                          onClick={() => navigate(`/farmer/product-bids/${crop.id || crop._id}`)}
                          className="bids-btn"
                          style={{
                            width: '100%',
                            background: '#10b981',
                            color: 'white',
                            border: 'none',
                            padding: '0.6rem',
                            borderRadius: '6px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.4rem',
                            boxShadow: '0 2px 6px rgba(16, 185, 129, 0.2)'
                          }}
                        >
                          <i className="fas fa-gavel"></i>
                          View Bids & Offers
                        </button>
                        <button
                          onClick={() => handleToggleStatus(crop.id || crop._id, crop.status)}
                          style={{
                            width: '100%',
                            background: crop.status === 'sold' ? '#10b981' : '#f59e0b',
                            color: 'white',
                            border: 'none',
                            padding: '0.55rem',
                            borderRadius: '6px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.4rem',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                          }}
                        >
                          <i className={`fas fa-${crop.status === 'sold' ? 'check-circle' : 'tag'}`}></i>
                          {crop.status === 'sold' ? 'Mark as Available (Relist)' : 'Mark as Sold Out'}
                        </button>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleEdit(crop)}
                            className="edit-btn"
                            style={{ flex: 1, background: '#3b82f6', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}
                          >
                            <i className="fas fa-edit"></i>
                            Edit
                          </button>
                          <button
                            onClick={() => deleteCrop(crop.id)}
                            className="delete-btn"
                            style={{ flex: 1 }}
                          >
                            <i className="fas fa-trash"></i>
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;
