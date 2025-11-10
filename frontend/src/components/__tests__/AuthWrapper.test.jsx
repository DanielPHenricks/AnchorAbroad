/**
 * AuthWrapper Component Tests
 * Tests authentication state management and conditional rendering
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AuthWrapper from '../AuthWrapper';
import apiService from '../../services/api';
import { createMockUser } from '../../utils/testUtils';

// Mock the API service
jest.mock('../../services/api');

// Mock child components
jest.mock('../navbar', () => {
  return function MockNavbar({ user, onLogout }) {
    return (
      <div data-testid="navbar">
        {user ? (
          <>
            <span>User: {user.username}</span>
            <button onClick={onLogout}>Logout</button>
          </>
        ) : (
          <span>Not logged in</span>
        )}
      </div>
    );
  };
});

jest.mock('../login', () => {
  // Import inside the mock factory
  const { createMockUser: mockCreateMockUser } = require('../../utils/testUtils');

  return function MockLogin({ onSuccess, onSwitchToSignup }) {
    return (
      <div data-testid="login">
        <button onClick={() => onSuccess(mockCreateMockUser())}>Login Success</button>
        <button onClick={onSwitchToSignup}>Switch to Signup</button>
      </div>
    );
  };
});

jest.mock('../signup', () => {
  // Import inside the mock factory
  const { createMockUser: mockCreateMockUser } = require('../../utils/testUtils');

  return function MockSignup({ onSuccess, onSwitchToLogin }) {
    return (
      <div data-testid="signup">
        <button onClick={() => onSuccess(mockCreateMockUser())}>Signup Success</button>
        <button onClick={onSwitchToLogin}>Switch to Login</button>
      </div>
    );
  };
});

describe('AuthWrapper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Loading State', () => {
    it('should show loading state while checking authentication', () => {
      apiService.getUserProfile.mockImplementation(
        () => new Promise(() => {}), // Never resolves
      );

      render(
        <AuthWrapper>
          <div>Protected Content</div>
        </AuthWrapper>,
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Authenticated User', () => {
    it('should show children when user is authenticated', async () => {
      const mockUser = createMockUser();
      apiService.getUserProfile.mockResolvedValue({ user: mockUser });

      render(
        <AuthWrapper>
          <div data-testid="protected-content">Protected Content</div>
        </AuthWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      });

      expect(screen.getByText(`User: ${mockUser.username}`)).toBeInTheDocument();
      expect(screen.queryByTestId('login')).not.toBeInTheDocument();
      expect(screen.queryByTestId('signup')).not.toBeInTheDocument();
    });

    it('should show navbar with user info', async () => {
      const mockUser = createMockUser({ username: 'johndoe' });
      apiService.getUserProfile.mockResolvedValue({ user: mockUser });

      render(
        <AuthWrapper>
          <div>Protected Content</div>
        </AuthWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText('User: johndoe')).toBeInTheDocument();
      });
    });

    it('should handle logout successfully', async () => {
      const user = userEvent.setup();
      const mockUser = createMockUser();
      apiService.getUserProfile.mockResolvedValue({ user: mockUser });
      apiService.logout.mockResolvedValue({ message: 'Logged out' });

      render(
        <AuthWrapper>
          <div data-testid="protected-content">Protected Content</div>
        </AuthWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      });

      const logoutButton = screen.getByText('Logout');
      await user.click(logoutButton);

      await waitFor(() => {
        expect(screen.getByTestId('login')).toBeInTheDocument();
        expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      });

      expect(apiService.logout).toHaveBeenCalledTimes(1);
    });

    it('should handle logout failure gracefully', async () => {
      const user = userEvent.setup();
      const mockUser = createMockUser();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      apiService.getUserProfile.mockResolvedValue({ user: mockUser });
      apiService.logout.mockRejectedValue(new Error('Logout failed'));

      render(
        <AuthWrapper>
          <div data-testid="protected-content">Protected Content</div>
        </AuthWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      });

      const logoutButton = screen.getByText('Logout');
      await user.click(logoutButton);

      await waitFor(() => {
        expect(screen.getByTestId('login')).toBeInTheDocument();
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith('Logout failed:', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Unauthenticated User', () => {
    it('should show login form when user is not authenticated', async () => {
      apiService.getUserProfile.mockRejectedValue(new Error('Not authenticated'));

      render(
        <AuthWrapper>
          <div data-testid="protected-content">Protected Content</div>
        </AuthWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('login')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(screen.queryByTestId('signup')).not.toBeInTheDocument();
    });

    it('should not show children when user is not authenticated', async () => {
      apiService.getUserProfile.mockRejectedValue(new Error('Not authenticated'));

      render(
        <AuthWrapper>
          <div data-testid="protected-content">Protected Content</div>
        </AuthWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('login')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
  });

  describe('Authentication Mode Switching', () => {
    it('should switch from login to signup', async () => {
      const user = userEvent.setup();
      apiService.getUserProfile.mockRejectedValue(new Error('Not authenticated'));

      render(
        <AuthWrapper>
          <div>Protected Content</div>
        </AuthWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('login')).toBeInTheDocument();
      });

      const switchButton = screen.getByText('Switch to Signup');
      await user.click(switchButton);

      expect(screen.getByTestId('signup')).toBeInTheDocument();
      expect(screen.queryByTestId('login')).not.toBeInTheDocument();
    });

    it('should switch from signup to login', async () => {
      const user = userEvent.setup();
      apiService.getUserProfile.mockRejectedValue(new Error('Not authenticated'));

      render(
        <AuthWrapper>
          <div>Protected Content</div>
        </AuthWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('login')).toBeInTheDocument();
      });

      // Switch to signup
      await user.click(screen.getByText('Switch to Signup'));

      expect(screen.getByTestId('signup')).toBeInTheDocument();

      // Switch back to login
      await user.click(screen.getByText('Switch to Login'));

      expect(screen.getByTestId('login')).toBeInTheDocument();
      expect(screen.queryByTestId('signup')).not.toBeInTheDocument();
    });
  });

  describe('Authentication Success', () => {
    it('should show protected content after successful login', async () => {
      const user = userEvent.setup();
      apiService.getUserProfile.mockRejectedValue(new Error('Not authenticated'));

      render(
        <AuthWrapper>
          <div data-testid="protected-content">Protected Content</div>
        </AuthWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('login')).toBeInTheDocument();
      });

      const loginButton = screen.getByText('Login Success');
      await user.click(loginButton);

      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('login')).not.toBeInTheDocument();
    });

    it('should show protected content after successful signup', async () => {
      const user = userEvent.setup();
      apiService.getUserProfile.mockRejectedValue(new Error('Not authenticated'));

      render(
        <AuthWrapper>
          <div data-testid="protected-content">Protected Content</div>
        </AuthWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('login')).toBeInTheDocument();
      });

      // Switch to signup
      await user.click(screen.getByText('Switch to Signup'));

      const signupButton = screen.getByText('Signup Success');
      await user.click(signupButton);

      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('signup')).not.toBeInTheDocument();
    });

    it('should update navbar with user info after authentication', async () => {
      const user = userEvent.setup();
      apiService.getUserProfile.mockRejectedValue(new Error('Not authenticated'));

      render(
        <AuthWrapper>
          <div>Protected Content</div>
        </AuthWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('login')).toBeInTheDocument();
      });

      expect(screen.getByText('Not logged in')).toBeInTheDocument();

      const loginButton = screen.getByText('Login Success');
      await user.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText('User: testuser')).toBeInTheDocument();
      });
    });
  });

  describe('Navbar Integration', () => {
    it('should always render navbar', async () => {
      apiService.getUserProfile.mockRejectedValue(new Error('Not authenticated'));

      render(
        <AuthWrapper>
          <div>Protected Content</div>
        </AuthWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('navbar')).toBeInTheDocument();
      });
    });

    it('should pass user prop to navbar when authenticated', async () => {
      const mockUser = createMockUser({ username: 'johndoe' });
      apiService.getUserProfile.mockResolvedValue({ user: mockUser });

      render(
        <AuthWrapper>
          <div>Protected Content</div>
        </AuthWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText('User: johndoe')).toBeInTheDocument();
      });
    });

    it('should pass null user prop to navbar when not authenticated', async () => {
      apiService.getUserProfile.mockRejectedValue(new Error('Not authenticated'));

      render(
        <AuthWrapper>
          <div>Protected Content</div>
        </AuthWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText('Not logged in')).toBeInTheDocument();
      });
    });
  });
});
