/**
 * Names: Daniel, Jacob, Maharshi, Ben
 * Time: 1 hour
 */

import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthWrapper from './components/AuthWrapper';
import ProgramDetail from './pages/ProgramDetail';
import MessageDetail from './pages/MessageDetail';
import MapPage from './pages/Map';
import Home from './pages/Home';
import AlumniAuth from './pages/AlumniAuth';
import theme from './theme';
import { Box } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';

function App() {
  return (
    <div className="App">
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

              {/* Protected routes - require student authentication */}
              <Route
                path="*"
                element={
                  <AuthWrapper requireAuth={true}>
                    <Routes>
                      <Route path="/home" element={<Home />} />
                      <Route path="/programs/:id" element={<ProgramDetail />} />
                      <Route path="/messages/:id" element={<MessageDetail />} />
                      <Route path="/map" element={<MapPage />} />
                      <Route path="*" element={<Home />} />
                    </Routes>
                  </AuthWrapper>
                }
              />
            </Routes>
          </Router>
        </Box>
      </ThemeProvider>
    </div>
  );
}

export default App;
