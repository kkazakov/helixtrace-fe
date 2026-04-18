import L from 'leaflet';

export const POINT_CATEGORIES = [
  { id: 1, key: 'poi', label: 'Point of interest' },
  { id: 2, key: 'repeater', label: 'Repeater' },
  { id: 3, key: 'unknown', label: 'Unknown' },
] as const;

const categoryIcons: Record<number, string> = {
  1: `<svg width="20" height="28" viewBox="0 0 20 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="5" y1="0" x2="5" y2="28" stroke="currentColor" stroke-width="1.5"/>
      <path d="M5 3L17 7L5 11V3Z" fill="currentColor"/>
    </svg>`,
  2: `<svg width="20" height="28" viewBox="0 0 20 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="10" y1="4" x2="10" y2="28" stroke="currentColor" stroke-width="1.5"/>
      <circle cx="10" cy="3" r="1.5" fill="currentColor"/>
      <line x1="6" y1="10" x2="14" y2="10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="7" y1="16" x2="13" y2="16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="8" y1="22" x2="12" y2="22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,
  3: `<svg width="20" height="28" viewBox="0 0 20 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 0C4.477 0 0 4.477 0 10c0 7 10 18 10 18s10-11 10-18C20 4.477 15.523 0 10 0z" fill="currentColor"/>
      <circle cx="10" cy="10" r="3.5" fill="white"/>
    </svg>`,
};

const iconCache = new Map<string, L.DivIcon>();

export function getCategoryIcon(categoryId: number, public_: boolean, selected?: boolean): L.DivIcon {
  const color = selected ? '#000000' : (public_ ? '#2e7d32' : '#e67d22');
  const key = `${categoryId}-${public_ ? 'p' : 'v'}-${selected ? 's' : 'n'}`;
  const cached = iconCache.get(key);
  if (cached) return cached;
  const iconSvg = categoryIcons[categoryId] || categoryIcons[3];
  const icon = L.divIcon({
    className: `custom-marker point-marker${selected ? ' los-marker-highlight' : ''}`,
    html: iconSvg.replace(/currentColor/g, color),
    iconSize: [20, 28],
    iconAnchor: [10, 28],
    popupAnchor: [0, -28],
  });
  iconCache.set(key, icon);
  return icon;
}
