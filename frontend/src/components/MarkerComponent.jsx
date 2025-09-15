import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import { Icon } from 'leaflet';

const MarkerManager = () => {
  // Madrid coordinates as initial test marker
  const [markers, setMarkers] = useState([{ lat: 40.4167, lng: -3.7033 }]);

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setMarkers([...markers, { lat, lng }]);
    },
  });

  const handleMarkerClick = (index) => {
    setMarkers(markers.filter((_, i) => i !== index));
  };

  return (
    <>
      {markers.map((marker, idx) => (
        <Marker
          key={idx}
          position={[marker.lat, marker.lng]}
          icon={new Icon({iconUrl: markerIconPng, iconSize: [25, 41], iconAnchor: [12, 41]})}
          eventHandlers={{
            click: () => handleMarkerClick(idx),
          }}
          draggable={true} 
        />
      ))}
    </>
  );
};

export const PageTableMap = ({ mapCenter }) => {
  const center = mapCenter || [47.8120, 8.4058];
  const zoom = 5;

  return (
    <MapContainer center={center} zoom={zoom} style={{ height: '100vh', width: '100vw' }}>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors &copy; CARTO'
        url="https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/{z}/{x}/{y}{r}.png"
      />
      <MarkerManager/>
    </MapContainer>
  );
};