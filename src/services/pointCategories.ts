import L from 'leaflet';

export const POINT_CATEGORIES = [
  { id: 1, key: 'poi', label: 'Point of interest' },
  { id: 2, key: 'repeater', label: 'Repeater' },
  { id: 3, key: 'unknown', label: 'Unknown' },
] as const;

const markerSvg = (color: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41">
    <path fill="${color}" d="M12.5 0C5.6 0 0 5.6 0 12.5c0 8.8 12.5 28 12.5 28s12.5-19.2 12.5-28C25 5.6 19.4 0 12.5 0z"/>
    <circle fill="white" cx="12.5" cy="12.5" r="5"/>
  </svg>`;

const iconCache = new Map<string, L.Icon>();

const categoryColors: Record<number, Record<string, string>> = {
  1: { true: '#1976d2', false: '#7b1fa2' },
  2: { true: '#388e3c', false: '#d32f2f' },
  3: { true: '#f9a825', false: '#ef6c00' },
};

export function getCategoryIcon(categoryId: number, public_: boolean, selected?: boolean): L.Icon {
  const color = selected ? '#000000' : (categoryColors[categoryId]?.[String(public_)] ?? '#f9a825');
  const key = `${categoryId}-${public_ ? 'p' : 'v'}-${selected ? 's' : 'n'}`;
  const cached = iconCache.get(key);
  if (cached) return cached;
  const icon = L.icon({
    iconUrl: `data:image/svg+xml,${encodeURIComponent(markerSvg(color))}`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });
  iconCache.set(key, icon);
  return icon;
}
