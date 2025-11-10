/**
 * API Service Tests
 * Tests all API methods with proper mocking and error handling
 */
import apiService from '../api';
import { mockFetchResponse, mockFetchError, setCookie, clearCookies } from '../../utils/testUtils';
import { TextEncoder } from 'util';
global.TextEncoder = TextEncoder;

describe('ApiService', () => {
  let fetchSpy;

  beforeEach(() => {
    // Mock fetch
    fetchSpy = jest.spyOn(global, 'fetch');
    clearCookies();
  });

  afterEach(() => {
    fetchSpy.mockRestore();
    clearCookies();
  });

  describe('getCsrfToken', () => {
    it('should retrieve CSRF token from cookies', () => {
      setCookie('csrftoken', 'test-csrf-token');
      const token = apiService.getCsrfToken();
      expect(token).toBe('test-csrf-token');
    });

    it('should return null when no CSRF token exists', () => {
      const token = apiService.getCsrfToken();
      expect(token).toBe(null);
    });

    it('should decode URI-encoded CSRF token', () => {
      document.cookie = 'csrftoken=test%20token%20with%20spaces; path=/';
      const token = apiService.getCsrfToken();
      expect(token).toBe('test token with spaces');
    });
  });

  describe('request method', () => {
    it('should make GET request without CSRF token', async () => {
      const mockData = { success: true };
      fetchSpy.mockReturnValue(mockFetchResponse(mockData));

      const result = await apiService.request('/test/', { method: 'GET' });

      expect(fetchSpy).toHaveBeenCalledWith(
        'http://localhost:8000/api/test/',
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }),
      );
      expect(result).toEqual(mockData);
    });

    it('should make POST request with CSRF token', async () => {
      setCookie('csrftoken', 'test-csrf-token');
      const mockData = { success: true };
      fetchSpy.mockReturnValue(mockFetchResponse(mockData));

      const result = await apiService.request('/test/', {
        method: 'POST',
        body: { key: 'value' },
      });

      expect(fetchSpy).toHaveBeenCalledWith(
        'http://localhost:8000/api/test/',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': 'test-csrf-token',
          },
          credentials: 'include',
          body: JSON.stringify({ key: 'value' }),
        }),
      );
      expect(result).toEqual(mockData);
    });

    it('should handle API error with username conflict', async () => {
      fetchSpy.mockReturnValue(
        Promise.resolve({
          ok: false,
          status: 400,
          json: async () => ({ username: ['User already exists'] }),
        }),
      );

      await expect(apiService.request('/test/', { method: 'POST' })).rejects.toThrow(
        'A user with that username already exists.',
      );
    });

    it('should handle generic API error', async () => {
      fetchSpy.mockReturnValue(
        Promise.resolve({
          ok: false,
          status: 500,
          json: async () => ({ message: 'Server error' }),
        }),
      );

      await expect(apiService.request('/test/', { method: 'GET' })).rejects.toThrow('Server error');
    });

    it('should handle network error', async () => {
      fetchSpy.mockReturnValue(mockFetchError('Network failure'));

      await expect(apiService.request('/test/', { method: 'GET' })).rejects.toThrow(
        'Network failure',
      );
    });

    it('should stringify object body', async () => {
      fetchSpy.mockReturnValue(mockFetchResponse({ success: true }));

      await apiService.request('/test/', {
        method: 'POST',
        body: { key: 'value' },
      });

      const callArgs = fetchSpy.mock.calls[0][1];
      expect(callArgs.body).toBe(JSON.stringify({ key: 'value' }));
    });
  });

  describe('get method', () => {
    it('should make GET request', async () => {
      const mockData = { data: 'test' };
      fetchSpy.mockReturnValue(mockFetchResponse(mockData));

      const result = await apiService.get('/test/');

      expect(fetchSpy).toHaveBeenCalledWith(
        'http://localhost:8000/api/test/',
        expect.objectContaining({
          method: 'GET',
        }),
      );
      expect(result).toEqual(mockData);
    });
  });

  describe('post method', () => {
    it('should make POST request with data', async () => {
      setCookie('csrftoken', 'test-csrf-token');
      const mockData = { success: true };
      const postData = { username: 'test', password: 'pass' };
      fetchSpy.mockReturnValue(mockFetchResponse(mockData));

      const result = await apiService.post('/test/', postData);

      expect(fetchSpy).toHaveBeenCalledWith(
        'http://localhost:8000/api/test/',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(postData),
        }),
      );
      expect(result).toEqual(mockData);
    });
  });

  describe('signup', () => {
    it('should call signup endpoint with user data', async () => {
      setCookie('csrftoken', 'test-csrf-token');
      const userData = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
        password_confirm: 'password123',
        first_name: 'New',
        last_name: 'User',
      };
      const mockResponse = { user: { id: 1, username: 'newuser' } };
      fetchSpy.mockReturnValue(mockFetchResponse(mockResponse));

      const result = await apiService.signup(userData);

      expect(fetchSpy).toHaveBeenCalledWith(
        'http://localhost:8000/api/auth/signup/',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(userData),
        }),
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('login', () => {
    it('should call login endpoint with credentials', async () => {
      setCookie('csrftoken', 'test-csrf-token');
      const credentials = { username: 'testuser', password: 'password123' };
      const mockResponse = { user: { id: 1, username: 'testuser' } };
      fetchSpy.mockReturnValue(mockFetchResponse(mockResponse));

      const result = await apiService.login(credentials);

      expect(fetchSpy).toHaveBeenCalledWith(
        'http://localhost:8000/api/auth/login/',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(credentials),
        }),
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('logout', () => {
    it('should call logout endpoint', async () => {
      setCookie('csrftoken', 'test-csrf-token');
      const mockResponse = { message: 'Logged out successfully' };
      fetchSpy.mockReturnValue(mockFetchResponse(mockResponse));

      const result = await apiService.logout();

      expect(fetchSpy).toHaveBeenCalledWith(
        'http://localhost:8000/api/auth/logout/',
        expect.objectContaining({
          method: 'POST',
        }),
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getUserProfile', () => {
    it('should call profile endpoint', async () => {
      const mockUser = { user: { id: 1, username: 'testuser' } };
      fetchSpy.mockReturnValue(mockFetchResponse(mockUser));

      const result = await apiService.getUserProfile();

      expect(fetchSpy).toHaveBeenCalledWith(
        'http://localhost:8000/api/auth/profile/',
        expect.objectContaining({
          method: 'GET',
        }),
      );
      expect(result).toEqual(mockUser);
    });
  });

  describe('getPrograms', () => {
    it('should call programs endpoint', async () => {
      const mockPrograms = [
        { program_id: 'TEST001', name: 'Program 1' },
        { program_id: 'TEST002', name: 'Program 2' },
      ];
      fetchSpy.mockReturnValue(mockFetchResponse(mockPrograms));

      const result = await apiService.getPrograms();

      expect(fetchSpy).toHaveBeenCalledWith(
        'http://localhost:8000/api/programs/',
        expect.objectContaining({
          method: 'GET',
        }),
      );
      expect(result).toEqual(mockPrograms);
    });
  });

  describe('getFavorites', () => {
    it('should call favorites endpoint', async () => {
      const mockFavorites = [{ id: 1, program: { program_id: 'TEST001', name: 'Program 1' } }];
      fetchSpy.mockReturnValue(mockFetchResponse(mockFavorites));

      const result = await apiService.getFavorites();

      expect(fetchSpy).toHaveBeenCalledWith(
        'http://localhost:8000/api/auth/favorites/',
        expect.objectContaining({
          method: 'GET',
        }),
      );
      expect(result).toEqual(mockFavorites);
    });
  });

  describe('addFavorite', () => {
    it('should call add favorite endpoint with program ID', async () => {
      setCookie('csrftoken', 'test-csrf-token');
      const programId = 'TEST001';
      const mockResponse = { message: 'Added to favorites' };
      fetchSpy.mockReturnValue(mockFetchResponse(mockResponse));

      const result = await apiService.addFavorite(programId);

      expect(fetchSpy).toHaveBeenCalledWith(
        'http://localhost:8000/api/auth/favorites/',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ program_id: programId }),
        }),
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('removeFavorite', () => {
    it('should call remove favorite endpoint with program ID', async () => {
      setCookie('csrftoken', 'test-csrf-token');
      const programId = 'TEST001';
      const mockResponse = { message: 'Removed from favorites' };
      fetchSpy.mockReturnValue(mockFetchResponse(mockResponse));

      const result = await apiService.removeFavorite(programId);

      expect(fetchSpy).toHaveBeenCalledWith(
        'http://localhost:8000/api/auth/favorites/TEST001/',
        expect.objectContaining({
          method: 'DELETE',
        }),
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('checkFavorite', () => {
    it('should call check favorite endpoint with program ID', async () => {
      const programId = 'TEST001';
      const mockResponse = { is_favorite: true };
      fetchSpy.mockReturnValue(mockFetchResponse(mockResponse));

      const result = await apiService.checkFavorite(programId);

      expect(fetchSpy).toHaveBeenCalledWith(
        'http://localhost:8000/api/auth/favorites/TEST001/check/',
        expect.objectContaining({
          method: 'GET',
        }),
      );
      expect(result).toEqual(mockResponse);
    });
  });
});
