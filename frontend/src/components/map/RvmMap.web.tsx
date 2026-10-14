import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Rvm } from '../../types';
import { getStatusColor } from '../../utils/statusColor';
import { MAP_INITIAL_REGION } from '../../constants/config';

// Inject Leaflet CSS from CDN (avoids Metro bundler issues with local CSS images)
const injectLeafletCSS = () => {
  if (typeof document !== 'undefined' && !document.getElementById('leaflet-css')) {
    const link = document.createElement('link');
    link.id = 'leaflet-css';
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = '';
    document.head.appendChild(link);
  }
};

interface Props {
  rvms: Rvm[];
  userLocation?: { latitude: number; longitude: number } | null;
  onMarkerPress?: (rvm: Rvm) => void;
  onRegionChange?: (region: { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number }) => void;
}

// Create custom marker icon based on status color
const createMarkerIcon = (color: string) => {
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
      <circle cx="12" cy="12" r="10" fill="${color}" stroke="white" stroke-width="2"/>
      <circle cx="12" cy="12" r="4" fill="white"/>
    </svg>
  `;

  return L.divIcon({
    html: svgIcon,
    className: 'custom-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

// User location marker
const userLocationIcon = L.divIcon({
  html: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
      <circle cx="12" cy="12" r="8" fill="#3B82F6" stroke="white" stroke-width="2"/>
      <circle cx="12" cy="12" r="3" fill="white"/>
    </svg>
  `,
  className: 'user-location-marker',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// Component to handle map center changes
function MapController({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);

  return null;
}

export function RvmMap({ rvms, userLocation, onMarkerPress }: Props) {
  // Inject Leaflet CSS on mount
  useEffect(() => {
    injectLeafletCSS();
  }, []);

  const center: [number, number] = userLocation
    ? [userLocation.latitude, userLocation.longitude]
    : [MAP_INITIAL_REGION.latitude, MAP_INITIAL_REGION.longitude];

  const zoom = userLocation ? 14 : 12;

  return (
    <div style={styles.container}>
      <style>{`
        .custom-marker {
          background: transparent;
          border: none;
        }
        .user-location-marker {
          background: transparent;
          border: none;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
        }
        .leaflet-popup-content {
          margin: 12px;
        }
      `}</style>
      <MapContainer
        center={center}
        zoom={zoom}
        style={styles.map}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController center={center} />

        {userLocation && (
          <Marker
            position={[userLocation.latitude, userLocation.longitude]}
            icon={userLocationIcon}
          >
            <Popup>Your location</Popup>
          </Marker>
        )}

        {rvms.map((rvm) => (
          <Marker
            key={rvm.id}
            position={[rvm.lat, rvm.lng]}
            icon={createMarkerIcon(getStatusColor(rvm.status, rvm.queueLength))}
            eventHandlers={{
              click: () => onMarkerPress?.(rvm),
            }}
          />
        ))}
      </MapContainer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
  },
  map: {
    flex: 1,
    height: '100%',
    width: '100%',
  },
};
