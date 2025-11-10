/**
 * Login Component Tests
 * Tests form validation, submission, and error handling
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from '../login';
import apiService from '../../services/api';
import { createMockUser } from '../../utils/testUtils';
import { TextEncoder } from 'util';
jest.mock('../../services/api');

describe('Login Component', () => {
  const mockOnSuccess = jest.fn();
  const mockOnSwitchToSignup = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render login form with all fields', () => {
      render(<Login onSuccess={mockOnSuccess} onSwitchToSignup={mockOnSwitchToSignup} />);

      expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
      expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    });

    it('should have required attributes on input fields', () => {
      render(<Login onSuccess={mockOnSuccess} onSwitchToSignup={mockOnSwitchToSignup} />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);

      expect(usernameInput).toBeRequired();
      expect(passwordInput).toBeRequired();
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('Form Input', () => {
    it('should update username field on change', async () => {
      const user = userEvent.setup();
      render(<Login onSuccess={mockOnSuccess} onSwitchToSignup={mockOnSwitchToSignup} />);

      const usernameInput = screen.getByLabelText(/username/i);
      await user.type(usernameInput, 'testuser');

      expect(usernameInput).toHaveValue('testuser');
    });

    it('should update password field on change', async () => {
      const user = userEvent.setup();
      render(<Login onSuccess={mockOnSuccess} onSwitchToSignup={mockOnSwitchToSignup} />);

      const passwordInput = screen.getByLabelText(/password/i);
      await user.type(passwordInput, 'password123');

      expect(passwordInput).toHaveValue('password123');
    });

    it('should mask password input', async () => {
      const user = userEvent.setup();
      render(<Login onSuccess={mockOnSuccess} onSwitchToSignup={mockOnSwitchToSignup} />);

      const passwordInput = screen.getByLabelText(/password/i);
      await user.type(passwordInput, 'secret');

      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('Form Validation', () => {
    it('should show error when username is empty', async () => {
      const user = userEvent.setup();
      render(<Login onSuccess={mockOnSuccess} onSwitchToSignup={mockOnSwitchToSignup} />);

      const submitButton = screen.getByRole('button', { name: /login/i });
      await user.click(submitButton);

      expect(await screen.findByText('Username is required')).toBeInTheDocument();
      expect(apiService.login).not.toHaveBeenCalled();
    });

    it('should show error when password is empty', async () => {
      const user = userEvent.setup();
      render(<Login onSuccess={mockOnSuccess} onSwitchToSignup={mockOnSwitchToSignup} />);

      const usernameInput = screen.getByLabelText(/username/i);
      await user.type(usernameInput, 'testuser');

      const submitButton = screen.getByRole('button', { name: /login/i });
      await user.click(submitButton);

      expect(await screen.findByText('Password is required')).toBeInTheDocument();
      expect(apiService.login).not.toHaveBeenCalled();
    });

    it('should show error when username is only whitespace', async () => {
      const user = userEvent.setup();
      render(<Login onSuccess={mockOnSuccess} onSwitchToSignup={mockOnSwitchToSignup} />);

      const usernameInput = screen.getByLabelText(/username/i);
      await user.type(usernameInput, '   ');

      const submitButton = screen.getByRole('button', { name: /login/i });
      await user.click(submitButton);

      expect(await screen.findByText('Username is required')).toBeInTheDocument();
      expect(apiService.login).not.toHaveBeenCalled();
    });

    it('should clear error when user starts typing', async () => {
      const user = userEvent.setup();
      render(<Login onSuccess={mockOnSuccess} onSwitchToSignup={mockOnSwitchToSignup} />);

      // Trigger validation error
      const submitButton = screen.getByRole('button', { name: /login/i });
      await user.click(submitButton);

      expect(await screen.findByText('Username is required')).toBeInTheDocument();

      // Start typing
      const usernameInput = screen.getByLabelText(/username/i);
      await user.type(usernameInput, 'test');

      expect(screen.queryByText('Username is required')).not.toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should call login API with correct credentials', async () => {
      const user = userEvent.setup();
      const mockUser = createMockUser();
      apiService.login.mockResolvedValue({ user: mockUser });

      render(<Login onSuccess={mockOnSuccess} onSwitchToSignup={mockOnSwitchToSignup} />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: /login/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(apiService.login).toHaveBeenCalledWith({
          username: 'testuser',
          password: 'password123',
        });
      });
    });

    it('should call onSuccess callback with user data on successful login', async () => {
      const user = userEvent.setup();
      const mockUser = createMockUser({ username: 'johndoe' });
      apiService.login.mockResolvedValue({ user: mockUser });

      render(<Login onSuccess={mockOnSuccess} onSwitchToSignup={mockOnSwitchToSignup} />);

      await user.type(screen.getByLabelText(/username/i), 'johndoe');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /login/i }));

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith(mockUser);
      });
    });

    it('should disable submit button while loading', async () => {
      const user = userEvent.setup();
      apiService.login.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      render(<Login onSuccess={mockOnSuccess} onSwitchToSignup={mockOnSwitchToSignup} />);

      await user.type(screen.getByLabelText(/username/i), 'testuser');
      await user.type(screen.getByLabelText(/password/i), 'password123');

      const submitButton = screen.getByRole('button', { name: /login/i });
      await user.click(submitButton);

      expect(submitButton).toBeDisabled();
      expect(screen.getByText(/logging in/i)).toBeInTheDocument();
    });

    it('should show loading text while submitting', async () => {
      const user = userEvent.setup();
      apiService.login.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      render(<Login onSuccess={mockOnSuccess} onSwitchToSignup={mockOnSwitchToSignup} />);

      await user.type(screen.getByLabelText(/username/i), 'testuser');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /login/i }));

      expect(screen.getByRole('button', { name: /logging in/i })).toBeInTheDocument();
    });

    it('should handle login failure with error message', async () => {
      const user = userEvent.setup();
      apiService.login.mockRejectedValue(new Error('Invalid credentials'));

      render(<Login onSuccess={mockOnSuccess} onSwitchToSignup={mockOnSwitchToSignup} />);

      await user.type(screen.getByLabelText(/username/i), 'testuser');
      await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
      await user.click(screen.getByRole('button', { name: /login/i }));

      expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });

    it('should show generic error message when API error has no message', async () => {
      const user = userEvent.setup();
      apiService.login.mockRejectedValue(new Error());

      render(<Login onSuccess={mockOnSuccess} onSwitchToSignup={mockOnSwitchToSignup} />);

      await user.type(screen.getByLabelText(/username/i), 'testuser');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /login/i }));

      expect(
        await screen.findByText('Login failed. Please try again.')
      ).toBeInTheDocument();
    });

    it('should re-enable submit button after failed login', async () => {
      const user = userEvent.setup();
      apiService.login.mockRejectedValue(new Error('Invalid credentials'));

      render(<Login onSuccess={mockOnSuccess} onSwitchToSignup={mockOnSwitchToSignup} />);

      await user.type(screen.getByLabelText(/username/i), 'testuser');
      await user.type(screen.getByLabelText(/password/i), 'wrongpassword');

      const submitButton = screen.getByRole('button', { name: /login/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });

      expect(submitButton).not.toBeDisabled();
      expect(screen.getByRole('button', { name: /^login$/i })).toBeInTheDocument();
    });

    it('should clear errors before new submission', async () => {
      const user = userEvent.setup();
      apiService.login.mockRejectedValueOnce(new Error('First error'));
      apiService.login.mockResolvedValueOnce({ user: createMockUser() });

      render(<Login onSuccess={mockOnSuccess} onSwitchToSignup={mockOnSwitchToSignup} />);

      await user.type(screen.getByLabelText(/username/i), 'testuser');
      await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
      await user.click(screen.getByRole('button', { name: /login/i }));

      expect(await screen.findByText('First error')).toBeInTheDocument();

      // Clear password and try again
      const passwordInput = screen.getByLabelText(/password/i);
      await user.clear(passwordInput);
      await user.type(passwordInput, 'correctpassword');
      await user.click(screen.getByRole('button', { name: /login/i }));

      await waitFor(() => {
        expect(screen.queryByText('First error')).not.toBeInTheDocument();
      });
    });
  });

  describe('Switch to Signup', () => {
    it('should call onSwitchToSignup when signup button is clicked', async () => {
      const user = userEvent.setup();
      render(<Login onSuccess={mockOnSuccess} onSwitchToSignup={mockOnSwitchToSignup} />);

      const signupButton = screen.getByRole('button', { name: /sign up/i });
      await user.click(signupButton);

      expect(mockOnSwitchToSignup).toHaveBeenCalledTimes(1);
    });
  });

  describe('Console Logging', () => {
    it('should log success message on successful login', async () => {
      const user = userEvent.setup();
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      const mockUser = createMockUser();
      const mockResponse = { user: mockUser };

      apiService.login.mockResolvedValue(mockResponse);

      render(<Login onSuccess={mockOnSuccess} onSwitchToSignup={mockOnSwitchToSignup} />);

      await user.type(screen.getByLabelText(/username/i), 'testuser');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /login/i }));

      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith('Login successful:', mockResponse);
      });

      consoleLogSpy.mockRestore();
    });

    it('should log error message on failed login', async () => {
      const user = userEvent.setup();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Login failed');

      apiService.login.mockRejectedValue(error);

      render(<Login onSuccess={mockOnSuccess} onSwitchToSignup={mockOnSwitchToSignup} />);

      await user.type(screen.getByLabelText(/username/i), 'testuser');
      await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
      await user.click(screen.getByRole('button', { name: /login/i }));

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Login failed:', error);
      });

      consoleErrorSpy.mockRestore();
    });
  });
});
