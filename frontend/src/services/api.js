/**
 * API service for handling authentication and other backend communication
 */

// This will need to be changed to the actual URL of the backend server when deploying.
const API_BASE_URL = 'http://localhost:8000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Make HTTP request with proper headers and error handling
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
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
   * GET requests use this.
   */
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  /**
   * POST requests use this.
   */
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: data,
    });
  }

  // Our methods for connecting to the backend go here.
  
  /**
   * User signup
   */
  async signup(userData) {
    return this.post('/auth/signup/', userData);
  }

  /**
   * User login
   */
  async login(credentials) {
    return this.post('/auth/login/', credentials);
  }

  /**
   * User logout
   */
  async logout() {
    return this.post('/auth/logout/');
  }

  /**
   * Get current user profile
   */
  async getUserProfile() {
    return this.get('/auth/profile/');
  }
}

const apiService = new ApiService();
export default apiService;