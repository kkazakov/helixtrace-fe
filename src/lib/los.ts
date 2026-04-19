import { type TraceResponse } from '../services/auth';

export type LOSStatus = 'unknown' | 'clear' | 'blocked';

const EARTH_RADIUS = 6371000;

function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return EARTH_RADIUS * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function isBlocked(terrainY: number, losY: number): boolean {
  return terrainY < losY;
}

export function computeLOSStatus(
  traceData: TraceResponse,
  fromElevation: number,
  toElevation: number,
): LOSStatus {
  if (!traceData || traceData.points.length < 2) {
    return 'unknown';
  }

  const points = traceData.points;
  const first = points[0];
  const last = points[points.length - 1];
  const totalDistance = haversineDistance(
    first.lat,
    first.lng,
    last.lat,
    last.lng,
  );

  const cumulativeDistances: number[] = [0];
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    cumulativeDistances.push(
      cumulativeDistances[i - 1] +
        haversineDistance(prev.lat, prev.lng, curr.lat, curr.lng),
    );
  }

  const curvatureDrops = cumulativeDistances.map(d =>
    totalDistance > 0 ? (d * (totalDistance - d)) / (2 * EARTH_RADIUS) : 0,
  );

  const elevations = points.map((p, i) => p.elv - curvatureDrops[i]);
  const allElevations = [...elevations, fromElevation, toElevation];
  const minE = Math.min(...allElevations);
  const maxE = Math.max(...allElevations);
  const elevationRange = maxE - minE || 1;
  const ePadding = elevationRange * 0.1;
  const innerHeight = 100;

  const yScale = (elevation: number) =>
    innerHeight -
    ((elevation - (minE - ePadding)) / (elevationRange + ePadding * 2)) *
      innerHeight;

  const terrainYs = elevations.map(e => yScale(e));
  const fromY = yScale(fromElevation);
  const toY = yScale(toElevation);

  const losYAt = (idx: number) => {
    const t = points.length > 1 ? idx / (points.length - 1) : 0;
    return fromY + t * (toY - fromY);
  };

  for (let i = 1; i < terrainYs.length - 1; i++) {
    if (isBlocked(terrainYs[i], losYAt(i))) {
      return 'blocked';
    }
  }

  return 'clear';
}
