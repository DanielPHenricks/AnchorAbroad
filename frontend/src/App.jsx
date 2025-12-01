/**
 * Names: Daniel, Jacob, Maharshi, Ben
 * Time: 1 hour
 */

import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthWrapper from './components/AuthWrapper';
import ProgramDetail from './pages/ProgramDetail';
import MapPage from './pages/Map';
import Profile from './pages/Profile';
import LandingPage from './pages/LandingPage';
import AlumniAuth from './pages/AlumniAuth';
import theme from './theme';
import { Box } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { AlumniProvider } from './contexts/AlumniContext';
import Chat from './pages/Chat';

function App() {
  return (
    <div className="App">
      <AlumniProvider>
        <ThemeProvider theme={theme}>
          {/* the box is for the navbar padding so that it doesn't obscure content*/}
          <Box sx={{ paddingTop: '64px' }}>
            <Router>
              <Routes>
                {/* Public route - Alumni auth page */}
                <Route
                  path="/alumni"
                  element={
                    <AuthWrapper requireAuth={false}>
                      <AlumniAuth />
                    </AuthWrapper>
                  }
                />

                {/* Public Landing Page */}
                <Route
                  path="/"
                  element={
                    <AuthWrapper requireAuth={false}>
                      <LandingPage />
                    </AuthWrapper>
                  }
                />

                {/* Protected routes - require student authentication */}
                <Route
                  path="*"
                  element={
                    <AuthWrapper requireAuth={true}>
                      <Routes>
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/programs/:id" element={<ProgramDetail />} />
                        <Route path="/map" element={<MapPage />} />
                        <Route path="/chat" element={<Chat />} />
                        {/* Redirect unknown protected routes to Profile */}
                        <Route path="*" element={<Profile />} />
                      </Routes>
                    </AuthWrapper>
                  }
                />
              </Routes>
            </Router>
          </Box>
        </ThemeProvider>
      </AlumniProvider>
    </div>
  );
}

export default App;
