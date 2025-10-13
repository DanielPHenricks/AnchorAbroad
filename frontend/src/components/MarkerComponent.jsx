import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import { Icon } from "leaflet";
import sidebar from "./sidebar";
import {
  Drawer,
  Toolbar,
  Typography,
  Divider,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import HomeIcon from "@mui/icons-material/Home";
import WorkIcon from "@mui/icons-material/Work";
import SettingsIcon from "@mui/icons-material/Settings";
import InfoIcon from "@mui/icons-material/Info";

const drawerWidth = 240;

const menuItems = [
  { text: "Program Home", icon: <HomeIcon /> },
  { text: "Classes", icon: <WorkIcon /> },
  { text: "Fees", icon: <SettingsIcon /> },
  { text: "Other Info", icon: <InfoIcon /> },
];

const MarkerManager = ({ markers, onMarkerClick }) => {
  return (
    <>
      {markers.map((marker, idx) => (
        <Marker
          key={idx}
          position={[marker.lat, marker.lng]}
          icon={new Icon({iconUrl: markerIconPng, iconSize: [25, 41], iconAnchor: [12, 41]})}
        >
          <Popup>
            <div style={{ minWidth: '200px' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>{marker.title}</h3>
              <p style={{ margin: '0 0 10px 0', fontSize: '14px', lineHeight: '1.4' }}>
                {marker.description}
              </p>
              <small style={{ color: '#666', fontSize: '12px' }}>
                Coordinates: {marker.lat.toFixed(4)}, {marker.lng.toFixed(4)}
              </small>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
};

export const PageTableMap = ({ mapCenter }) => {
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const markers = [
    {
      lat: 40.4167,
      lng: -3.7033,
      title: "Madrid",
      description:
        "The vibrant capital of Spain, known for its rich history, world-class museums like the Prado, and bustling nightlife. Home to the Royal Palace and beautiful Retiro Park.",
    },
    {
      lat: 48.8566,
      lng: 2.3522,
      title: "Paris",
      description:
        "The City of Light, famous for the Eiffel Tower, Louvre Museum, and charming cafés. A global center for art, fashion, and culture.",
    },
    {
      lat: 51.5074,
      lng: -0.1278,
      title: "London",
      description:
        "Historic capital of the UK, featuring iconic landmarks like Big Ben, Tower Bridge, and Buckingham Palace. A major financial and cultural hub.",
    },
    {
      lat: 52.52,
      lng: 13.405,
      title: "Berlin",
      description:
        "Germany's dynamic capital, rich in history from the Berlin Wall to modern innovation. Known for its vibrant arts scene and tech startups.",
    },
    {
      lat: 41.9028,
      lng: 12.4964,
      title: "Rome",
      description:
        "The Eternal City, home to ancient wonders like the Colosseum and Vatican City. A living museum of Western civilization and incredible cuisine.",
    },
  ];

  const center = mapCenter || [47.812, 8.4058];
  const zoom = 5;

  const handleMarkerClick = (marker) => {
    setSelectedMarker(marker);
    setSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
    setSelectedMarker(null);
  };

  return (
    <Box sx={{ display: "flex" }}>
      {/* Map */}
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100vh", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors &copy; CARTO'
          url="https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/{z}/{x}/{y}{r}.png"
        />
        <MarkerManager markers={markers} onMarkerClick={handleMarkerClick} />
      </MapContainer>
      {sidebarOpen && selectedMarker && (
      <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: "border-box",
          backgroundColor: "#f8f9fa",
          color: "#333",
        },
      }}
    >
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ ml: 1 }}>
            About the Program
          </Typography>
        </Toolbar>
      <Divider />
      <Box sx={{ overflow: "auto" }}>
        <List>
          {menuItems.map((item, index) => (
            <ListItem key={index} disablePadding>
              <ListItemButton>
                <ListItemIcon sx={{ color: "#555" }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        </Box>
      </Drawer>
      )}
    </Box>
  );
};
