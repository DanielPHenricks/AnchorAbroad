// frontend/src/pages/Map.jsx
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Box } from '@mui/material';
import { MarkerManager } from '../components/marker';
import Sidebar from '../components/sidebar';
import apiService from '../services/api';

const MapPage = ({ mapCenter }) => {
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    apiService
      .getPrograms()
      .then((data) => setMarkers(data))
      .catch((error) => console.error('Error fetching markers:', error));
  }, []);

  const handleMarkerClick = (marker) => {
    setSelectedMarker(marker);
    setSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
    setSelectedMarker(null);
  };

  const center = mapCenter || [47.812, 8.4058];

  return (
    <Box sx={{ flexGrow: 1, width: '100%' }}>
      <MapContainer
        center={center}
        zoom={5}
        style={{ height: 'calc(100vh - 64px)', width: '100%' }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors &copy; CARTO"
          url="https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/{z}/{x}/{y}{r}.png"
        />
        <MarkerManager markers={markers} onMarkerClick={handleMarkerClick} />
      </MapContainer>

      <Sidebar open={sidebarOpen} onClose={handleSidebarClose} selectedMarker={selectedMarker} />
    </Box>
  );
};

export default MapPage;
