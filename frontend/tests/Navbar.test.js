/**
 * Tests for Navbar component - 80/20 approach
 * Testing core functionality with minimal setup
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '../src/components/Navbar';

// Helper function to render component with router context
const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Navbar Component', () => {
  test('renders the app title', () => {
    renderWithRouter(<Navbar user={null} onLogout={() => {}} />);
    expect(screen.getByText('Anchor Abroad')).toBeInTheDocument();
  });

  test('shows login button when user is not logged in', () => {
    renderWithRouter(<Navbar user={null} onLogout={() => {}} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('shows navigation buttons when user is logged in', () => {
    const mockUser = { username: 'testuser' };
    renderWithRouter(<Navbar user={mockUser} onLogout={() => {}} />);

    // Check for navigation buttons
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Favorites')).toBeInTheDocument();
    expect(screen.getByText('Messages')).toBeInTheDocument();
    expect(screen.getByText('Map')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  test('calls onLogout when logout button is clicked', () => {
    const mockOnLogout = jest.fn();
    const mockUser = { username: 'testuser' };

    renderWithRouter(<Navbar user={mockUser} onLogout={mockOnLogout} />);

    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    expect(mockOnLogout).toHaveBeenCalledTimes(1);
  });

  test('does not show navigation buttons when user is null', () => {
    renderWithRouter(<Navbar user={null} onLogout={() => {}} />);

    // These should not be present when not logged in
    expect(screen.queryByText('Home')).not.toBeInTheDocument();
    expect(screen.queryByText('Favorites')).not.toBeInTheDocument();
    expect(screen.queryByText('Messages')).not.toBeInTheDocument();
    expect(screen.queryByText('Map')).not.toBeInTheDocument();
  });
});
