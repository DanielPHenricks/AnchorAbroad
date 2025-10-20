import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import markerIconPng from 'leaflet/dist/images/marker-icon.png';
import { Icon } from 'leaflet';

export const BackgroundMap = ({ containerRef, children, mapChildren, mapCenter }) => {
  const mapRef = React.useRef(null);

  React.useEffect(() => {
    if (mapRef.current && mapCenter) {
      mapRef.current.setView(mapCenter, mapRef.current.getZoom());
    }
  }, [mapCenter]);

  // Zurich
  const center = mapCenter || [47.812, 8.4058];

  // Madrid
  const madrid = [40.4167, -3.7033];

  const zoom = 5;

  return (
    <div
      ref={containerRef}
      style={{
        minHeight: '100vh',
        width: '100vw',
        position: 'fixed',
        top: 0,
        left: 0,
        margin: 0,
        padding: 0,
        zIndex: 0,
      }}
    >
      <MapContainer
        ref={mapRef}
        center={center}
        zoom={zoom}
        style={{
          height: '100vh',
          width: '100vw',
          zIndex: 0,
        }}
        zoomControl={true}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        dragging={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/{z}/{x}/{y}{r}.png"
        />

        {mapChildren}
        <Marker
          position={madrid}
          icon={new Icon({ iconUrl: markerIconPng, iconSize: [25, 41], iconAnchor: [12, 41] })}
        >
          <Popup>CIEE Madrid | Engineering and Technology</Popup>
        </Marker>
      </MapContainer>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 10,
          pointerEvents: 'none',
        }}
      >
        <div style={{ pointerEvents: 'auto' }}>{children}</div>
      </div>
    </div>
  );
};
