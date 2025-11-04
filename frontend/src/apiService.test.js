/**
 * Tests for API service - focusing on key functionality
 * Simple tests for the core API methods
 */
import apiService from '../src/services/api';

// Mock fetch globally
global.fetch = jest.fn();

describe('ApiService', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('constructs correct API base URL', () => {
    expect(apiService.baseURL).toBe('http://localhost:8000/api');
  });

  test('getCsrfToken extracts token from cookies', () => {
    // Mock document.cookie
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: 'csrftoken=test-csrf-token; other=value',
    });

    const token = apiService.getCsrfToken();
    expect(token).toBe('test-csrf-token');
  });

  test('getCsrfToken returns null when no token in cookies', () => {
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: 'other=value; another=test',
    });

    const token = apiService.getCsrfToken();
    expect(token).toBeNull();
  });

  test('get method makes correct fetch call', async () => {
    const mockResponse = { success: true, data: [] };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await apiService.get('/test-endpoint');

    expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/test-endpoint', {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      method: 'GET',
    });
    expect(result).toEqual(mockResponse);
  });

  test('post method includes request body', async () => {
    const mockResponse = { success: true };
    const testData = { username: 'test', password: 'test123' };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    await apiService.post('/test-endpoint', testData);

    expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/test-endpoint', {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      method: 'POST',
      body: JSON.stringify(testData),
    });
  });

  test('throws error when response is not ok', async () => {
    const errorResponse = { message: 'Test error' };
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => errorResponse,
    });

    // Suppress expected console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    await expect(apiService.get('/test-endpoint')).rejects.toThrow('Test error');

    // Restore console.error
    consoleSpy.mockRestore();
  });

  test('login method calls correct endpoint', async () => {
    const mockResponse = { success: true, user: {} };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const credentials = { username: 'test', password: 'pass' };
    await apiService.login(credentials);

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/auth/login/',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    );
  });

  test('getPrograms method calls correct endpoint', async () => {
    const mockPrograms = [{ id: 1, name: 'Test Program' }];
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPrograms,
    });

    const result = await apiService.getPrograms();

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/programs/',
      expect.objectContaining({
        method: 'GET',
      }),
    );
    expect(result).toEqual(mockPrograms);
  });
});
