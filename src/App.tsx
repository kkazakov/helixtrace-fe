import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './components/Login/Login';
import { MapView } from './components/MapView/MapView';
import { RightPanel } from './components/RightPanel/RightPanel';
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute';
import { getStoredAuth, type Point, type TraceResponse } from './services/auth';
import { tracePath } from './services/auth';
import { ToastProvider } from './context/ToastContext';
import { useToast } from './context/ToastContext';
import { TerrainGraphExpanded } from './components/TerrainGraph';
import './App.css';

function DashboardInner({ onLogout }: { onLogout: () => void }) {
  const { showToast } = useToast();
  const [addPointMode, setAddPointMode] = useState(false);
  const [showCoordsDialog, setShowCoordsDialog] = useState(false);
  const [lineOfSightMode, setLineOfSightMode] = useState(false);
  const [selectedMarkers, setSelectedMarkers] = useState<Point[]>([]);
  const [traceData, setTraceData] = useState<TraceResponse | null>(null);
  const [traceLoading, setTraceLoading] = useState(false);
  const [expandedGraph, setExpandedGraph] = useState(false);

  const handleToggleLineOfSight = () => {
    setLineOfSightMode(prev => !prev);
    if (lineOfSightMode) {
      setSelectedMarkers([]);
      setTraceData(null);
    }
  };

  const handleMarkerSelect = (point: Point) => {
    setSelectedMarkers(prev => {
      const exists = prev.find(m => m.id === point.id);
      if (exists) {
        return prev.filter(m => m.id !== point.id);
      }
      if (prev.length >= 2) {
        return prev;
      }
      return [...prev, point];
    });
  };

  const handleMarkerRemove = (id: string) => {
    setSelectedMarkers(prev => prev.filter(m => m.id !== id));
  };

  useEffect(() => {
    if (selectedMarkers.length === 2) {
      setTraceLoading(true);
      const [from, to] = selectedMarkers;
      tracePath(from.lat, from.lon, to.lat, to.lon)
        .then(data => {
          setTraceData(data);
          setTraceLoading(false);
        })
        .catch(err => {
          if (err instanceof Error) {
            showToast(err.message, 'error');
          }
          setTraceLoading(false);
        });
    } else {
      setTraceData(null);
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
            traceData={traceData}
            traceLoading={traceLoading}
            onExpandGraph={() => setExpandedGraph(true)}
          />
        </div>
        {expandedGraph && selectedMarkers.length === 2 && traceData && (
          <TerrainGraphExpanded
            traceData={traceData}
            fromElevation={selectedMarkers[0].elevation}
            toElevation={selectedMarkers[1].elevation}
            fromLabel={selectedMarkers[0].label}
            toLabel={selectedMarkers[1].label}
            onClose={() => setExpandedGraph(false)}
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
  const handleLogout = () => {};

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
