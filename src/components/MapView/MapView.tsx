import { useEffect, useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapView.css';
import { AddPointDialog } from '../AddPointDialog/AddPointDialog';
import { listPoints, createPoint, getPointDetails, deletePoint, updatePoint, getStoredAuth, type Point } from '../../services/auth';
import { EditPointDialog } from '../EditPointDialog/EditPointDialog';
import { getCategoryIcon } from '../../services/pointCategories';
import { useToast } from '../../context/ToastContext';

function PointMarker({ point, isSelected, onSelect, onMarkerSelect, currentUser, onPointDeleted, onPointEdited, lineOfSightMode, selectedMarkerIds, onMarkerDrag, selectedMarkers }: { point: Point; isSelected: boolean; onSelect: (id: string) => void; onMarkerSelect: (point: Point) => void; currentUser: string | null; onPointDeleted: (id: string) => void; onPointEdited: (point: { id: string; lat: number; lon: number; label: string; category_id: number; public: boolean }) => void; lineOfSightMode: boolean; selectedMarkerIds: string[]; onMarkerDrag?: (id: string, lat: number, lon: number) => void; selectedMarkers: Point[] }) {
  const markerRef = useRef<L.Marker>(null);
  const popupRef = useRef<L.Popup | null>(null);
  const map = useMap();
  const isSelectedForLos = selectedMarkerIds.includes(point.id);
  const selectedMarker = selectedMarkers.find(m => m.id === point.id);
  const position: [number, number] = selectedMarker ? [selectedMarker.lat, selectedMarker.lon] : [point.lat, point.lon];

  useEffect(() => {
    if (!markerRef.current) return;

    if (lineOfSightMode) {
      markerRef.current.unbindPopup();
      return;
    }

    const popup = L.popup({
      className: 'custom-popup',
      autoClose: false,
      closeOnClick: false,
    });

    popup.setContent(
      `<div class="point-popup">
        <div class="point-popup-label">${point.label}</div>
        <div class="point-popup-row">
          <span class="point-popup-key">Lat:</span>
          <span class="point-popup-value">${point.lat.toFixed(6)}</span>
        </div>
        <div class="point-popup-row">
          <span class="point-popup-key">Lon:</span>
          <span class="point-popup-value">${point.lon.toFixed(6)}</span>
        </div>
        <div class="point-popup-row">
          <span class="point-popup-key">Elevation:</span>
          <span class="point-popup-value">${Math.round(point.elevation)}m</span>
        </div>
        <div class="point-popup-row">
          <span class="point-popup-key">Visibility:</span>
          <span class="point-popup-value">${point.public ? 'Public' : 'Private'}</span>
        </div>
      </div>`
    );

    markerRef.current.bindPopup(popup);
    popupRef.current = popup;

    return () => {
      markerRef.current?.unbindPopup();
    };
  }, [lineOfSightMode]);

 useEffect(() => {
    if (isSelected && markerRef.current && !lineOfSightMode) {
      markerRef.current.openPopup();
      getPointDetails(point.id)
        .then(data => {
          const isOwner = data.user === currentUser;
          setTimeout(() => {
            const popupEl = popupRef.current?.getElement();
            if (!popupEl) return;
            const contentEl = popupEl.querySelector('.leaflet-popup-content');
            if (contentEl) {
              contentEl.innerHTML =
                `<div class="point-popup">
                  <div class="point-popup-label">${point.label}</div>
                  <div class="point-popup-row">
                    <span class="point-popup-key">Lat:</span>
                    <span class="point-popup-value">${point.lat.toFixed(6)}</span>
                  </div>
                  <div class="point-popup-row">
                    <span class="point-popup-key">Lon:</span>
                    <span class="point-popup-value">${point.lon.toFixed(6)}</span>
                  </div>
                  <div class="point-popup-row">
                    <span class="point-popup-key">Elevation:</span>
                    <span class="point-popup-value">${Math.round(point.elevation)}m</span>
                  </div>
                  <div class="point-popup-row">
                    <span class="point-popup-key">Visibility:</span>
                    <span class="point-popup-value">${point.public ? 'Public' : 'Private'}</span>
                  </div>
                  <div class="point-popup-row">
                    <span class="point-popup-key">User:</span>
                    <span class="point-popup-value">${data.user}</span>
                  </div>
                  ${isOwner ? `
                    <hr class="popup-separator">
                    <div class="point-popup-row action-row">
                      <span></span>
                      <svg class="edit-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                      <svg class="trash-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </div>` : ''}
                </div>`;
              if (isOwner) {
                const editIcon = popupEl.querySelector('.edit-icon');
                editIcon?.addEventListener('click', () => {
                  onPointEdited({
                    id: point.id,
                    lat: point.lat,
                    lon: point.lon,
                    label: point.label,
                    category_id: point.category_id,
                    public: point.public,
                  });
                });
                const trashIcon = popupEl.querySelector('.trash-icon');
                trashIcon?.addEventListener('click', () => {
                  if (confirm('Are you sure you want to remove the marker?')) {
                    onPointDeleted(point.id);
                  }
                });
              }
            }
          }, 50);
        })
        .catch(() => {});
    }
    if (!isSelected && markerRef.current) {
      markerRef.current.closePopup();
    }
  }, [isSelected, lineOfSightMode]);

  useEffect(() => {
    const onMove = () => {
      if (!isSelected || !popupRef.current || !markerRef.current) return;
      const popup = popupRef.current;
      if (!popup.isOpen()) return;
      const bounds = map.getBounds();
      const pos = markerRef.current.getLatLng();
      if (!bounds.contains(pos)) {
        markerRef.current.closePopup();
      }
    };
    map.on('moveend', onMove);
    return () => {
      map.off('moveend', onMove);
    };
  }, [isSelected, map]);

  const handleClick = () => {
    if (lineOfSightMode) {
      onMarkerSelect(point);
    } else {
      onSelect(point.id);
    }
  };

  return (
    <Marker
      position={position}
      icon={getCategoryIcon(point.category_id, isSelectedForLos)}
      eventHandlers={{
        click: handleClick,
        dragend: lineOfSightMode && isSelectedForLos && onMarkerDrag
          ? (e) => {
              const marker = e.target as L.Marker;
              const pos = marker.getLatLng();
              onMarkerDrag(point.id, pos.lat, pos.lng);
            }
          : undefined,
      }}
      draggable={lineOfSightMode && isSelectedForLos}
      ref={markerRef}
    />
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

function LineOfSightLine({ selectedMarkers }: { selectedMarkers: Point[] }) {
  const map = useMap();
  const polylineRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    if (selectedMarkers.length === 2) {
      const latlngs = selectedMarkers.map(m => [m.lat, m.lon] as [number, number]);
      const polyline = L.polyline(latlngs, {
        color: '#555555',
        weight: 3,
        opacity: 0.8,
        className: 'los-line',
      }).addTo(map);
      polylineRef.current = polyline;

      return () => {
        map.removeLayer(polyline);
        polylineRef.current = null;
      };
    } else {
      if (polylineRef.current) {
        map.removeLayer(polylineRef.current);
        polylineRef.current = null;
      }
    }
  }, [selectedMarkers, map]);

  return null;
}

function ElevationLabel({ point }: { point: Point }) {
  const map = useMap();
  const labelRef = useRef<L.DivIcon | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!point.elevation || point.elevation === 0) return;

    const icon = L.divIcon({
      className: 'los-elevation-label',
      html: `<div class="los-elevation-text">Elevation: ${Math.round(point.elevation)}m</div>`,
      iconSize: [100, 20],
      iconAnchor: [50, 0],
      popupAnchor: [0, 0],
    });

    const marker = L.marker([point.lat, point.lon], {
      icon,
      interactive: false,
    }).addTo(map);
    markerRef.current = marker;
    labelRef.current = icon;

    return () => {
      map.removeLayer(marker);
    };
  }, [point, map]);

  return null;
}

interface MapViewProps {
  addPointMode: boolean;
  onCancelAddPoint: () => void;
  onPointAdded: () => void;
  showCoordsDialog: boolean;
  onCancelCoordsDialog: () => void;
  onMarkerSelect: (point: Point) => void;
  lineOfSightMode: boolean;
  selectedMarkers: Point[];
  onMarkerDrag?: (id: string, lat: number, lon: number) => void;
}

export function MapView({ addPointMode, onCancelAddPoint, onPointAdded, showCoordsDialog, onCancelCoordsDialog, onMarkerSelect, lineOfSightMode, selectedMarkers, onMarkerDrag }: MapViewProps) {
  const [points, setPoints] = useState<Point[]>([]);
  const [pendingPoint, setPendingPoint] = useState<{ lat: number; lon: number } | null>(null);
  const [centerOn, setCenterOn] = useState<[number, number] | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([42.6977, 23.3215]);
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  const [editingPoint, setEditingPoint] = useState<{ id: string; lat: number; lon: number; label: string; category_id: number; public: boolean } | null>(null);
  const auth = getStoredAuth();
  const currentUser = auth.email;
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

  const handlePointDeleted = useCallback(async (id: string) => {
    try {
      await deletePoint(id);
      setPoints(prev => prev.filter(p => p.id !== id));
      setSelectedPointId(null);
      showToast('Marker removed', 'success');
    } catch (err) {
      if (err instanceof Error) {
        showToast(err.message, 'error');
      }
    }
  }, [showToast]);

  const handlePointUpdated = useCallback(async (lat: number, lon: number, label: string, categoryId: number, isPublic: boolean) => {
    if (!editingPoint) return;
    try {
      await updatePoint(editingPoint.id, {
        lat,
        lon,
        label,
        category_id: categoryId,
        public: isPublic,
      });
      setPoints(prev => prev.map(p => p.id === editingPoint.id ? { ...p, lat, lon, label, category_id: categoryId, public: isPublic } : p));
      setEditingPoint(null);
      showToast('Marker updated', 'success');
    } catch (err) {
      if (err instanceof Error) {
        showToast(err.message, 'error');
      }
    }
  }, [editingPoint, showToast]);

  const handleEditCancel = useCallback(() => {
    setEditingPoint(null);
  }, []);

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
                onMarkerSelect={onMarkerSelect}
                currentUser={currentUser}
                onPointDeleted={handlePointDeleted}
                onPointEdited={setEditingPoint}
                lineOfSightMode={lineOfSightMode}
                selectedMarkerIds={selectedMarkers.map(m => m.id)}
                onMarkerDrag={onMarkerDrag}
                selectedMarkers={selectedMarkers}
              />
        ))}
        {lineOfSightMode && <LineOfSightLine selectedMarkers={selectedMarkers} />}
        {lineOfSightMode && selectedMarkers.map(marker => (
          <ElevationLabel key={marker.id} point={marker} />
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
      {editingPoint && (
        <EditPointDialog
          lat={editingPoint.lat}
          lon={editingPoint.lon}
          label={editingPoint.label}
          categoryId={editingPoint.category_id}
          isPublic={editingPoint.public}
          onSave={handlePointUpdated}
          onCancel={handleEditCancel}
        />
      )}
    </div>
  );
}
