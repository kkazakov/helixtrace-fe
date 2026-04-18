import { useState } from 'react';
import { login, register, storeAuth } from '../../services/auth';
import { ThemeToggle } from '../ThemeToggle/ThemeToggle';
import './Login.css';

export function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let response;
      if (mode === 'register') {
        response = await register({ email, password });
      } else {
        response = await login({ email, password });
      }
      storeAuth({
        token: response.token,
        email: response.email,
        isAuthenticated: true,
      });
      onLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : (mode === 'register' ? 'Registration failed' : 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-grid" />
      </div>

      <div className="login-header">
        <ThemeToggle />
      </div>

      <div className="login-container">
        <div className="login-brand">
          <svg className="login-logo" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="16" cy="16" r="6" stroke="currentColor" strokeWidth="1.5" />
            <line x1="16" y1="2" x2="16" y2="10" stroke="currentColor" strokeWidth="1.5" />
            <line x1="16" y1="22" x2="16" y2="30" stroke="currentColor" strokeWidth="1.5" />
            <line x1="2" y1="16" x2="10" y2="16" stroke="currentColor" strokeWidth="1.5" />
            <line x1="22" y1="16" x2="30" y2="16" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <h1>Helixtrace</h1>
          <p className="login-subtitle">Radio network planner</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              required
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? (
              <span className="login-spinner" />
            ) : (
              mode === 'register' ? 'Register' : 'Sign in'
            )}
          </button>

          <button
            type="button"
            className="login-link"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setError('');
            }}
          >
            {mode === 'login' ? 'Register' : 'Back to Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
