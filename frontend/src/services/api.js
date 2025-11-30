/**
 * Names: Daniel, Jacob, Maharshi, Ben
 * Time: 2 hours
 */

// This will need to be changed to the actual URL of the backend server when deploying.
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api'

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
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

    const response = await fetch(`${this.baseURL}/auth/profile/`, options);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to update profile');
    return data;
  }

  async getPrograms() {
    try {
      return await this.get('/programs/');
    } catch (error) {
      console.error("Failed to fetch programs:", error);
      return [];
    }
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

  // ============ ALUMNI METHODS ============

  /**
   * Alumni signup
   */
  async alumniSignup(alumniData) {
    return this.post('/auth/alumni/signup/', alumniData);
  }

  /**
   * Alumni login
   */
  async alumniLogin(credentials) {
    return this.post('/auth/alumni/login/', credentials);
  }

  /**
   * Alumni logout
   */
  async alumniLogout() {
    return this.post('/auth/alumni/logout/');
  }

  /**
   * Get current alumni profile
   */
  async getAlumniProfile() {
    return this.get('/auth/alumni/profile/');
  }

  /**
   * Get alumni by program
   */
  async getAlumniByProgram(programId) {
    return this.get(`/auth/alumni/by-program/${programId}/`);
  }
}

const apiService = new ApiService();
export default apiService;