const API_BASE = 'http://127.0.0.1:8000';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  username: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  username: string;
}

export interface AuthState {
  token: string | null;
  email: string | null;
  username: string | null;
  isAuthenticated: boolean;
}

export interface Point {
  id: string;
  lat: number;
  lon: number;
  elevation: number;
  public: boolean;
  label: string;
  category_id: number;
}

export interface CreatePointPayload {
  lat: number;
  lon: number;
  elevation: number;
  public: boolean;
  label: string;
  category_id: number;
}

const STORAGE_KEY = 'helixtrace_auth';

function getStoredAuth(): AuthState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { token: null, email: null, username: null, isAuthenticated: false };
    const parsed = JSON.parse(raw);
    return { ...parsed, isAuthenticated: !!parsed.token };
  } catch {
    return { token: null, email: null, username: null, isAuthenticated: false };
  }
}

function storeAuth(auth: AuthState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
}

function clearAuth() {
  localStorage.removeItem(STORAGE_KEY);
}

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `Login failed: ${res.status}`);
  }

  return res.json();
}

export async function register(credentials: RegisterCredentials): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `Registration failed: ${res.status}`);
  }

  return res.json();
}

export async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const auth = getStoredAuth();
  const res = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      ...(auth.token ? { 'Authorization': `Bearer ${auth.token}` } : {}),
    },
  });

  if (res.status === 401 || res.status === 403) {
    clearAuth();
    window.location.href = '/login';
    throw new Error('Session expired');
  }

  return res;
}

export async function listPoints(includePublic = false): Promise<Point[]> {
  const res = await authenticatedFetch(
    `${API_BASE}/api/points?include_public=${includePublic}`
  );
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `Failed to list points: ${res.status}`);
  }
  return res.json();
}

export async function createPoint(payload: CreatePointPayload): Promise<Point> {
  const res = await authenticatedFetch(`${API_BASE}/api/point`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `Failed to create point: ${res.status}`);
  }
  return res.json();
}

export { getStoredAuth, storeAuth, clearAuth };
