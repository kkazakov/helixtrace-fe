import { useState } from 'react';
import './MapLayerToggle.css';

type MapLayerKey = 'osm' | 'opentopomap' | 'stamenterrain' | 'esri' | 'cartodb';

interface MapLayerOption {
  key: MapLayerKey;
  label: string;
  icon: string;
}

const LAYERS: MapLayerOption[] = [
  { key: 'osm', label: 'OpenStreetMap', icon: '🗺️' },
  { key: 'opentopomap', label: 'OpenTopoMap', icon: '⛰️' },
  { key: 'stamenterrain', label: 'Stamen Terrain', icon: '🏔️' },
  { key: 'esri', label: 'ESRI Satellite', icon: '🛰️' },
  { key: 'cartodb', label: 'CartoDB', icon: '📊' },
];

interface MapLayerToggleProps {
  onLayerChange: (layer: MapLayerKey) => void;
}

export function MapLayerToggle({ onLayerChange }: MapLayerToggleProps) {
  const [selectedLayer, setSelectedLayer] = useState<MapLayerKey>(() => {
    const stored = localStorage.getItem('helixtrace_maplayer') as MapLayerKey | null;
    return stored || 'opentopomap';
  });

  const handleChange = (newLayer: MapLayerKey) => {
    setSelectedLayer(newLayer);
    localStorage.setItem('helixtrace_maplayer', newLayer);
    onLayerChange(newLayer);
  };

  return (
    <div className="map-layer-toggle">
      <select
        className="map-layer-select"
        value={selectedLayer}
        onChange={(e) => handleChange(e.target.value as MapLayerKey)}
        aria-label="Map layer"
      >
        {LAYERS.map(l => (
          <option key={l.key} value={l.key}>{l.icon} {l.label}</option>
        ))}
      </select>
    </div>
  );
}
