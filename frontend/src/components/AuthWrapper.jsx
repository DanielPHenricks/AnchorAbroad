import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, AppBar, Toolbar } from '@mui/material';
import Login from './Login';
import Signup from './Signup';
import apiService from '../services/api';

/**
 * Authentication wrapper component that manages login/signup flow
 * @param {React.Component} children - Components to render when authenticated
 */
const AuthWrapper = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [loading, setLoading] = useState(true);

  /**
   * Check if user is already authenticated on component mount
   */
  useEffect(() => {
    checkAuthStatus();
  }, []);

  /**
   * Check current authentication status
   */
  const checkAuthStatus = async () => {
    try {
      const response = await apiService.getUserProfile();
      setUser(response.user);
    } catch (error) {
      console.log('Not authenticated');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle successful authentication (login or signup)
   * @param {Object} userData 
   */
  const handleAuthSuccess = (userData) => {
    setUser(userData);
  };

  /**
   * Handle logout
   */
  const handleLogout = async () => {
    try {
      await apiService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear user state even if API call fails
      setUser(null);
    }
  };

  /**
   * Switch between login and signup modes
   */
  const switchAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'signup' : 'login');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  // If user is authenticated, show the main application
  if (user) {
    return (
      <Box>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Welcome, {user.first_name || user.username}!
            </Typography>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </Toolbar>
        </AppBar>
        {children}
      </Box>
    );
  }

  // If user is not authenticated, show login/signup forms
  return (
    <Box>
      {authMode === 'login' ? (
        <Login 
          onSuccess={handleAuthSuccess}
          onSwitchToSignup={switchAuthMode}
        />
      ) : (
        <Signup 
          onSuccess={handleAuthSuccess}
          onSwitchToLogin={switchAuthMode}
        />
      )}
    </Box>
  );
};

export default AuthWrapper;