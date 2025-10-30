/**
 * Names: Daniel, Jacob, Maharshi, Ben
 * Time: 2 hours
 */

// This will need to be changed to the actual URL of the backend server when deploying.
const API_BASE_URL = 'http://localhost:8000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Get CSRF token from cookies
   */
  getCsrfToken() {
    const name = 'csrftoken';
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === name + '=') {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
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

    // Add CSRF token for non-GET requests
    if (config.method && config.method !== 'GET') {
      const csrfToken = this.getCsrfToken();
      if (csrfToken) {
        config.headers['X-CSRFToken'] = csrfToken;
      }
    }

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        if (data.username) {
          throw new Error('A user with that username already exists.');
        }
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

  async getPrograms() {
    return this.get('/programs/');
  }

  /**
   * Get user favorites
   */
  async getFavorites() {
    return this.get('/auth/favorites/');
  }

  /**
   * Add program to favorites
   */
  async addFavorite(programId) {
    return this.post('/auth/favorites/', { program_id: programId });
  }

  /**
   * Remove program from favorites
   */
  async removeFavorite(programId) {
    return this.request(`/auth/favorites/${programId}/`, { method: 'DELETE' });
  }

  /**
   * Check if program is favorited
   */
  async checkFavorite(programId) {
    return this.get(`/auth/favorites/${programId}/check/`);
  }
}

const apiService = new ApiService();
export default apiService;
