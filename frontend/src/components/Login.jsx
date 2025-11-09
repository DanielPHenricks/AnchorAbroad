/**
 * Names: Daniel, Jacob, Maharshi, Ben
 * Time: 2 hours
 */

import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Alert, Paper } from '@mui/material';
import apiService from '../services/api';

/**
 * Login component for user authentication
 */
const Login = ({ onSuccess, onSwitchToSignup }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  /**
   * Handle input field changes
   * @param {Event} e
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  /**
   * Validate form data
   * @returns {Object} validation errors
   */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    return newErrors;
  };

  /**
   * Handle form submission
   * @param {Event} e
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await apiService.login(formData);
      console.log('Login successful:', response);

      if (onSuccess) {
        onSuccess(response.user);
      }
    } catch (error) {
      console.error('Login failed:', error);
      setErrors({
        general: error.message || 'Login failed. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Login
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        {errors.general && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.general}
          </Alert>
        )}

        <TextField
          fullWidth
          name="username"
          label="Username"
          value={formData.username}
          onChange={handleChange}
          error={!!errors.username}
          helperText={errors.username}
          margin="normal"
          required
        />

        <TextField
          fullWidth
          name="password"
          label="Password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          error={!!errors.password}
          helperText={errors.password}
          margin="normal"
          required
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={loading}
          sx={{
            borderRadius: 2,
            backgroundColor: 'secondary.main',
            textTransform: 'none',
            fontSize: '1rem',
            mb: 1,
            color: 'secondary.contrastText',
            transition: 'all 0.2s',
            '&:hover': {
              backgroundColor: 'secondary.dark',
            }
          }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </Button>

        <Typography align="center">
          Don't have an account?{' '}
          <Button variant="contained" onClick={onSwitchToSignup} sx={{ color: 'secondary.contrastText', backgroundColor: 'secondary.main', textTransform: 'none', borderRadius: 12 }}>
            Sign up
          </Button>
        </Typography>
      </Box>
    </Paper>
  );
};

export default Login;
