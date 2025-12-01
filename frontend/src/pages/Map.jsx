// frontend/src/pages/Map.jsx
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Box, Autocomplete, TextField } from '@mui/material';
import { MarkerManager } from '../components/marker';
import Sidebar from '../components/sidebar';
import apiService from '../services/api';

// Component to handle map view changes
function MapController({ location }) {
  const map = useMap();

  useEffect(() => {
    if (location) {
      map.flyTo(location, 10, {
        duration: 1.5
      });
    }
  }, [location, map]);

  return null;
}

const MapPage = ({ mapCenter }) => {
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [markers, setMarkers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [continentFilter, setContinentFilter] = useState('All');
  const [flyToLocation, setFlyToLocation] = useState(null);

  // Fetch markers from API
  useEffect(() => {
    apiService
      .getPrograms()
      .then((data) => {
        console.log("Fetched programs:", data); // Debug log
        setMarkers(data);
      })
      .catch((error) => console.error('Error fetching markers:', error));
  }, []);

  const handleMarkerClick = (marker) => {
    setSelectedMarker(marker);
    setSidebarOpen(true);
    // Also zoom to marker when clicked directly
    setFlyToLocation([marker.latitude, marker.longitude]);
  };

  const handleProgramSelect = (program) => {
    if (program) {
      setSelectedMarker(program);
      setSidebarOpen(true);
      setFlyToLocation([program.latitude, program.longitude]);
    }
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
    setSelectedMarker(null);
  };

  const center = mapCenter || [47.812, 8.4058];

  // Filter markers based on search and continent
  const filteredMarkers = markers.filter((marker) => {
    const name = marker.program_details?.name || marker.name || '';
    const matchesName = name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesContinent = continentFilter === 'All' || marker.continent === continentFilter;
    return matchesName && matchesContinent;
  });

  return (
    <Box sx={{ flexGrow: 1, width: '100%', position: 'relative' }}>
      {/* Search + Continent Filter */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          backgroundColor: 'white',
          borderRadius: 2,
          padding: 1,
          zIndex: 1000,
          display: 'flex',
          gap: 1,
          alignItems: 'center',
          boxShadow: 3,
        }}
      >
        <Autocomplete
          freeSolo
          options={markers}
          getOptionLabel={(option) => {
            // Handle both object option and string input (from freeSolo)
            if (typeof option === 'string') return option;
            return option.program_details?.name || option.name || '';
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Search program..."
              variant="standard"
              InputProps={{
                ...params.InputProps,
                disableUnderline: true,
                style: { padding: '4px 8px' }
              }}
            />
          )}
          onChange={(event, newValue) => {
            if (newValue && typeof newValue !== 'string') {
              handleProgramSelect(newValue);
            }
          }}
          onInputChange={(event, newInputValue) => {
            setSearchTerm(newInputValue);
          }}
          sx={{ width: 300 }}
        />

        <select
          value={continentFilter}
          onChange={(e) => setContinentFilter(e.target.value)}
          style={{
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            height: '100%'
          }}
        >
          <option value="All">All Continents</option>
          <option value="Africa">Africa</option>
          <option value="Asia">Asia</option>
          <option value="Europe">Europe</option>
          <option value="North America">North America</option>
          <option value="South America">South America</option>
          <option value="Australia">Australia</option>
          <option value="Oceania">Oceania</option>
        </select>
      </Box>

      {/* Map */}
      <MapContainer
        center={center}
        zoom={5}
        style={{ height: 'calc(100vh - 64px)', width: '100%' }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors &copy; CARTO"
          url="https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/{z}/{x}/{y}{r}.png"
        />
        <MapController location={flyToLocation} />
        <MarkerManager markers={filteredMarkers} onMarkerClick={handleMarkerClick} />
      </MapContainer>

      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={handleSidebarClose} selectedMarker={selectedMarker} />
    </Box>
  );
};

export default MapPage;
