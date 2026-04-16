import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapView.css';

delete (L.Icon.Default.prototype as any)._getIconUrl;

const userIcon = L.divIcon({
  className: 'custom-marker user-marker',
  html: `<svg width="20" height="28" viewBox="0 0 20 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 0C4.477 0 0 4.477 0 10c0 7 10 18 10 18s10-11 10-18C20 4.477 15.523 0 10 0z" fill="#2e7d32"/>
    <circle cx="10" cy="10" r="3.5" fill="#fff"/>
  </svg>`,
  iconSize: [20, 28],
  iconAnchor: [10, 28],
  popupAnchor: [0, -28],
});

function LocationMarker({ onLocationFound }: { onLocationFound: (pos: [number, number]) => void }) {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const map = useMap();

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const coords: [number, number] = [latitude, longitude];
        setPosition(coords);
        map.setView(coords, 14);
        onLocationFound(coords);
      },
      () => {
        map.setView([42.6977, 23.3215], 12);
      },
      { enableHighAccuracy: true }
    );
  }, [map, onLocationFound]);

  return position ? (
    <Marker position={position} icon={userIcon}>
      <Popup className="custom-popup">Your location</Popup>
    </Marker>
  ) : null;
}

function MapClickHandler({ onMapClick }: { onMapClick: (pos: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      onMapClick([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

export function MapView() {
  const handleLocationFound = (_pos: [number, number]) => {};

  const handleMapClick = (_pos: [number, number]) => {};

  return (
    <div className="map-view">
      <MapContainer
        center={[42.6977, 23.3215]}
        zoom={12}
        scrollWheelZoom={true}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker onLocationFound={handleLocationFound} />
        <MapClickHandler onMapClick={handleMapClick} />
      </MapContainer>
    </div>
  );
}
