/**
 * Names: Daniel, Jacob, Maharshi, Ben
 * Time: 2 hours
 */

import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import Navbar from './Navbar';
import Login from './Login';
import Signup from './Signup';
import apiService from '../services/api';

import { useAlumni } from '../contexts/AlumniContext';

/**
 * Authentication wrapper component
 * - Always shows Navbar
 * - Shows login/signup if not authenticated (only if requireAuth is true)
 * - Shows logout button if authenticated
 */
const AuthWrapper = ({ children, requireAuth = true }) => {
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [loading, setLoading] = useState(true);
  const { logout: alumniLogout } = useAlumni();

  // Check auth status on load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Call the unified profile endpoint that handles both students and alumni
      const response = await apiService.getUserProfile();

      // Check if response contains alumni or user data
      if (response.alumni) {
        setUser({ ...response.alumni, userType: 'alumni' });
      } else if (response.user) {
        setUser({ ...response.user, userType: 'student' });
      } else {
        setUser(null);
      }
    } catch (error) {
      // Not authenticated as either student or alumni
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
      // Always clear alumni state to prevent persistence issues
      await alumniLogout();

      // If user was a student, also call student logout
      if (user?.userType !== 'alumni') {
        await apiService.logout();
      }
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

      {!user && requireAuth && (
        <Box sx={{ width: '100%', margin: 0, padding: 0 }}>
          {authMode === 'login' ? (
            <Login onSuccess={handleAuthSuccess} onSwitchToSignup={switchAuthMode} />
          ) : (
            <Signup onSuccess={handleAuthSuccess} onSwitchToLogin={switchAuthMode} />
          )}
        </Box>
      )}

      {(user || !requireAuth) && <Box>{children}</Box>}
    </Box>
  );
};

export default AuthWrapper;