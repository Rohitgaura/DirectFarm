import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import apiService from '../../services/api';
import '../../styles/FarmerDashboard.css';

const FarmerDashboard = () => {
  const [formData, setFormData] = useState({
    vegetableType: '',
    quantity: '',
    ratePerKg: '',
    harvestingDate: '',
    description: '',
    images: []
  });

  // Global location state (similar to BuyerDashboard)
  const [location, setLocation] = useState({
    coordinates: null
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedCrops, setUploadedCrops] = useState([]);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [user, setUser] = useState(null);

  // Vegetable types dropdown options
  const vegetableTypes = [
    'Tomato', 'Potato', 'Onion', 'Carrot', 'Cabbage', 'Cauliflower',
    'Spinach', 'Lettuce', 'Cucumber', 'Bell Pepper', 'Broccoli', 'Radish',
    'Beetroot', 'Turnip', 'Sweet Potato', 'Ginger', 'Garlic', 'Green Beans',
    'Peas', 'Corn', 'Eggplant', 'Okra', 'Pumpkin', 'Squash', 'Zucchini'
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

          // Fetch products for this farmer - use either _id or id
          const userId = userData._id || userData.id;
          if (userId) {
            try {
              const productsResponse = await apiService.getProducts({ farmerId: userId });
              if (productsResponse.success && productsResponse.data) {
                // Transform products to match the display format
                const transformedProducts = productsResponse.data.map(product => ({
                  id: product._id,
                  vegetableType: product.name,
                  quantity: product.quantity,
                  ratePerKg: product.price,
                  totalRate: (product.quantity * product.price).toFixed(2),
                  description: product.description || '',
                  images: product.images || [],
                  uploadingDate: product.createdAt,
                  harvestingDate: product.harvestingDate,
                  location: product.location // Keep location for display if available
                }));
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

  // Auto-request location on mount if user is logged in and location is not set
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
      } else {
        // If not, ask for it
        getCurrentLocation();
      }
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
          localStorage.setItem('user', JSON.stringify(updatedUser));
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

  // Calculate total rate automatically
  const calculateTotalRate = () => {
    const quantity = parseFloat(formData.quantity) || 0;
    const rate = parseFloat(formData.ratePerKg) || 0;
    return (quantity * rate).toFixed(2);
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the form errors before submitting');
      return;
    }

    // Check if user is logged in
    let currentUser = user;
    if (!currentUser || (!currentUser._id && !currentUser.id)) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          currentUser = JSON.parse(storedUser);
          setUser(currentUser);
        } catch (error) {
          console.error('Error parsing user from localStorage:', error);
        }
      }
    }

    const userId = currentUser?._id || currentUser?.id;
    if (!userId) {
      toast.error('Please login to upload products');
      return;
    }

    setIsLoading(true);

    try {
      // Prepare product data
      const productData = {
        farmerId: userId,
        name: formData.vegetableType,
        quantity: parseFloat(formData.quantity),
        price: parseFloat(formData.ratePerKg),
        harvestingDate: formData.harvestingDate,
        description: formData.description || '',
        images: formData.images || [],
        location: {
          // Send empty strings for address fields as we don't have them anymore
          state: '',
          district: '',
          subdistrict: '',
          village: '',
          coordinates: location.coordinates ? [
            location.coordinates.longitude,
            location.coordinates.latitude
          ] : undefined
        }
      };

      // Call API to create product
      const response = await apiService.createProduct(productData);

      if (response.success) {
        // Add to uploaded crops list
        const newProduct = {
          id: response.data._id || response.data.product?._id,
          vegetableType: response.data.name || response.data.product?.name,
          quantity: response.data.quantity || response.data.product?.quantity,
          ratePerKg: response.data.price || response.data.product?.price,
          totalRate: calculateTotalRate(),
          description: response.data.description || response.data.product?.description || '',
          images: response.data.images || response.data.product?.images || [],
          uploadingDate: response.data.createdAt || response.data.product?.createdAt,
          harvestingDate: response.data.harvestingDate || response.data.product?.harvestingDate,
          location: response.data.location || response.data.product?.location
        };

        const updatedCrops = [newProduct, ...uploadedCrops];
        setUploadedCrops(updatedCrops);

        // Reset form
        setFormData({
          vegetableType: '',
          quantity: '',
          ratePerKg: '',
          harvestingDate: '',
          description: '',
          images: []
        });

        toast.success('Product uploaded successfully!', {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        throw new Error(response.message || 'Failed to upload product');
      }

    } catch (error) {
      console.error('Error uploading product:', error);
      toast.error(error.message || 'Failed to upload product. Please try again.');
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
        </motion.div>

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
                  <div className="coordinates-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', marginTop: '0.5rem', fontSize: '0.8rem', color: '#666' }}>
                    <i className="fas fa-satellite-dish"></i>
                    <span>{location.coordinates.latitude.toFixed(4)}, {location.coordinates.longitude.toFixed(4)}</span>
                  </div>
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

              <button
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                className="find-products-btn"
                style={{ background: '#2ecc71', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {isGettingLocation ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Detecting Location...
                  </>
                ) : (
                  <>
                    <i className="fas fa-location-arrow"></i>
                    Enable Location
                  </>
                )}
              </button>
            </div>
          )}
        </motion.div>

        <div className="dashboard-content">
          {/* Upload Form Section */}
          <motion.div
            className="upload-section"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2>Upload New Crop</h2>
            <form onSubmit={handleSubmit} className="crop-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="vegetableType">
                    <i className="fas fa-seedling"></i>
                    Vegetable Type
                  </label>
                  <select
                    id="vegetableType"
                    name="vegetableType"
                    value={formData.vegetableType}
                    onChange={handleChange}
                    className={errors.vegetableType ? 'error' : ''}
                  >
                    <option value="">Select vegetable type</option>
                    {vegetableTypes.map(type => (
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
                title={!location.coordinates ? "Please enable location first" : "Upload Product"}
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Uploading...
                  </>
                ) : (
                  <>
                    <i className="fas fa-upload"></i>
                    Upload Crop
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
            {uploadedCrops.length === 0 ? (
              <div className="no-items">
                <i className="fas fa-seedling"></i>
                <p>No crops uploaded yet. Upload your first crop above!</p>
              </div>
            ) : (
              <div className="crops-grid">
                {uploadedCrops.map((crop) => (
                  <motion.div
                    key={crop.id}
                    className="crop-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="crop-images">
                      {crop.images.length > 0 ? (
                        <img src={crop.images[0]} alt={crop.vegetableType} />
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
                        <span className="total">Total: ₹{crop.totalRate}</span>
                      </div>
                      {crop.description && (
                        <p className="description">Description: {crop.description}</p>
                      )}
                      {crop.location && (
                        <div className="crop-location">
                          <i className="fas fa-map-marker-alt"></i>
                          <span>
                            {crop.location.village}, {crop.location.subdistrict}, {crop.location.district}, {crop.location.state}
                          </span>
                        </div>
                      )}
                      <div className="crop-meta">
                        <span className="upload-date">
                          <i className="fas fa-calendar"></i>
                          Uploading Date: {formatDate(crop.uploadingDate)}
                        </span>

                        <span className={`status ${(crop.status ?? "").toLowerCase()}`}>
                          {crop.status ?? "Pending"}
                        </span>
                      </div>
                      <button
                        onClick={() => deleteCrop(crop.id)}
                        className="delete-btn"
                      >
                        <i className="fas fa-trash"></i>
                        Delete
                      </button>
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
