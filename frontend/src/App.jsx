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

function App() {
  return (
    <div className="App">
      <Router>
        <AuthWrapper>
          <Routes>
            <Route path="*" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/programs/:id" element={<ProgramDetail />} />
            <Route path="/messages/:id" element={<MessageDetail />} />
            <Route path="/map" element={<MapPage />} />
          </Routes>
        </AuthWrapper>
      </Router>
    </div>
  );
}

export default App;
