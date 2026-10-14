import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import { Rvm } from '../../types';
import { theme } from '../../theme';
import { getStatusColor } from '../../utils/statusColor';

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
  location: { latitude: number; longitude: number } | null;
  rvms: Rvm[] | undefined;
}

const createRvmMarkerIcon = (color: string) => {
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
      <circle cx="12" cy="12" r="8" fill="${color}" stroke="white" stroke-width="2"/>
      <circle cx="12" cy="12" r="3" fill="white"/>
    </svg>
  `;

  return L.divIcon({
    html: svgIcon,
    className: 'minimap-rvm-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

export function MiniMap({ location, rvms }: Props) {
  useEffect(() => {
    injectLeafletCSS();
  }, []);

  if (!location) {
    return null;
  }

  const center: [number, number] = [location.latitude, location.longitude];

  return (
    <div style={styles.container}>
      <style>{`
        .minimap-rvm-marker {
          background: transparent;
          border: none;
        }
        .minimap-container .leaflet-control-zoom,
        .minimap-container .leaflet-control-attribution {
          display: none;
        }
      `}</style>
      <MapContainer
        center={center}
        zoom={15}
        style={styles.map}
        zoomControl={false}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
        keyboard={false}
        attributionControl={false}
        className="minimap-container"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <CircleMarker
          center={center}
          radius={8}
          pathOptions={{
            fillColor: '#3B82F6',
            fillOpacity: 1,
            color: 'white',
            weight: 2,
          }}
        />

        {rvms?.map((rvm) => (
          <Marker
            key={rvm.id}
            position={[rvm.lat, rvm.lng]}
            icon={createRvmMarkerIcon(getStatusColor(rvm.status))}
            interactive={false}
          />
        ))}
      </MapContainer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    height: 180,
    width: '100%',
    borderRadius: '0 0 20px 20px',
    overflow: 'hidden',
  },
  map: {
    height: '100%',
    width: '100%',
  },
};
