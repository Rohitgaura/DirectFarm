// API Service for DirectFarm Frontend

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method to get auth token
  getAuthToken() {
    return localStorage.getItem('token');
  }

  // Helper method to set auth token
  setAuthToken(token) {
    localStorage.setItem('token', token);
  }

  // Helper method to remove auth token
  removeAuthToken() {
    localStorage.removeItem('token');
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
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Handle non-JSON responses
      let data;
      try {
        data = await response.json();
      } catch (e) {
        // If response is not JSON, create error with status
        if (!response.ok) {
          const error = new Error(response.statusText || 'Something went wrong');
          error.status = response.status;
          throw error;
        }
        return { success: true };
      }

      if (!response.ok) {
        const error = new Error(data.message || 'Something went wrong');
        error.status = response.status;
        error.response = data;
        throw error;
      }

      return data;
    } catch (error) {
      // Preserve status code if available
      if (!error.status && error.response) {
        error.status = error.response.status;
      }
      console.error('API Request Error:', error);
      throw error;
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

    if (response.success && response.data.token) {
      this.setAuthToken(response.data.token);
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
    }
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

  // Health Check
  async healthCheck() {
    return this.request('/health');
  }


  // Verify token validity (optional - if endpoint exists)
  async verifyToken() {
    const token = this.getAuthToken();
    if (!token) {
      return { valid: false, message: 'No token found' };
    }

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
        console.warn('Token invalid or expired:', error.message);
        return { valid: false, message: error.message };
      }
      
      // For other errors (404, network, etc.), assume token is valid
      // This allows the app to work even if verify endpoint doesn't exist
      if (status === 404) {
        console.log('Token verification endpoint not found (404), assuming valid');
      } else {
        console.log('Token verification failed (network/other error), assuming valid');
      }
      return { valid: true };
    }
  }

}


// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
