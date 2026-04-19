const API_BASE = (window as any).__API_BASE__ || 'http://127.0.0.1:8000';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  email: string;
}

export interface AuthState {
  token: string | null;
  email: string | null;
  isAuthenticated: boolean;
}

export interface Point {
  id: string;
  lat: number;
  lon: number;
  elevation: number;
  public: boolean;
  external: boolean;
  label: string;
  category_id: number;
}

export interface CreatePointPayload {
  lat: number;
  lon: number;
  public: boolean;
  label: string;
  category_id: number;
}

const STORAGE_KEY = 'helixtrace_auth';

function getStoredAuth(): AuthState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { token: null, email: null, isAuthenticated: false };
    const parsed = JSON.parse(raw);
    return { ...parsed, isAuthenticated: !!parsed.token };
  } catch {
    return { token: null, email: null, isAuthenticated: false };
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

export async function listPoints(includePublic = true): Promise<Point[]> {
  const res = await authenticatedFetch(
    `${API_BASE}/api/points?include_public=${includePublic}&include_meshcore_dashboard=true`
  );
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `Failed to list points: ${res.status}`);
  }
  return res.json();
}

export interface PointDetails {
  id: string;
  lat: number;
  lon: number;
  elevation: number;
  public: boolean;
  label: string;
  category_id: number;
  user: string;
}

export async function getPointDetails(pointId: string): Promise<PointDetails> {
  const res = await authenticatedFetch(`${API_BASE}/api/point/${pointId}`);
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `Failed to get point details: ${res.status}`);
  }
  const json = await res.json();
  return json.data;
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

export async function deletePoint(pointId: string): Promise<void> {
  const res = await authenticatedFetch(`${API_BASE}/api/point/${pointId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `Failed to delete point: ${res.status}`);
  }
}

export async function updatePoint(pointId: string, payload: Partial<CreatePointPayload>): Promise<Point> {
  const res = await authenticatedFetch(`${API_BASE}/api/point/${pointId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `Failed to update point: ${res.status}`);
  }
  return res.json();
}

export interface TracePoint {
  lat: number;
  lng: number;
  elv: number;
}

export interface TraceResponse {
  points: TracePoint[];
  count: number;
  distance_between_points: number;
  status: string;
}

export interface ElevationInfo {
  lat: number;
  lon: number;
  elevation: number;
}

export async function getElevationInfo(lat: number, lon: number): Promise<ElevationInfo> {
  const res = await authenticatedFetch(
    `${API_BASE}/api/point/info?lat=${lat}&lon=${lon}`
  );
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `Failed to get elevation: ${res.status}`);
  }
  const json = await res.json();
  return json.data;
}

export async function tracePath(fromLat: number, fromLng: number, toLat: number, toLng: number): Promise<TraceResponse> {
  const res = await authenticatedFetch(
    `${API_BASE}/api/trace-path?from=${fromLat},${fromLng}&to=${toLat},${toLng}`
  );
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `Failed to trace path: ${res.status}`);
  }
  return res.json();
}

export { getStoredAuth, storeAuth, clearAuth };
