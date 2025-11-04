/**
 * Basic App component tests
 * Simple smoke tests for the main application
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../src/App';

// Mock the API service to avoid network calls during tests
jest.mock('../src/services/api', () => ({
  getUserProfile: jest.fn().mockResolvedValue(null),
  getPrograms: jest.fn().mockResolvedValue([]),
}));

describe('App Component', () => {
  test('renders without crashing', () => {
    render(<App />);
    // App should render without throwing any errors
    expect(document.body).toBeInTheDocument();
  });

  test('renders Navbar component', () => {
    render(<App />);
    // Check if the main app title from Navbar is present
    expect(screen.getByText('Anchor Abroad')).toBeInTheDocument();
  });

  // Note: More complex routing tests would require additional setup
  // This covers the basic 80% with minimal effort
});
