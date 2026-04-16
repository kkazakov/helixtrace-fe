import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './components/Login/Login';
import { MapView } from './components/MapView/MapView';
import { RightPanel } from './components/RightPanel/RightPanel';
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute';
import { getStoredAuth } from './services/auth';
import './App.css';

function Dashboard({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="dashboard">
      <div className="dashboard-map">
        <MapView />
      </div>
      <div className="dashboard-panel">
        <RightPanel onLogout={onLogout} />
      </div>
    </div>
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
