import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './components/Login/Login';
import { MapView } from './components/MapView/MapView';
import { RightPanel } from './components/RightPanel/RightPanel';
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute';
import { getStoredAuth, type Point } from './services/auth';
import { ToastProvider } from './context/ToastContext';
import './App.css';

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [addPointMode, setAddPointMode] = useState(false);
  const [showCoordsDialog, setShowCoordsDialog] = useState(false);
  const [lineOfSightMode, setLineOfSightMode] = useState(false);
  const [selectedMarkers, setSelectedMarkers] = useState<Point[]>([]);

  const handleToggleLineOfSight = () => {
    setLineOfSightMode(prev => !prev);
    if (lineOfSightMode) {
      setSelectedMarkers([]);
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

  return (
    <ToastProvider>
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
          />
        </div>
      </div>
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
