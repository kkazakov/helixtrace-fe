import { type TraceResponse } from '../services/auth';

export type LOSStatus = 'unknown' | 'clear' | 'blocked';

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

  const elevations = points.map(p => p.elv);
  const minE = Math.min(...elevations, fromElevation, toElevation);
  const maxE = Math.max(...elevations, fromElevation, toElevation);
  const elevationRange = maxE - minE || 1;
  const ePadding = elevationRange * 0.1;
  const innerHeight = 100;

  const yScale = (elevation: number) =>
    innerHeight - ((elevation - (minE - ePadding)) / (elevationRange + ePadding * 2)) * innerHeight;

  const terrainYs = points.map(p => yScale(p.elv));
  const fromY = yScale(fromElevation);
  const toY = yScale(toElevation);

  const losYAt = (idx: number) => {
    const t = points.length > 1 ? idx / (points.length - 1) : 0;
    return fromY + t * (toY - fromY);
  };

  for (let i = 0; i < terrainYs.length; i++) {
    if (isBlocked(terrainYs[i], losYAt(i))) {
      return 'blocked';
    }
  }

  return 'clear';
}
