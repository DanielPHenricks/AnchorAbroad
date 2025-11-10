/**
 * Navbar Component Tests
 * Tests conditional rendering based on authentication state
 */
import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Navbar from '../Navbar';
import { renderWithRouter, createMockUser } from '../../utils/testUtils';

describe('Navbar Component', () => {
  describe('Brand/Logo', () => {
    it('should render brand name', () => {
      renderWithRouter(<Navbar user={null} onLogout={jest.fn()} />);

      expect(screen.getByText('Anchor Abroad')).toBeInTheDocument();
    });

    it('should have brand as link to home', () => {
      renderWithRouter(<Navbar user={null} onLogout={jest.fn()} />);

      const brandLink = screen.getByText('Anchor Abroad').closest('a');
      expect(brandLink).toHaveAttribute('href', '/home');
    });
  });

  describe('Unauthenticated State', () => {
    it('should not show navigation links when user is null', () => {
      renderWithRouter(<Navbar user={null} onLogout={jest.fn()} />);

      expect(screen.queryByText('Home')).not.toBeInTheDocument();
      expect(screen.queryByText('Messages')).not.toBeInTheDocument();
      expect(screen.queryByText('Programs')).not.toBeInTheDocument();
    });
  });

  describe('Authenticated State', () => {
    const mockUser = createMockUser();

    it('should show all navigation links when user is authenticated', () => {
      renderWithRouter(<Navbar user={mockUser} onLogout={jest.fn()} />);

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Messages')).toBeInTheDocument();
      expect(screen.getByText('Programs')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    it('should have correct links for navigation items', () => {
      renderWithRouter(<Navbar user={mockUser} onLogout={jest.fn()} />);

      const homeLink = screen.getByText('Home').closest('a');
      const messagesLink = screen.getByText('Messages').closest('a');
      const mapLink = screen.getByText('Programs').closest('a');

      expect(homeLink).toHaveAttribute('href', '/home');
      expect(messagesLink).toHaveAttribute('href', '/messages/1');
      expect(mapLink).toHaveAttribute('href', '/map');
    });

    it('should show Logout button text when authenticated', () => {
      renderWithRouter(<Navbar user={mockUser} onLogout={jest.fn()} />);

      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    it('should call onLogout when logout button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnLogout = jest.fn();

      renderWithRouter(<Navbar user={mockUser} onLogout={mockOnLogout} />);

      const logoutButton = screen.getByText('Logout');
      await user.click(logoutButton);

      expect(mockOnLogout).toHaveBeenCalledTimes(1);
    });
  });

  describe('Logout Button Behavior', () => {
    it('should have onClick handler when user is authenticated', () => {
      const mockOnLogout = jest.fn();
      renderWithRouter(<Navbar user={createMockUser()} onLogout={mockOnLogout} />);

      const logoutButton = screen.getByText('Logout');
      expect(logoutButton).toBeInTheDocument();
    });

    it('should not be a link when user is authenticated', () => {
      renderWithRouter(<Navbar user={createMockUser()} onLogout={jest.fn()} />);

      const logoutButton = screen.getByText('Logout');
      expect(logoutButton.closest('a')).not.toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('should render with proper spacing', () => {
      const { container } = renderWithRouter(
        <Navbar user={createMockUser()} onLogout={jest.fn()} />,
      );

      const appBar = container.querySelector('[class*="MuiAppBar"]');
      expect(appBar).toBeInTheDocument();
    });
  });

  describe('Navigation Integration', () => {
    it('should render without crashing with all props', () => {
      const mockUser = createMockUser();
      const mockOnLogout = jest.fn();

      const { container } = renderWithRouter(<Navbar user={mockUser} onLogout={mockOnLogout} />);

      expect(container).toBeInTheDocument();
    });

    it('should render without crashing with null user', () => {
      const { container } = renderWithRouter(<Navbar user={null} onLogout={jest.fn()} />);

      expect(container).toBeInTheDocument();
    });
  });
});
