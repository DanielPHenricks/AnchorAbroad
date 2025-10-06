/**
 * API service for handling authentication and other backend communication
 */

const API_BASE_URL = 'http://localhost:8000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Make HTTP request with proper headers and error handling
   * @param {string} endpoint 
   * @param {Object} options 
   * @returns {Promise}
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies for session auth
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  /**
   * GET request
   * @param {string} endpoint 
   * @returns {Promise}
   */
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  /**
   * POST request
   * @param {string} endpoint 
   * @param {Object} data 
   * @returns {Promise}
   */
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: data,
    });
  }

  // Authentication methods
  
  /**
   * User signup
   * @param {Object} userData - {username, email, password, password_confirm, first_name, last_name}
   * @returns {Promise}
   */
  async signup(userData) {
    return this.post('/auth/signup/', userData);
  }

  /**
   * User login
   * @param {Object} credentials - {username, password}
   * @returns {Promise}
   */
  async login(credentials) {
    return this.post('/auth/login/', credentials);
  }

  /**
   * User logout
   * @returns {Promise}
   */
  async logout() {
    return this.post('/auth/logout/');
  }

  /**
   * Get current user profile
   * @returns {Promise}
   */
  async getUserProfile() {
    return this.get('/auth/profile/');
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;