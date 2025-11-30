import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';

const AlumniContext = createContext();

export const useAlumni = () => {
  const context = useContext(AlumniContext);
  if (!context) {
    throw new Error('useAlumni must be used within an AlumniProvider');
  }
  return context;
};

export const AlumniProvider = ({ children }) => {
  const [alumni, setAlumni] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if alumni is logged in on mount
  useEffect(() => {
    checkAlumniAuth();
  }, []);

  const checkAlumniAuth = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAlumniProfile();
      setAlumni(response.alumni);
      setError(null);
    } catch (err) {
      setAlumni(null);
      setError(null); // Don't show error if just not logged in
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.alumniLogin(credentials);
      setAlumni(response.alumni);
      return { success: true, data: response };
    } catch (err) {
      setError(err.message || 'Login failed');
      return { success: false, error: err.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (alumniData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.alumniSignup(alumniData);
      setAlumni(response.alumni);
      return { success: true, data: response };
    } catch (err) {
      setError(err.message || 'Signup failed');
      return { success: false, error: err.message || 'Signup failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiService.alumniLogout();
      setAlumni(null);
      setError(null);
      return { success: true };
    } catch (err) {
      setError(err.message || 'Logout failed');
      return { success: false, error: err.message || 'Logout failed' };
    }
  };

  const value = {
    alumni,
    loading,
    error,
    login,
    signup,
    logout,
    isAuthenticated: !!alumni,
  };

  return <AlumniContext.Provider value={value}>{children}</AlumniContext.Provider>;
};

export default AlumniContext;
