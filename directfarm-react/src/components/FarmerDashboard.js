import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './FarmerDashboard.css';

const FarmerDashboard = () => {
  const [formData, setFormData] = useState({
    vegetableType: '',
    quantity: '',
    ratePerKg: '',
    description: '',
    images: []
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedCrops, setUploadedCrops] = useState([]);

  // Vegetable types dropdown options
  const vegetableTypes = [
    'Tomato', 'Potato', 'Onion', 'Carrot', 'Cabbage', 'Cauliflower',
    'Spinach', 'Lettuce', 'Cucumber', 'Bell Pepper', 'Broccoli', 'Radish',
    'Beetroot', 'Turnip', 'Sweet Potato', 'Ginger', 'Garlic', 'Green Beans',
    'Peas', 'Corn', 'Eggplant', 'Okra', 'Pumpkin', 'Squash', 'Zucchini'
  ];

  // Load uploaded crops from localStorage on component mount
  useEffect(() => {
    const savedCrops = localStorage.getItem('farmerCrops');
    if (savedCrops) {
      setUploadedCrops(JSON.parse(savedCrops));
    }
  }, []);

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

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      toast.error('Please select valid image files');
      return;
    }

    // Convert images to base64 for storage
    const imagePromises = imageFiles.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(imagePromises).then(base64Images => {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...base64Images]
      }));
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
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors before submitting');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const cropData = {
        id: Date.now().toString(),
        ...formData,
        totalRate: calculateTotalRate(),
        uploadDate: new Date().toISOString(),
        status: 'Available'
      };
      
      // Add to uploaded crops
      const updatedCrops = [cropData, ...uploadedCrops];
      setUploadedCrops(updatedCrops);
      
      // Save to localStorage
      localStorage.setItem('farmerCrops', JSON.stringify(updatedCrops));
      
      // Reset form
      setFormData({
        vegetableType: '',
        quantity: '',
        ratePerKg: '',
        description: '',
        images: []
      });
      
      toast.success('Crop uploaded successfully!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
    } catch (error) {
      console.error('Error uploading crop:', error);
      toast.error('Failed to upload crop. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCrop = (cropId) => {
    const updatedCrops = uploadedCrops.filter(crop => crop.id !== cropId);
    setUploadedCrops(updatedCrops);
    localStorage.setItem('farmerCrops', JSON.stringify(updatedCrops));
    toast.success('Crop deleted successfully!');
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
                  accept="image/*"
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
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
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
                        <span className="quantity">{crop.quantity} kg</span>
                        <span className="rate">₹{crop.ratePerKg}/kg</span>
                        <span className="total">Total: ₹{crop.totalRate}</span>
                      </div>
                      {crop.description && (
                        <p className="description">{crop.description}</p>
                      )}
                      <div className="crop-meta">
                        <span className="upload-date">
                          <i className="fas fa-calendar"></i>
                          {formatDate(crop.uploadDate)}
                        </span>
                        <span className={`status ${crop.status.toLowerCase()}`}>
                          {crop.status}
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
