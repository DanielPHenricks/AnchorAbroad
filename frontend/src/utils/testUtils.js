/**
 * Test utilities for setting up test environment
 */
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { TextEncoder } from 'util';
global.TextEncoder = TextEncoder;

/**
 * Custom render function that wraps components with necessary providers
 */
export const renderWithRouter = (ui, { route = '/', ...renderOptions } = {}) => {
  window.history.pushState({}, 'Test page', route);

  return render(<BrowserRouter>{ui}</BrowserRouter>, renderOptions);
};

/**
 * Mock fetch response helper
 */
export const mockFetchResponse = (data, ok = true, status = 200) => {
  return Promise.resolve({
    ok,
    status,
    json: async () => data,
  });
};

/**
 * Mock fetch error helper
 */
export const mockFetchError = (message = 'Network error') => {
  return Promise.reject(new Error(message));
};

/**
 * Create mock user object
 */
export const createMockUser = (overrides = {}) => ({
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  first_name: 'Test',
  last_name: 'User',
  ...overrides,
});

/**
 * Create mock program object
 */
export const createMockProgram = (overrides = {}) => ({
  program_id: 'TEST001',
  name: 'Test Study Abroad Program',
  academic_calendar: 'Semester',
  program_type: 'Exchange',
  minimum_gpa: 3.0,
  language_prerequisite: 'None',
  latitude: 40.7128,
  longitude: -74.006,
  ...overrides,
});

/**
 * Setup cookie helper for tests
 */
export const setCookie = (name, value) => {
  document.cookie = `${name}=${value}; path=/`;
};

/**
 * Clear all cookies helper
 */
export const clearCookies = () => {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const eqPos = cookie.indexOf('=');
    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
  }
};
