// frontend/src/components/marker.jsx
import { Marker, Popup } from 'react-leaflet';
import markerIconPng from 'leaflet/dist/images/marker-icon.png';
import { Icon } from 'leaflet';

export const MarkerManager = ({ markers, onMarkerClick }) => (
  <>
    {markers.map((marker, idx) => (
      <Marker
        key={idx}
        position={[marker.program_details.latitude, marker.program_details.longitude]}
        icon={
          new Icon({
            iconUrl: markerIconPng,
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [0, -35],
          })
        }
        eventHandlers={{
          mouseover: (e) => {e.target.openPopup(); console.log(marker.sections)},
          mouseout: (e) => e.target.closePopup(),
          popupopen: (e) => {
            if (e.popup && e.popup._container) {
              e.popup._container.style.pointerEvents = 'none';
            }
          },
          click: () => onMarkerClick(marker),
        }}
      >
        <Popup closeButton={false} autoClose={false} closeOnClick={false}>
          <strong>{marker.program_details.name}</strong>
          <br />
        </Popup>
      </Marker>
    ))}
  </>
);
