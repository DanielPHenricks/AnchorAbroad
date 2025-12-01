import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Tab, Tabs } from '@mui/material';
import AlumniLogin from '../components/AlumniLogin';
import AlumniSignup from '../components/AlumniSignup';

/**
 * Alumni authentication page with login and signup tabs
 */
const AlumniAuth = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleLoginSuccess = (alumni) => {
    console.log('Alumni logged in:', alumni);
    // Navigate to alumni dashboard or home page
    navigate('/home');
    window.location.reload();
  };

  const handleSignupSuccess = (alumni) => {
    console.log('Alumni signed up:', alumni);
    // Navigate to alumni dashboard or home page
    navigate('/home');
    window.location.reload();
  };

  const switchToSignup = () => {
    setActiveTab(1);
  };

  const switchToLogin = () => {
    setActiveTab(0);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          centered
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '1.1rem',
              fontWeight: 500,
            },
          }}
        >
          <Tab label="Login" />
          <Tab label="Sign Up" />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <AlumniLogin onSuccess={handleLoginSuccess} onSwitchToSignup={switchToSignup} />
      )}

      {activeTab === 1 && (
        <AlumniSignup onSuccess={handleSignupSuccess} onSwitchToLogin={switchToLogin} />
      )}
    </Container>
  );
};

export default AlumniAuth;
