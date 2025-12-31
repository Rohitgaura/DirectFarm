// API Service for DirectFarm Frontend

import authUtils from '../utils/auth';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;

    // Cache for token verification to prevent duplicate requests
    this.tokenVerificationCache = {
      result: null,
      timestamp: null,
      pendingRequest: null
    };

    // Cache TTL (Time To Live) - 30 seconds
    this.VERIFY_TOKEN_CACHE_TTL = 30 * 1000; // 30 seconds in milliseconds
  }

  // Helper method to get auth token
  getAuthToken() {
    return authUtils.getToken();
  }

  // Helper method to set auth token
  setAuthToken(token) {
    // Note: This method might be redundant if we use authUtils.setAuth in Login.js
    // But keeping it for compatibility, though it only sets the cookie now
    // Ideally, we should pass user object too, but for now let's just update the token
    // or rely on Login.js to call authUtils.setAuth
    console.warn('setAuthToken called directly. Prefer using authUtils.setAuth(token, user)');
  }

  // Helper method to remove auth token
  removeAuthToken() {
    authUtils.clearAuth();
  }

  // Helper method to get headers
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    const token = this.getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = { headers: this.getHeaders(), ...options };

    try {
      const response = await fetch(url, config);

      // ---- Try to parse JSON ----
      let data = null;
      try {
        data = await response.json();
      } catch (jsonErr) {
        // Response is NOT JSON
        if (!response.ok) {
          // eslint-disable-next-line no-throw-literal
          throw {
            success: false,
            status: response.status,
            message: response.statusText || "Something went wrong"
          };
        }
        return { success: true };
      }

      // ---- Handle server errors (400-500) ----
      if (!response.ok) {
        // eslint-disable-next-line no-throw-literal
        throw {
          success: false,
          status: response.status,
          message: data?.message || "Something went wrong",
          data
        };
      }

      // ---- Success ----
      return data;

    } catch (error) {
      // Standardize error so frontend never crashes
      return Promise.reject({
        success: false,
        status: error?.status || 500,
        message:
          error?.message ||
          error?.data?.message ||
          "Something went wrong",
        data: error?.data || null
      });
    }
  }

  // Authentication Methods
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    console.log(response);

    if (response.success && response.data.token) {
      // We don't set auth here anymore, Login.js handles it with authUtils.setAuth
      // to ensure both token and user data are set together
      // this.setAuthToken(response.data.token); 

      // Clear token cache after login to force fresh verification
      this.clearTokenCache();
    }

    return response;
  }

  async logout() {
    try {
      await this.request('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.removeAuthToken();
      // Clear token cache after logout
      this.clearTokenCache();
    }
  }

  async forgotPassword(email) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(data) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProfile() {
    return this.request('/auth/me');
  }

  async updateProfile(profileData) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Rating & Reviews
  async submitRating(ratingData) {
    return this.request('/ratings', {
      method: 'POST',
      body: JSON.stringify(ratingData),
    });
  }

  async getUserRatings(userId) {
    return this.request(`/ratings/user/${userId}`);
  }

  async getTopRatedUsers(role) {
    return this.request(`/ratings/top-rated?role=${role}`);
  }

  // Location APIs
  async getStates() {
    const response = await this.request('/locations/states');
    return response;
  }

  async getDistricts(state) {
    const response = await this.request(`/locations/districts/${state}`);
    return response;
  }

  async getSubdistricts(district) {
    const response = await this.request(`/locations/subdistricts/${district}`);
    return response;
  }

  async getVillages(subdistrict) {
    const response = await this.request(`/locations/villages/${subdistrict}`);
    return response;
  }

  async geocodeLocation(locationData) {
    const response = await this.request('/locations/geocode', {
      method: 'POST',
      body: JSON.stringify(locationData)
    });
    return response;
  }

  async reverseGeocodeLocation(latitude, longitude) {
    const response = await this.request('/locations/reverse-geocode', {
      method: 'POST',
      body: JSON.stringify({ latitude, longitude })
    });
    return response;
  }

  async updateFarmerProfile(farmerId, profileData) {
    return this.request(`/farmers/${farmerId}`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Success Stories Methods
  async getSuccessStories() {
    return this.request('/success-stories');
  }

  async submitSuccessStory(storyData) {
    return this.request('/success-stories', {
      method: 'POST',
      body: JSON.stringify(storyData),
    });
  }

  // Product Methods
  async getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`;
    return this.request(endpoint);
  }

  async getProduct(id) {
    return this.request(`/products/${id}`);
  }

  async createProduct(productData) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id, productData) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id) {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // async getFarmerProducts(farmerId, params = {}) {
  //   const queryString = new URLSearchParams(params).toString();
  //   const endpoint = `/products/farmer/${farmerId}${queryString ? `?${queryString}` : ''}`;
  //   return this.request(endpoint);
  // }

  // Order Methods
  async getOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/orders${queryString ? `?${queryString}` : ''}`;
    return this.request(endpoint);
  }

  async getOrder(id) {
    return this.request(`/orders/${id}`);
  }

  async createOrder(orderData) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async updateOrderStatus(id, statusData) {
    return this.request(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(statusData),
    });
  }

  // Farmer Methods
  async getFarmers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/farmers${queryString ? `?${queryString}` : ''}`;
    return this.request(endpoint);
  }

  async getFarmer(id) {
    return this.request(`/farmers/${id}`);
  }

  async getFarmerProducts(farmerId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/farmers/${farmerId}/products${queryString ? `?${queryString}` : ''}`;
    return this.request(endpoint);
  }

  async getFarmerOrders(farmerId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/farmers/${farmerId}/orders${queryString ? `?${queryString}` : ''}`;
    return this.request(endpoint);
  }

  async getFarmerDashboard(farmerId) {
    return this.request(`/farmers/${farmerId}/dashboard`);
  }

  // Buyer Methods
  async getBuyerOrders(buyerId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/buyers/${buyerId}/orders${queryString ? `?${queryString}` : ''}`;
    return this.request(endpoint);
  }

  async getBuyerDashboard(buyerId) {
    return this.request(`/buyers/${buyerId}/dashboard`);
  }

  async getBuyerProfile(buyerId) {
    return this.request(`/buyers/${buyerId}/profile`);
  }

  // User Methods
  async getUsers() {
    return this.request('/users');
  }

  async getUser(id) {
    return this.request(`/users/${id}`);
  }

  async updateUser(id, userData) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Negotiation Methods
  async createNegotiation(data) {
    return this.request('/negotiations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getFarmerNegotiations() {
    return this.request('/negotiations/farmer');
  }

  async getBuyerNegotiations() {
    return this.request('/negotiations/buyer');
  }

  async getNegotiationById(id) {
    return this.request(`/negotiations/${id}`);
  }

  async updateNegotiationStatus(id, data) {
    return this.request(`/negotiations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteNegotiation(id) {
    return this.request(`/negotiations/${id}`, {
      method: 'DELETE',
    });
  }

  // Chat Methods
  async sendMessage(data) {
    return this.request('/chat/send', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getConversation(userId) {
    return this.request(`/chat/conversation/${userId}`);
  }

  async getConversations() {
    return this.request('/chat/conversations');
  }

  async markMessageRead(messageId) {
    return this.request(`/chat/${messageId}/read`, {
      method: 'PUT',
    });
  }

  // Notification Methods
  async getNotifications() {
    return this.request('/notifications');
  }

  async markNotificationRead(id) {
    return this.request(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  }

  // Admin Methods
  async getAdminStats() {
    return this.request('/admin/stats');
  }

  async getAllUsers() {
    return this.request('/admin/users');
  }



  async getAllProducts() {
    return this.request('/admin/products');
  }



  // Analytics Methods
  async getAdminAnalytics() {
    return this.request('/analytics/admin');
  }

  async getFarmerAnalytics() {
    return this.request('/analytics/farmer');
  }

  async getBuyerAnalytics() {
    return this.request('/analytics/buyer');
  }



  // Rating Methods

  // Health Check
  async healthCheck() {
    return this.request('/health');
  }


  // Verify token validity (optional - if endpoint exists)
  // Uses caching and request deduplication to prevent continuous requests
  async verifyToken() {
    const token = this.getAuthToken();
    if (!token) {
      // Clear cache if no token
      this.tokenVerificationCache = {
        result: null,
        timestamp: null,
        pendingRequest: null
      };
      return { valid: false, message: 'No token found' };
    }

    const now = Date.now();
    const cache = this.tokenVerificationCache;

    // Check if there's a cached result that's still valid
    if (cache.result && cache.timestamp && (now - cache.timestamp) < this.VERIFY_TOKEN_CACHE_TTL) {
      // Return cached result
      return cache.result;
    }

    // Check if there's already a pending request - reuse it instead of making a new one
    if (cache.pendingRequest) {
      return cache.pendingRequest;
    }

    // Create a new request and store the promise
    cache.pendingRequest = this._performTokenVerification(token)
      .then(result => {
        // Cache the result on success
        cache.result = result;
        cache.timestamp = Date.now();
        cache.pendingRequest = null; // Clear pending request
        return result;
      })
      .catch(error => {
        cache.pendingRequest = null; // Clear pending request on error
        throw error;
      });

    return cache.pendingRequest;
  }

  // Internal method to perform the actual token verification
  async _performTokenVerification(token) {
    try {
      // Try to verify token - if endpoint doesn't exist, return valid
      const response = await this.request('/auth/verify-token', {
        method: 'GET'
      });
      return { valid: true, data: response };
    } catch (error) {
      // Check status code if available
      const status = error.status || (error.response && error.response.status);

      // Only invalidate on actual authentication errors (401, 403)
      if (status === 401 || status === 403) {
        // Clear cache on auth errors
        this.tokenVerificationCache = {
          result: { valid: false, message: error.message },
          timestamp: Date.now(),
          pendingRequest: null
        };
        return { valid: false, message: error.message };
      }

      // For other errors (404, network, etc.), assume token is valid
      // This allows the app to work even if verify endpoint doesn't exist
      if (status === 404) {
        console.log('Token verification endpoint not found (404), assuming valid');
      } else {
        console.log('Token verification failed (network/other error), assuming valid');
      }

      // Cache valid result even on network errors
      return { valid: true };
    }
  }

  // Clear token verification cache (useful after login/logout)
  clearTokenCache() {
    this.tokenVerificationCache = {
      result: null,
      timestamp: null,
      pendingRequest: null
    };
  }

}


// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
