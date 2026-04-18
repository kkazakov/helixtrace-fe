import { useState, useEffect } from 'react';
import './MapLayerToggle.css';

type MapLayer = 'osm' | 'opentopomap';

interface MapLayerToggleProps {
  onLayerChange: (layer: MapLayer) => void;
}

export function MapLayerToggle({ onLayerChange }: MapLayerToggleProps) {
  const [layer, setLayer] = useState<MapLayer>(() => {
    const stored = localStorage.getItem('helixtrace_maplayer') as MapLayer | null;
    return stored || 'opentopomap';
  });

  useEffect(() => {
    localStorage.setItem('helixtrace_maplayer', layer);
    onLayerChange(layer);
  }, [layer, onLayerChange]);

  return (
    <div className="map-layer-toggle">
      <button
        className={`map-layer-btn${layer === 'osm' ? ' map-layer-btn-active' : ''}`}
        onClick={() => setLayer('osm')}
        title="OpenStreetMap"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07" />
        </svg>
        <span>OSM</span>
      </button>
      <button
        className={`map-layer-btn${layer === 'opentopomap' ? ' map-layer-btn-active' : ''}`}
        onClick={() => setLayer('opentopomap')}
        title="OpenTopoMap"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 17c3-3 5-8 9-8s6 5 9 8" />
          <path d="M3 20c3-3 5-8 9-8s6 5 9 8" />
          <path d="M12 2v6" />
        </svg>
        <span>Topo</span>
      </button>
    </div>
  );
}
