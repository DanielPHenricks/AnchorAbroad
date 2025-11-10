/**
 * Names: Daniel, Jacob, Maharshi, Ben
 * Time: 2 hours
 */

import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { Typography } from '@mui/material';

export function MarkerManager({ markers, onMarkerClick }) {
  return (
    <>
      {markers.map((marker, idx) => (
        <Marker
          key={marker.program_id ?? idx}
          position={[marker.latitude, marker.longitude]}
          icon={
            new Icon({
              iconUrl: 'icons/marker-icon.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [0, -35],
            })
          }
          eventHandlers={{
            mouseover: (e) => e.target.openPopup(),
            mouseout: (e) => e.target.closePopup(),
            popupopen: (e) => {
              if (e.popup && e.popup._container) {
                e.popup._container.style.pointerEvents = 'none';
              }
            },
            click: () => onMarkerClick?.(marker),
          }}
        >
          <Popup closeButton={false} autoClose={false} closeOnClick={false}>
            <Typography sx={{ fontFamily: '"Libre Caslon Text"', textAlign: 'center' }}>
              {marker.program_details?.name ?? marker.name ?? 'Program'}
            </Typography>
          </Popup>
        </Marker>
      ))}
    </>
  );
}
