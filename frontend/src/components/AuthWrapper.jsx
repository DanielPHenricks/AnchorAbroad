/**
 * Names: Daniel, Jacob, Maharshi, Ben
 * Time: 2 hours
 */

import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import Navbar from './navbar';
import Login from './login';
import Signup from './signup';
import apiService from '../services/api';

/**
 * Authentication wrapper component
 * - Always shows Navbar
 * - Shows login/signup if not authenticated
 * - Shows logout button if authenticated
 */
const AuthWrapper = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [loading, setLoading] = useState(true);

  // Check auth status on load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await apiService.getUserProfile();
      setUser(response.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
    setUser(null);
  };

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

  return (
    <Box sx={{ width: '100%', margin: 0, padding: 0 }}>
      <Navbar user={user} onLogout={handleLogout} />

      {!user && (
        <Box sx={{ width: '100%', margin: 0, padding: 0 }}>
          {authMode === 'login' ? (
            <Login onSuccess={handleAuthSuccess} onSwitchToSignup={switchAuthMode} />
          ) : (
            <Signup onSuccess={handleAuthSuccess} onSwitchToLogin={switchAuthMode} />
          )}
        </Box>
      )}

      {user && <Box>{children}</Box>}
    </Box>
  );
};

export default AuthWrapper;
