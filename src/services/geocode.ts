import { authenticatedFetch } from './auth';

export interface GeocodeResult {
  id: string;
  name: string;
  display_name: string;
  lat: number;
  lon: number;
  type: string;
}

export interface GeocodeResponse {
  results: GeocodeResult[];
}

export async function geocode(query: string, limit = 50): Promise<GeocodeResponse> {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
  const res = await authenticatedFetch(
    `${API_BASE}/api/geocode?q=${encodeURIComponent(query)}&limit=${limit}`
  );
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `Geocoding failed: ${res.status}`);
  }
  return res.json();
}
