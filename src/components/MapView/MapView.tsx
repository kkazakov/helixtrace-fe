import { useEffect, useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapView.css';
import { AddPointDialog } from '../AddPointDialog/AddPointDialog';
import { listPoints, createPoint, getPointDetails, deletePoint, updatePoint, getStoredAuth, type Point } from '../../services/auth';
import { EditPointDialog } from '../EditPointDialog/EditPointDialog';
import { getCategoryIcon, POINT_CATEGORIES } from '../../services/pointCategories';
import { useToast } from '../../context/ToastContext';
import { MapLayerToggle } from '../MapLayerToggle/MapLayerToggle';
import { useTheme } from '../../hooks/useTheme';

function PointMarker({ point, isSelected, onSelect, onMarkerSelect, currentUser, onPointDeleted, onPointEdited, lineOfSightMode, selectedMarkerIds, onMarkerDrag, selectedMarkers, mapLayer: _mapLayer }: { point: Point; isSelected: boolean; onSelect: (id: string) => void; onMarkerSelect: (point: Point) => void; currentUser: string | null; onPointDeleted: (id: string) => void; onPointEdited: (point: { id: string; lat: number; lon: number; label: string; category_id: number; public: boolean }) => void; lineOfSightMode: boolean; selectedMarkerIds: string[]; onMarkerDrag?: (id: string, lat: number, lon: number) => void; selectedMarkers: Point[]; mapLayer: string }) {
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
        ${point.category_id !== 3 ? `
        <div class="point-popup-row">
          <span class="point-popup-key">Type:</span>
          <span class="point-popup-value">${POINT_CATEGORIES.find(c => c.id === point.category_id)?.label || ''}${point.external ? ' (external)' : ''}</span>
        </div>` : ''}
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
      if (!point.external) {
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
                  ${point.category_id !== 3 ? `
                  <div class="point-popup-row">
                    <span class="point-popup-key">Type:</span>
                    <span class="point-popup-value">${POINT_CATEGORIES.find(c => c.id === point.category_id)?.label || ''}${point.external ? ' (external)' : ''}</span>
                  </div>` : ''}
                  ${data.user ? `
                  <div class="point-popup-row">
                    <span class="point-popup-key">User:</span>
                    <span class="point-popup-value">${data.user}</span>
                  </div>` : ''}
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
      icon={getCategoryIcon(point.category_id, point.public, isSelectedForLos, point.external)}
      eventHandlers={{
        click: handleClick,
        ...(lineOfSightMode && isSelectedForLos && onMarkerDrag && point.id.startsWith('temp-los-')
          ? {
              dragend: (e: any) => {
                const marker = e.target as L.Marker;
                const pos = marker.getLatLng();
                onMarkerDrag(point.id, pos.lat, pos.lng);
              },
            }
          : {}),
      }}
      draggable={lineOfSightMode && isSelectedForLos && onMarkerDrag && point.id.startsWith('temp-los-')}
      ref={markerRef}
    />
  );
}

delete (L.Icon.Default.prototype as any)._getIconUrl;

function LocationMarker({ onLocationFound }: { onLocationFound: (pos: [number, number]) => void }) {
  const map = useMap();
  const hasLocated = useRef(false);

  useEffect(() => {
    if (!navigator.geolocation || hasLocated.current) return;
    hasLocated.current = true;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const coords: [number, number] = [latitude, longitude];
        map.setView(coords, 14);
        onLocationFound(coords);
      },
      () => {
        map.setView([42.6977, 23.3215], 12);
      },
      { enableHighAccuracy: true }
    );
  }, [map, onLocationFound]);

  return null;
}

const losTempIcon = L.divIcon({
  className: 'custom-marker los-temp-marker',
  html: `<svg width="20" height="28" viewBox="0 0 20 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 0C4.477 0 0 4.477 0 10c0 7 10 18 10 18s10-11 10-18C20 4.477 15.523 0 10 0z" fill="#e53935"/>
    <circle cx="10" cy="10" r="3.5" fill="#fff"/>
  </svg>`,
  iconSize: [20, 28],
  iconAnchor: [10, 28],
  popupAnchor: [0, -28],
});

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

import { type TraceResponse } from '../../services/auth';

interface TraceResult {
  traceData: TraceResponse;
  fromElevation: number;
  toElevation: number;
  fromLabel: string;
  toLabel: string;
  losStatus: 'unknown' | 'clear' | 'blocked';
}

function LineOfSightLine({ selectedMarkers, mapLayer, traceResults }: { selectedMarkers: Point[]; mapLayer: string; traceResults: TraceResult[] }) {
  const map = useMap();
  const polylinesRef = useRef<L.Polyline[]>([]);

  const getLineColor = (status: 'unknown' | 'clear' | 'blocked') => {
    if (status === 'clear') {
      return mapLayer === 'esri' ? '#81c784' : '#2e7d32';
    }
    if (status === 'blocked') {
      return '#d32f2f';
    }
    return mapLayer === 'esri' ? '#bdbdbd' : '#555555';
  };

  useEffect(() => {
    polylinesRef.current.forEach(p => map.removeLayer(p));
    polylinesRef.current = [];

    if (selectedMarkers.length >= 2 && traceResults.length > 0) {
      const edges: [[number, number], [number, number]][] = [];
      if (selectedMarkers.length === 2) {
        edges.push(
          [[selectedMarkers[0].lat, selectedMarkers[0].lon], [selectedMarkers[1].lat, selectedMarkers[1].lon]]
        );
      } else if (selectedMarkers.length === 3) {
        edges.push(
          [[selectedMarkers[0].lat, selectedMarkers[0].lon], [selectedMarkers[1].lat, selectedMarkers[1].lon]]
        );
        edges.push(
          [[selectedMarkers[1].lat, selectedMarkers[1].lon], [selectedMarkers[2].lat, selectedMarkers[2].lon]]
        );
        edges.push(
          [[selectedMarkers[0].lat, selectedMarkers[0].lon], [selectedMarkers[2].lat, selectedMarkers[2].lon]]
        );
      }

      const numEdges = edges.length;
      const clearCount = traceResults.filter(r => r.losStatus === 'clear').length;

      edges.forEach((edge, i) => {
        const status = traceResults[i]?.losStatus ?? 'unknown';
        let dashArray: string | undefined;

        if (numEdges === 1) {
          if (status === 'blocked') {
            dashArray = '8, 6';
          }
        } else if (numEdges === 3) {
          if (clearCount < 2) {
            dashArray = '8, 6';
          }
        }

        const polyline = L.polyline(edge, {
          color: getLineColor(status),
          weight: 3,
          opacity: 0.8,
          className: 'los-line',
          dashArray,
        }).addTo(map);
        polylinesRef.current.push(polyline);
      });
    }

    return () => {
      polylinesRef.current.forEach(p => map.removeLayer(p));
      polylinesRef.current = [];
    };
  }, [selectedMarkers, mapLayer, traceResults, map]);

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

function TempLosMarker({ position, label, elevation, onDragEnd, onRemove }: { position: [number, number]; label: string; elevation?: number; onDragEnd: (lat: number, lon: number) => void; onRemove: () => void }) {
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!markerRef.current) return;
    markerRef.current.setLatLng(position);
  }, [position]);

  const elevationText = elevation ? `${Math.round(elevation)}m` : '';

  const labelIcon = L.divIcon({
    className: 'los-marker-label',
    html: `<div class="los-marker-label-content"><div class="los-marker-label-name">${label}</div>${elevationText ? `<div class="los-marker-label-elevation">${elevationText}</div>` : ''}</div>`,
    iconSize: [80, 80],
    iconAnchor: [40, 80],
    popupAnchor: [0, 0],
  });

  const labelOffset = L.latLng(position[0] + 0.0004, position[1]);

  return (
    <>
      <Marker
        position={position}
        icon={losTempIcon}
        draggable
        eventHandlers={{
          dragend: (e) => {
            const marker = e.target as L.Marker;
            const pos = marker.getLatLng();
            onDragEnd(pos.lat, pos.lng);
          },
          click: () => {
            onRemove();
          },
        }}
        ref={markerRef}
      />
      <Marker position={labelOffset} icon={labelIcon} interactive={false} />
    </>
  );
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
  onAddLosPoint: (lat: number, lon: number) => void;
  onMarkerRemove?: (id: string) => void;
  traceResults: TraceResult[];
}

export function MapView({ addPointMode, onCancelAddPoint, onPointAdded, showCoordsDialog, onCancelCoordsDialog, onMarkerSelect, lineOfSightMode, selectedMarkers, onMarkerDrag, onAddLosPoint, onMarkerRemove, traceResults }: MapViewProps) {
  const [points, setPoints] = useState<Point[]>([]);
  const [pendingPoint, setPendingPoint] = useState<{ lat: number; lon: number } | null>(null);
  const [centerOn, setCenterOn] = useState<[number, number] | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([42.6977, 23.3215]);
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  const [editingPoint, setEditingPoint] = useState<{ id: string; lat: number; lon: number; label: string; category_id: number; public: boolean } | null>(null);
  const [mapLayer, setMapLayer] = useState<'osm' | 'opentopomap' | 'stamenterrain' | 'esri' | 'cartodb_positron' | 'cartodb_dark'>(() => {
    const stored = localStorage.getItem('helixtrace_maplayer');
    if (stored === 'cartodb') {
      const storedTheme = localStorage.getItem('helixtrace_theme');
      return storedTheme === 'dark' ? 'cartodb_dark' : 'cartodb_positron';
    }
    if (stored === 'osm' || stored === 'opentopomap' || stored === 'stamenterrain' || stored === 'esri' || stored === 'cartodb_positron' || stored === 'cartodb_dark') {
      return stored;
    }
    return 'osm';
  });
  const [isCartoDB, setIsCartoDB] = useState(() => {
    const stored = localStorage.getItem('helixtrace_maplayer');
    return stored === 'cartodb';
  });
  const auth = getStoredAuth();
  const currentUser = auth.email;
  const { showToast } = useToast();
  const { theme } = useTheme();

  useEffect(() => {
    if (isCartoDB) {
      setMapLayer(theme === 'dark' ? 'cartodb_dark' : 'cartodb_positron');
    }
  }, [theme, isCartoDB]);

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
    } else if (lineOfSightMode) {
      onAddLosPoint(pos[0], pos[1]);
    } else {
      setSelectedPointId(null);
    }
  }, [addPointMode, lineOfSightMode, onAddLosPoint]);

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

  const handleLayerChange = useCallback((layer: string) => {
    if (layer === 'cartodb_positron' || layer === 'cartodb_dark') {
      setIsCartoDB(true);
    } else {
      setIsCartoDB(false);
    }
    setMapLayer(layer as typeof mapLayer);
  }, []);

  return (
    <div className={`map-view${(addPointMode || lineOfSightMode) ? ' map-view-crosshair' : ''}`}>
      <MapContainer
        center={[42.6977, 23.3215]}
        zoom={12}
        scrollWheelZoom={true}
        zoomControl={false}
      >
        <TileLayer
          key={mapLayer}
          attribution={mapLayer === 'opentopomap'
            ? '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            : mapLayer === 'stamenterrain'
              ? '&copy; <a href="https://www.stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://stamen.com/">Stamen Design</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              : mapLayer === 'esri'
                ? '&copy; <a href="https://esri.com/">Esri</a>'
                : mapLayer === 'cartodb_positron'
                  ? '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  : mapLayer === 'cartodb_dark'
                    ? '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}
          url={mapLayer === 'opentopomap'
            ? "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
            : mapLayer === 'stamenterrain'
              ? "https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}.png"
              : mapLayer === 'esri'
                ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                : mapLayer === 'cartodb_positron'
                  ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                  : mapLayer === 'cartodb_dark'
                    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
        />
        <LocationMarker onLocationFound={handleLocationFound} />
        <MapClickHandler onMapClick={handleMapClick} />
        <MapCenter center={centerOn} />
       <MapCenterTracker onCenterChange={setMapCenter} />
        <MapLayerToggle onLayerChange={handleLayerChange} />
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
                mapLayer={mapLayer}
              />
        ))}
        {lineOfSightMode && <LineOfSightLine selectedMarkers={selectedMarkers} mapLayer={mapLayer} traceResults={traceResults} />}
        {lineOfSightMode && selectedMarkers.map((marker, idx) => {
          const isExisting = points.some(p => p.id === marker.id);
          if (!isExisting) {
            return (
              <TempLosMarker
                key={`temp-${idx}`}
                position={[marker.lat, marker.lon]}
                label={marker.label}
                elevation={marker.elevation}
                onDragEnd={(lat, lon) => onMarkerDrag?.(marker.id, lat, lon)}
                onRemove={() => onMarkerRemove?.(marker.id)}
              />
            );
          }
          return null;
        })}
        {lineOfSightMode && selectedMarkers.map(marker => {
          if (marker.elevation && marker.elevation > 0 && !marker.id.startsWith('temp-los-')) {
            return <ElevationLabel key={`elev-${marker.id}`} point={marker} />;
          }
          return null;
        })}
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
