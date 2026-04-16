import { useEffect, useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapView.css';
import { AddPointDialog } from '../AddPointDialog/AddPointDialog';
import { listPoints, createPoint, getPointDetails, type Point, type PointDetails } from '../../services/auth';
import { getCategoryIcon } from '../../services/pointCategories';
import { useToast } from '../../context/ToastContext';

function PointMarker({ point, isSelected, onSelect }: { point: Point; isSelected: boolean; onSelect: (id: string) => void }) {
  const markerRef = useRef<L.Marker>(null);
  const [details, setDetails] = useState<PointDetails | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (isSelected && details) {
      markerRef.current?.openPopup();
    }
  }, [isSelected, details]);

  useEffect(() => {
    if (!isSelected) {
      setDetails(null);
    }
  }, [isSelected]);

  const handleClick = async () => {
    onSelect(point.id);
    try {
      const data = await getPointDetails(point.id);
      setDetails(data);
    } catch (err) {
      if (err instanceof Error) {
        showToast(err.message, 'error');
      }
    }
  };

  return (
    <Marker
      position={[point.lat, point.lon]}
      icon={getCategoryIcon(point.category_id)}
      eventHandlers={{ click: handleClick }}
      ref={markerRef}
    >
      {isSelected && details && (
        <Popup className="custom-popup" autoClose={false} closeOnClick={false}>
          <div className="point-popup">
            <div className="point-popup-label">{details.label}</div>
            <div className="point-popup-row">
              <span className="point-popup-key">Lat:</span>
              <span className="point-popup-value">{details.lat.toFixed(6)}</span>
            </div>
            <div className="point-popup-row">
              <span className="point-popup-key">Lon:</span>
              <span className="point-popup-value">{details.lon.toFixed(6)}</span>
            </div>
            <div className="point-popup-row">
              <span className="point-popup-key">Visibility:</span>
              <span className="point-popup-value">{details.public ? 'Public' : 'Private'}</span>
            </div>
          </div>
        </Popup>
      )}
    </Marker>
  );
}

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
  const hasLocated = useRef(false);

  useEffect(() => {
    if (!navigator.geolocation || hasLocated.current) return;
    hasLocated.current = true;

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

function MapCenter({ center }: { center: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

function MapCenterTracker({ onCenterChange }: { onCenterChange: (center: [number, number]) => void }) {
  const map = useMap();
  useEffect(() => {
    onCenterChange([map.getCenter().lat, map.getCenter().lng]);
    map.on('moveend', () => {
      onCenterChange([map.getCenter().lat, map.getCenter().lng]);
    });
    return () => {
      map.off('moveend');
    };
  }, [map, onCenterChange]);
  return null;
}

interface MapViewProps {
  addPointMode: boolean;
  onCancelAddPoint: () => void;
  onPointAdded: () => void;
  showCoordsDialog: boolean;
  onCancelCoordsDialog: () => void;
}

export function MapView({ addPointMode, onCancelAddPoint, onPointAdded, showCoordsDialog, onCancelCoordsDialog }: MapViewProps) {
  const [points, setPoints] = useState<Point[]>([]);
  const [pendingPoint, setPendingPoint] = useState<{ lat: number; lon: number } | null>(null);
  const [centerOn, setCenterOn] = useState<[number, number] | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([42.6977, 23.3215]);
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const loadPoints = async () => {
      try {
        const data = await listPoints();
        setPoints(data);
      } catch (err) {
        if (err instanceof Error) {
          showToast(err.message, 'error');
        }
      }
    };
    loadPoints();
  }, [showToast]);

  const handleLocationFound = useCallback((_pos: [number, number]) => {}, []);

  const handleMapClick = useCallback((pos: [number, number]) => {
    if (addPointMode) {
      setPendingPoint({ lat: pos[0], lon: pos[1] });
    } else {
      setSelectedPointId(null);
    }
  }, [addPointMode]);

  const handleDialogCancel = useCallback(() => {
    setPendingPoint(null);
    onCancelAddPoint();
  }, [onCancelAddPoint]);

  const handleCoordsDialogCancel = useCallback(() => {
    onCancelCoordsDialog();
  }, [onCancelCoordsDialog]);

  const savePoint = useCallback(async (lat: number, lon: number, label: string, categoryId: number, isPublic: boolean) => {
    try {
      const newPoint = await createPoint({
        lat,
        lon,
        public: isPublic,
        label,
        category_id: categoryId,
      });
      setPoints(prev => [...prev, newPoint]);
      setCenterOn([newPoint.lat, newPoint.lon]);
      onPointAdded();
      showToast('Point created successfully', 'success');
    } catch (err) {
      if (err instanceof Error) {
        showToast(err.message, 'error');
      }
    }
  }, [onPointAdded, showToast]);

  const handleDialogSave = useCallback(async (lat: number, lon: number, label: string, categoryId: number, isPublic: boolean) => {
    setPendingPoint(null);
    onCancelAddPoint();
    await savePoint(lat, lon, label, categoryId, isPublic);
  }, [onCancelAddPoint, savePoint]);

  const handleCoordsDialogSave = useCallback(async (lat: number, lon: number, label: string, categoryId: number, isPublic: boolean) => {
    onCancelCoordsDialog();
    await savePoint(lat, lon, label, categoryId, isPublic);
  }, [onCancelCoordsDialog, savePoint]);

  return (
    <div className={`map-view${addPointMode ? ' map-view-crosshair' : ''}`}>
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
        <MapCenter center={centerOn} />
        <MapCenterTracker onCenterChange={setMapCenter} />
        {points.map(point => (
          <PointMarker
            key={point.id}
            point={point}
            isSelected={selectedPointId === point.id}
            onSelect={setSelectedPointId}
          />
        ))}
      </MapContainer>
      {pendingPoint && (
        <AddPointDialog
          lat={pendingPoint.lat}
          lon={pendingPoint.lon}
          onSave={handleDialogSave}
          onCancel={handleDialogCancel}
        />
      )}
      {showCoordsDialog && (
        <AddPointDialog
          lat={mapCenter[0]}
          lon={mapCenter[1]}
          editableCoords
          onSave={handleCoordsDialogSave}
          onCancel={handleCoordsDialogCancel}
        />
      )}
    </div>
  );
}
