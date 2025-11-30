import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Paper,
  Autocomplete,
} from '@mui/material';
import apiService from '../services/api';

/**
 * Alumni signup component - standalone without context
 */
const AlumniSignup = ({ onSuccess, onSwitchToLogin }) => {
  const [programs, setPrograms] = useState([]);
  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    program_id: '',
    graduation_year: new Date().getFullYear(),
    study_abroad_term: '',
    bio: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Load programs on mount
  useEffect(() => {
    const loadPrograms = async () => {
      try {
        const programsData = await apiService.getPrograms();
        setPrograms(programsData);
      } catch (error) {
        console.error('Failed to load programs:', error);
      } finally {
        setLoadingPrograms(false);
      }
    };

    loadPrograms();
  }, []);

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
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.password_confirm) {
      newErrors.password_confirm = 'Passwords do not match';
    }

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    if (!formData.program_id) {
      newErrors.program_id = 'Please select a program';
    }

    if (!formData.graduation_year || formData.graduation_year < 1950 || formData.graduation_year > new Date().getFullYear() + 10) {
      newErrors.graduation_year = 'Please enter a valid graduation year';
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
      const response = await apiService.alumniSignup(formData);
      console.log('Alumni signup successful:', response);

      if (onSuccess) {
        onSuccess(response.alumni);
      }
    } catch (error) {
      console.error('Alumni signup failed:', error);
      setErrors({
        general: error.message || 'Signup failed. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 500, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Alumni Signup
      </Typography>

      <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
        Create an account to share your study abroad experience
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        {errors.general && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.general}
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            name="first_name"
            label="First Name"
            value={formData.first_name}
            onChange={handleChange}
            error={!!errors.first_name}
            helperText={errors.first_name}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            name="last_name"
            label="Last Name"
            value={formData.last_name}
            onChange={handleChange}
            error={!!errors.last_name}
            helperText={errors.last_name}
            margin="normal"
            required
          />
        </Box>

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

        <TextField
          fullWidth
          name="password_confirm"
          label="Confirm Password"
          type="password"
          value={formData.password_confirm}
          onChange={handleChange}
          error={!!errors.password_confirm}
          helperText={errors.password_confirm}
          margin="normal"
          required
        />

        <Autocomplete
          fullWidth
          options={programs}
          getOptionLabel={(option) => option.program_details?.name || ''}
          value={programs.find(p => p.program_id === formData.program_id) || null}
          onChange={(event, newValue) => {
            handleChange({
              target: {
                name: 'program_id',
                value: newValue ? newValue.program_id : '',
              },
            });
          }}
          loading={loadingPrograms}
          disabled={loadingPrograms}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Study Abroad Program"
              margin="normal"
              required
              error={!!errors.program_id}
              helperText={errors.program_id || 'Search or select a program'}
              placeholder="Type to search programs..."
            />
          )}
          isOptionEqualToValue={(option, value) => option.program_id === value.program_id}
          noOptionsText={loadingPrograms ? "Loading programs..." : "No programs found"}
        />

        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            name="graduation_year"
            label="Graduation Year"
            type="number"
            value={formData.graduation_year}
            onChange={handleChange}
            error={!!errors.graduation_year}
            helperText={errors.graduation_year}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            name="study_abroad_term"
            label="Study Abroad Term"
            placeholder="e.g., Fall 2023"
            value={formData.study_abroad_term}
            onChange={handleChange}
            error={!!errors.study_abroad_term}
            helperText={errors.study_abroad_term}
            margin="normal"
          />
        </Box>

        <TextField
          fullWidth
          name="bio"
          label="Bio (Optional)"
          multiline
          rows={3}
          value={formData.bio}
          onChange={handleChange}
          error={!!errors.bio}
          helperText={errors.bio || 'Describe your study abroad experience briefly, or tell everyone a little bit about yourself.'}
          margin="normal"
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={loading || loadingPrograms}
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
          {loading ? 'Creating Account...' : 'Sign Up'}
        </Button>

        <Typography align="center" sx={{ mt: 2 }}>
          Already have an account?{' '}
          <Button
            variant="contained"
            onClick={onSwitchToLogin}
            sx={{
              color: 'secondary.contrastText',
              backgroundColor: 'secondary.main',
              textTransform: 'none',
              borderRadius: 12,
            }}
          >
            Login
          </Button>
        </Typography>
      </Box>
    </Paper>
  );
};

export default AlumniSignup;
