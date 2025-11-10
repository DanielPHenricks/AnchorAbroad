/**
 * Names: Daniel, Jacob, Maharshi, Ben
 * Time: 2 hours
 */

// Determine API base URL based on environment
const getApiBaseUrl = () => {
  // Check if running in production mode
  if (process.env.REACT_APP_ENV === 'production') {
    return process.env.REACT_APP_API_URL || 'http://44.203.101.226:8000/api';
  }
  // Default to localhost for development
  return 'http://localhost:8000/api';
};

const API_BASE_URL = getApiBaseUrl();

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
    const isFormData = options.isFormData || false;

    const headers = {
      ...options.headers,
    };

    // Only add JSON content type if not using FormData
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    const config = {
      method: options.method || 'GET',
      headers,
      credentials: 'include',
    };

    // Add CSRF token for non-GET requests
    if (config.method && config.method !== 'GET') {
      const csrfToken = this.getCsrfToken();
      if (csrfToken) {
        config.headers['X-CSRFToken'] = csrfToken;
      }
    }

    // Attach body properly
    if (options.body) {
      config.body = isFormData ? options.body : JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);
      const contentType = response.headers.get('content-type');
      const data =
        contentType && contentType.includes('application/json')
          ? await response.json()
          : await response.text();

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

  async updateUserProfile(profileData, isFormData = false) {
    let options = {
      method: 'PATCH',
      credentials: 'include',
    };

    if (isFormData) {
      options.body = profileData;
      options.headers = {}; // Don't set Content-Type, browser will handle it
    } else {
      options.body = JSON.stringify(profileData);
      options.headers = { 'Content-Type': 'application/json' };
    }

    const csrfToken = this.getCsrfToken();
    if (csrfToken) {
      options.headers['X-CSRFToken'] = csrfToken;
    }

    const response = await fetch(`${this.baseURL}/auth/profile/`, options);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to update profile');
    return data;
  }

  async getPrograms() {
    // Ensure the full URL is used
    const response = await fetch(`${this.baseURL}/programs/`);
    if (!response.ok) {
      console.error("Failed to fetch programs:", response.statusText);
      return [];
    }
    const data = await response.json();
  
    // Ensure each program has latitude, longitude, name, id, continent
    return data.map((program) => ({
      id: program.id,
      name: program.name,
      latitude: program.latitude,
      longitude: program.longitude,
      continent: program.continent || "Unknown",
    }));
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
