import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './components/Login/Login';
import { MapView } from './components/MapView/MapView';
import { RightPanel } from './components/RightPanel/RightPanel';
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute';
import { getStoredAuth, type Point, type TraceResponse, getElevationInfo } from './services/auth';
import { tracePath } from './services/auth';
import { computeLOSStatus, type LOSStatus } from './lib/los';
import { ToastProvider } from './context/ToastContext';
import { useToast } from './context/ToastContext';
import { TerrainGraphExpanded } from './components/TerrainGraph';
import './App.css';

interface TraceResult {
  traceData: TraceResponse;
  fromElevation: number;
  toElevation: number;
  fromLabel: string;
  toLabel: string;
  losStatus: LOSStatus;
}

function DashboardInner({ onLogout }: { onLogout: () => void }) {
  const { showToast } = useToast();
  const [addPointMode, setAddPointMode] = useState(false);
  const [showCoordsDialog, setShowCoordsDialog] = useState(false);
  const [lineOfSightMode, setLineOfSightMode] = useState(false);
  const [selectedMarkers, setSelectedMarkers] = useState<Point[]>([]);
  const [traceResults, setTraceResults] = useState<TraceResult[]>([]);
  const [losStatus, setLosStatus] = useState<LOSStatus>('unknown');
  const [traceLoading, setTraceLoading] = useState(false);
  const [expandedGraph, setExpandedGraph] = useState<{ index: number } | null>(null);

  const handleToggleLineOfSight = () => {
    setLineOfSightMode(prev => !prev);
    if (lineOfSightMode) {
      setSelectedMarkers([]);
      setTraceResults([]);
      setLosStatus('unknown');
    }
  };

  const handleMarkerSelect = (point: Point) => {
    setSelectedMarkers(prev => {
      const exists = prev.find(m => m.id === point.id);
      if (exists) {
        return prev.filter(m => m.id !== point.id);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, point];
    });
  };

  const handleMarkerRemove = (id: string) => {
    setSelectedMarkers(prev => prev.filter(m => m.id !== id));
    setTraceResults([]);
    setLosStatus('unknown');
  };

  const handleMarkerDrag = async (id: string, lat: number, lon: number) => {
    try {
      const info = await getElevationInfo(lat, lon);
      setSelectedMarkers(prev =>
        prev.map(m =>
          m.id === id ? { ...m, lat: info.lat, lon: info.lon, elevation: info.elevation } : m
        )
      );
    } catch (err) {
      if (err instanceof Error) {
        showToast(err.message, 'error');
      }
    }
  };

  const handleAddLosPoint = async (lat: number, lon: number) => {
    setSelectedMarkers(prev => {
      if (prev.length >= 3) return prev;
      return prev;
    });

    try {
      const info = await getElevationInfo(lat, lon);
      setSelectedMarkers(prev => {
        if (prev.length >= 3) return prev;
        const idx = prev.length + 1;
        const tempPoint: Point = {
          id: `temp-los-${idx}-${Date.now()}`,
          lat: info.lat,
          lon: info.lon,
          elevation: info.elevation,
          label: `Point ${idx}`,
          category_id: 3,
          public: false,
        };
        return [...prev, tempPoint];
      });
    } catch (err) {
      if (err instanceof Error) {
        showToast(err.message, 'error');
      }
    }
  };

  useEffect(() => {
    if (selectedMarkers.length >= 2) {
      setTraceLoading(true);
      const pairs: { from: Point; to: Point }[] = [];
      if (selectedMarkers.length === 2) {
        pairs.push({ from: selectedMarkers[0], to: selectedMarkers[1] });
      } else if (selectedMarkers.length === 3) {
        pairs.push({ from: selectedMarkers[0], to: selectedMarkers[1] });
        pairs.push({ from: selectedMarkers[1], to: selectedMarkers[2] });
        pairs.push({ from: selectedMarkers[0], to: selectedMarkers[2] });
      }

      const promises = pairs.map(({ from, to }) =>
        tracePath(from.lat, from.lon, to.lat, to.lon).then(data => ({
          traceData: data,
          fromElevation: from.elevation,
          toElevation: to.elevation,
          fromLabel: from.label,
          toLabel: to.label,
          losStatus: computeLOSStatus(data, from.elevation, to.elevation),
        }))
      );

      Promise.all(promises)
        .then(results => {
          setTraceResults(results);
          const allClear = results.every(r => r.losStatus === 'clear');
          const anyBlocked = results.some(r => r.losStatus === 'blocked');
          setLosStatus(anyBlocked ? 'blocked' : allClear ? 'clear' : 'unknown');
          setTraceLoading(false);
        })
        .catch(err => {
          if (err instanceof Error) {
            showToast(err.message, 'error');
          }
          setTraceLoading(false);
        });
    } else {
      setTraceResults([]);
      setLosStatus('unknown');
    }
  }, [selectedMarkers, showToast]);

  return (
    <div className="dashboard">
      <div className="dashboard-map">
        <MapView
          addPointMode={addPointMode}
          onCancelAddPoint={() => setAddPointMode(false)}
          onPointAdded={() => {}}
          showCoordsDialog={showCoordsDialog}
          onCancelCoordsDialog={() => setShowCoordsDialog(false)}
          onMarkerSelect={handleMarkerSelect}
          lineOfSightMode={lineOfSightMode}
          selectedMarkers={selectedMarkers}
          onMarkerDrag={handleMarkerDrag}
          onAddLosPoint={handleAddLosPoint}
          traceResults={traceResults}
        />
      </div>
      <div className="dashboard-panel">
<RightPanel
            onLogout={onLogout}
            addPointMode={addPointMode}
            onToggleAddPoint={() => setAddPointMode(prev => !prev)}
            onAddByCoordinates={() => setShowCoordsDialog(true)}
            lineOfSightMode={lineOfSightMode}
            onToggleLineOfSight={handleToggleLineOfSight}
            selectedMarkers={selectedMarkers}
            onMarkerRemove={handleMarkerRemove}
            traceResults={traceResults}
            traceLoading={traceLoading}
            losStatus={losStatus}
            onExpandGraph={(index: number) => setExpandedGraph({ index })}
          />
        </div>
        {expandedGraph && traceResults[expandedGraph.index] && (
          <TerrainGraphExpanded
            traceData={traceResults[expandedGraph.index].traceData}
            fromElevation={traceResults[expandedGraph.index].fromElevation}
            toElevation={traceResults[expandedGraph.index].toElevation}
            fromLabel={traceResults[expandedGraph.index].fromLabel}
            toLabel={traceResults[expandedGraph.index].toLabel}
            onClose={() => setExpandedGraph(null)}
          />
        )}
      </div>
  );
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  return (
    <ToastProvider>
      <DashboardInner onLogout={onLogout} />
    </ToastProvider>
  );
}

function App() {
  const handleLogout = () => {
    window.location.href = '/login';
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            getStoredAuth().isAuthenticated
              ? <Navigate to="/" replace />
              : <LoginPage onLogin={() => window.location.href = '/'} />
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
