import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Alert, Paper } from '@mui/material';
import apiService from '../services/api';

/**
 * Alumni login component - standalone without context
 */
const AlumniLogin = ({ onSuccess, onSwitchToSignup }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  /**
   * Handle input field changes
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
   */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    return newErrors;
  };

  /**
   * Handle form submission
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
      const response = await apiService.alumniLogin(formData);
      console.log('Alumni login successful:', response);

      if (onSuccess) {
        onSuccess(response.alumni);
      }
    } catch (error) {
      console.error('Alumni login failed:', error);
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
        Alumni Login
      </Typography>

      <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
        Login to share your study abroad experience
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        {errors.general && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.general}
          </Alert>
        )}

        <TextField
          fullWidth
          name="email"
          label="Email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={!!errors.email}
          helperText={errors.email}
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
            mt: 2,
            color: 'secondary.contrastText',
            transition: 'all 0.2s',
            '&:hover': {
              backgroundColor: 'secondary.dark',
            },
          }}
        >
          {loading ? 'Logging in...' : 'Login as Alumni'}
        </Button>

        <Typography align="center" sx={{ mt: 2 }}>
          Don't have an account?{' '}
          <Button
            variant="contained"
            onClick={onSwitchToSignup}
            sx={{
              color: 'secondary.contrastText',
              backgroundColor: 'secondary.main',
              textTransform: 'none',
              borderRadius: 12,
            }}
          >
            Sign up
          </Button>
        </Typography>
      </Box>
    </Paper>
  );
};

export default AlumniLogin;
