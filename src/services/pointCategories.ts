import L from 'leaflet';

export const POINT_CATEGORIES = [
  { id: 1, key: 'poi', label: 'Point of interest' },
  { id: 2, key: 'repeater', label: 'Repeater' },
  { id: 3, key: 'unknown', label: 'Unknown' },
] as const;

const categoryColors: Record<number, string> = {
  1: '#e67e22',
  2: '#3498db',
  3: '#95a5a6',
};

export function getCategoryIcon(categoryId: number, selected?: boolean): L.DivIcon {
  const color = categoryColors[categoryId] || categoryColors[3];
  const fillColor = selected ? '#000000' : color;
  const strokeColor = selected ? '#000000' : color;
  return L.divIcon({
    className: `custom-marker point-marker${selected ? ' los-marker-highlight' : ''}`,
    html: `<svg width="20" height="28" viewBox="0 0 20 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 0C4.477 0 0 4.477 0 10c0 7 10 18 10 18s10-11 10-18C20 4.477 15.523 0 10 0z" fill="${fillColor}" stroke="${strokeColor}" stroke-width="1"/>
      <circle cx="10" cy="10" r="3.5" fill="#fff"/>
    </svg>`,
    iconSize: [20, 28],
    iconAnchor: [10, 28],
    popupAnchor: [0, -28],
  });
}
