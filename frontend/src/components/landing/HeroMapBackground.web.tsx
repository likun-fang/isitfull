import React, { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';
import { Rvm } from '../../types';
import { theme } from '../../theme';

const DUBLIN_CENTER: [number, number] = [53.349805, -6.26031];

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
  rvms: Rvm[] | undefined;
}

export function HeroMapBackground({ rvms }: Props) {
  useEffect(() => {
    injectLeafletCSS();
  }, []);

  return (
    <div style={styles.wrapper}>
      <style>{`
        .hero-bg-map .leaflet-control-zoom {
          display: none;
        }
        .hero-bg-map {
          cursor: default !important;
        }
      `}</style>
      {/* Map layer — blurred via CSS filter directly */}
      <div style={styles.mapBlur}>
        <MapContainer
          center={DUBLIN_CENTER}
          zoom={13}
          style={styles.map}
          zoomControl={false}
          dragging={false}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          touchZoom={false}
          keyboard={false}
          attributionControl={false}
          className="hero-bg-map"
        >
          <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {rvms?.map((rvm) => (
            <CircleMarker
              key={rvm.id}
              center={[rvm.lat, rvm.lng]}
              radius={8}
              pathOptions={{
                fillColor: theme.colors.primary[500],
                fillOpacity: 0.9,
                color: 'white',
                weight: 2.5,
              }}
              interactive={false}
            />
          ))}
        </MapContainer>
      </div>
      {/* Dark overlay on top */}
      <div style={styles.overlay} />
      {/* The OpenStreetMap tile usage policy requires this credit. */}
      <div style={styles.attribution}>
        &copy; <a href="https://www.openstreetmap.org/copyright" style={styles.attributionLink}>OpenStreetMap</a> contributors
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    overflow: 'hidden',
  },
  mapBlur: {
    width: '100%',
    height: '100%',
    filter: 'blur(4px)',
    // Prevent blur edge artifacts by scaling slightly
    transform: 'scale(1.05)',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
    pointerEvents: 'none',
  },
  // Outside the blurred map, so it copies the look of Leaflet's attribution control.
  // Top right because the hero card reaches the bottom of short screens.
  attribution: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: '0 5px',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    color: '#333',
    fontFamily: '"Helvetica Neue", Arial, Helvetica, sans-serif',
    fontSize: 12,
    lineHeight: 1.4,
  },
  attributionLink: {
    color: '#0078A8',
    textDecoration: 'none',
  },
};
