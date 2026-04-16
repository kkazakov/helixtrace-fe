import { getStoredAuth, clearAuth } from '../../services/auth';
import { ThemeToggle } from '../ThemeToggle/ThemeToggle';
import './RightPanel.css';

interface RightPanelProps {
  onLogout: () => void;
  addPointMode: boolean;
  onToggleAddPoint: () => void;
  onAddByCoordinates: () => void;
}

export function RightPanel({ onLogout, addPointMode, onToggleAddPoint, onAddByCoordinates }: RightPanelProps) {
  const auth = getStoredAuth();

  const handleLogout = () => {
    clearAuth();
    onLogout();
  };

  return (
    <div className="right-panel">
      <div className="panel-header">
        <div className="panel-header-left">
          <svg className="panel-logo" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="16" cy="16" r="6" stroke="currentColor" strokeWidth="1.5" />
            <line x1="16" y1="2" x2="16" y2="10" stroke="currentColor" strokeWidth="1.5" />
            <line x1="16" y1="22" x2="16" y2="30" stroke="currentColor" strokeWidth="1.5" />
            <line x1="2" y1="16" x2="10" y2="16" stroke="currentColor" strokeWidth="1.5" />
            <line x1="22" y1="16" x2="30" y2="16" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <span className="panel-title">Helixtrace</span>
        </div>
        <div className="panel-header-right">
          <ThemeToggle />
        </div>
      </div>

      <div className="panel-user">
        <div className="panel-user-avatar">
          {auth.username?.charAt(0).toUpperCase()}
        </div>
        <div className="panel-user-info">
          <span className="panel-user-name">{auth.username}</span>
          <span className="panel-user-email">{auth.email}</span>
        </div>
        <button className="panel-logout" onClick={handleLogout} aria-label="Logout">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>

      <div className="panel-section">
        <h3 className="panel-section-title">Tools</h3>
        <div className="panel-tools">
          <button className="panel-tool">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
            </svg>
            <span>Line of sight</span>
          </button>
          <button
            className={`panel-tool${addPointMode ? ' panel-tool-active' : ''}`}
            onClick={onToggleAddPoint}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            <span>{addPointMode ? 'Cancel' : 'Add point'}</span>
          </button>
          <button className="panel-tool" onClick={onAddByCoordinates}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            <span>Add by coordinates</span>
          </button>
          <button className="panel-tool">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="2" />
              <path d="M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20M2 12h20" />
            </svg>
            <span>Find optimal placement</span>
          </button>
        </div>
      </div>
    </div>
  );
}
