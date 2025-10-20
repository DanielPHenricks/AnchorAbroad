// frontend/src/components/marker.jsx
import { Marker, Popup } from "react-leaflet";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import { Icon } from "leaflet";

export const MarkerManager = ({ markers, onMarkerClick }) => (
  <>
    {markers.map((marker, idx) => (
      <Marker
        key={idx}
        position={[marker.latitude, marker.longitude]}
        icon={new Icon({
          iconUrl: markerIconPng,
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [0, -35],
        })}
        eventHandlers={{
          mouseover: (e) => e.target.openPopup(),
          mouseout: (e) => e.target.closePopup(),
          popupopen: (e) => {
            if (e.popup && e.popup._container) {
              e.popup._container.style.pointerEvents = "none";
            }
          },
          click: () => onMarkerClick(marker),
        }}
      >
        <Popup closeButton={false} autoClose={false} closeOnClick={false}>
          <strong>{marker.name}</strong>
          <br />
          {marker.description}
        </Popup>
      </Marker>
    ))}
  </>
);