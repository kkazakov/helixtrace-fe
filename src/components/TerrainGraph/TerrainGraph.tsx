import { useMemo } from 'react';
import { type TraceResponse } from '../../services/auth';
import './TerrainGraph.css';

interface TerrainGraphInnerProps {
  traceData: TraceResponse;
  fromElevation: number;
  toElevation: number;
  fromLabel: string;
  toLabel: string;
  width: number;
  height: number;
  responsive?: boolean;
}

function computeSegments(
  points: TraceResponse['points'],
  distanceBetweenPoints: number,
  fromY: number,
  toY: number,
  xScale: (d: number) => number,
  yScale: (e: number) => number,
) {
  const terrainCoords = points.map((p, i) => ({
    x: xScale(i * distanceBetweenPoints),
    y: yScale(p.elv),
  }));

  const losYAt = (i: number) => {
    const t = points.length > 1 ? i / (points.length - 1) : 0;
    return fromY + t * (toY - fromY);
  };

  const blockedPaths: string[] = [];
  const clearPaths: string[] = [];

  let segStart = 0;
  let isBlocked = terrainCoords[0].y < losYAt(0);

  for (let i = 1; i < terrainCoords.length; i++) {
    const above = terrainCoords[i].y < losYAt(i);
    if (above !== isBlocked) {
      const paths = isBlocked ? blockedPaths : clearPaths;
      let d = `M ${terrainCoords[segStart].x.toFixed(1)} ${terrainCoords[segStart].y.toFixed(1)}`;
      for (let k = segStart + 1; k < i; k++) {
        d += ` L ${terrainCoords[k].x.toFixed(1)} ${terrainCoords[k].y.toFixed(1)}`;
      }
      d += ` L ${terrainCoords[i - 1].x.toFixed(1)} ${losYAt(i - 1).toFixed(1)}`;
      for (let k = i - 1; k >= segStart; k--) {
        d += ` L ${terrainCoords[k].x.toFixed(1)} ${losYAt(k).toFixed(1)}`;
      }
      d += ' Z';
      paths.push(d);
      segStart = i - 1;
      isBlocked = above;
    }
  }

  const paths = isBlocked ? blockedPaths : clearPaths;
  const last = terrainCoords.length - 1;
  let d = `M ${terrainCoords[segStart].x.toFixed(1)} ${terrainCoords[segStart].y.toFixed(1)}`;
  for (let k = segStart + 1; k <= last; k++) {
    d += ` L ${terrainCoords[k].x.toFixed(1)} ${terrainCoords[k].y.toFixed(1)}`;
  }
  d += ` L ${terrainCoords[last].x.toFixed(1)} ${losYAt(last).toFixed(1)}`;
  for (let k = last; k >= segStart; k--) {
    d += ` L ${terrainCoords[k].x.toFixed(1)} ${losYAt(k).toFixed(1)}`;
  }
  d += ' Z';
  paths.push(d);

  return { blockedPaths, clearPaths };
}

function renderGraph(
  traceData: TraceResponse,
  fromElevation: number,
  toElevation: number,
  dims: { width: number; height: number; top: number; right: number; bottom: number; left: number }
) {
  const innerWidth = dims.width - dims.left - dims.right;
  const innerHeight = dims.height - dims.top - dims.bottom;

  const result = useMemo(() => {
    const points = traceData.points;
    const totalDistance = (traceData.count - 1) * traceData.distance_between_points;

    const elevations = points.map(p => p.elv);
    const minE = Math.min(...elevations, fromElevation, toElevation);
    const maxE = Math.max(...elevations, fromElevation, toElevation);
    const elevationRange = maxE - minE || 1;
    const ePadding = elevationRange * 0.1;

    const xScale = (distance: number) => dims.left + (distance / totalDistance) * innerWidth;
    const yScale = (elevation: number) => innerHeight - ((elevation - (minE - ePadding)) / (elevationRange + ePadding * 2)) * innerHeight;

    const terrainPath = points.map((p, i) => {
      const distance = i * traceData.distance_between_points;
      const x = xScale(distance);
      const y = yScale(p.elv);
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');

    const fromX = xScale(0);
    const fromY = yScale(fromElevation);
    const toX = xScale(totalDistance);
    const toY = yScale(toElevation);
    const losPath = `M ${fromX} ${fromY} L ${toX} ${toY}`;

    const { blockedPaths, clearPaths } = computeSegments(
      points, traceData.distance_between_points, fromY, toY, xScale, yScale,
    );

    return {
      terrainPath, losPath, blockedPaths, clearPaths,
      minElevation: minE - ePadding, maxElevation: maxE + ePadding,
      xScale, yScale,
    };
  }, [traceData, fromElevation, toElevation, innerWidth, innerHeight]);

  const yTicks = useMemo(() => {
    const ticks: number[] = [];
    const range = (result.maxElevation as number) - (result.minElevation as number);
    const step = range > 500 ? 200 : range > 200 ? 100 : range > 100 ? 50 : 20;
    const start = Math.ceil((result.minElevation as number) / step) * step;
    const end = Math.floor((result.maxElevation as number) / step) * step;
    for (let v = start; v <= end; v += step) {
      ticks.push(v);
    }
    return ticks;
  }, [result.minElevation, result.maxElevation]);

  const xTicks = useMemo(() => {
    const ticks: number[] = [];
    const totalDistance = (traceData.count - 1) * traceData.distance_between_points;
    const step = totalDistance > 5000 ? 1000 : totalDistance > 2000 ? 500 : 200;
    for (let d = 0; d <= totalDistance; d += step) {
      ticks.push(d);
    }

    const avgLabelWidth = 30;
    const minGap = avgLabelWidth;
    const filtered: number[] = [];
    let lastX = -minGap;
    for (const tick of ticks) {
      const x = result.xScale(tick);
      if (x >= lastX + minGap) {
        filtered.push(tick);
        lastX = x;
      }
    }
    return filtered;
  }, [traceData, result.xScale, innerWidth]);

  return { ...result, yTicks, xTicks };
}

export function TerrainGraphInner({ traceData, fromElevation, toElevation, fromLabel, toLabel, width, height, responsive }: TerrainGraphInnerProps) {
  const dims = { width, height, top: 24, right: 48, bottom: 36, left: 48 };
  const { terrainPath, losPath, blockedPaths, clearPaths, xScale, yScale, yTicks, xTicks } = renderGraph(traceData, fromElevation, toElevation, dims);

  return (
    <svg width={responsive ? '100%' : dims.width} height={responsive ? '100%' : dims.height} viewBox={`0 0 ${dims.width} ${dims.height}`} className="terrain-graph">
      <defs>
        <clipPath id={`clip-${fromLabel}-${toLabel}`}>
          <rect x={dims.left} y={dims.top} width={dims.width - dims.left - dims.right} height={dims.height - dims.bottom} />
        </clipPath>
      </defs>

      {yTicks.map(tick => {
        const y = yScale(tick);
        return (
          <g key={`y-${tick}`}>
            <line x1={dims.left} y1={y} x2={dims.width - dims.right} y2={y} stroke="var(--border-subtle)" strokeDasharray="2,3" />
            <text x={dims.left - 6} y={y + 4} textAnchor="end" fill="var(--text-tertiary)" fontSize="9" fontFamily="var(--font-mono)">
              {tick}
            </text>
            <text x={dims.width - 6} y={y + 4} textAnchor="end" fill="var(--text-tertiary)" fontSize="9" fontFamily="var(--font-mono)">
              {tick}
            </text>
          </g>
        );
      })}

      {xTicks.map(tick => {
        const x = xScale(tick);
        const label = tick >= 1000 ? `${(tick / 1000).toFixed(1)}km` : `${tick}m`;
        return (
          <g key={`x-${tick}`}>
            <line x1={x} y1={dims.top} x2={x} y2={dims.height - dims.bottom} stroke="var(--border-subtle)" strokeDasharray="2,3" />
            <text x={x} y={dims.height - dims.bottom + 14} textAnchor="middle" fill="var(--text-tertiary)" fontSize="9" fontFamily="var(--font-mono)">
              {label}
            </text>
          </g>
        );
      })}

      <g clipPath={`url(#clip-${fromLabel}-${toLabel})`}>
        {clearPaths.map((d, i) => (
          <path key={`clear-${i}`} d={d} fill="rgba(76,175,80,0.25)" />
        ))}
        {blockedPaths.map((d, i) => (
          <path key={`blocked-${i}`} d={d} fill="rgba(244,67,54,0.25)" />
        ))}
        <path d={terrainPath} fill="none" stroke="var(--accent)" strokeWidth="1.5" />
        <path d={losPath} stroke="#d32f2f" strokeWidth="1.5" strokeDasharray="4,3" fill="none" />
      </g>

      <text x={dims.left} y={dims.height - 2} fill="var(--text-primary)" fontSize="10" fontWeight="600">
        {fromLabel}
      </text>
      <text x={dims.width - dims.right} y={dims.height - 2} textAnchor="end" fill="var(--text-primary)" fontSize="10" fontWeight="600">
        {toLabel}
      </text>

      <text x={(dims.left + dims.width - dims.right) / 2} y={dims.height - 2} textAnchor="middle" fill="var(--text-tertiary)" fontSize="9">
        Distance (m)
      </text>
    </svg>
  );
}

interface TerrainGraphExpandedSVGProps {
  traceData: TraceResponse;
  fromElevation: number;
  toElevation: number;
  fromLabel: string;
  toLabel: string;
}

export function TerrainGraphExpandedSVG({ traceData, fromElevation, toElevation, fromLabel, toLabel }: TerrainGraphExpandedSVGProps) {
  return (
    <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 16 }}>
      <TerrainGraphInner
        traceData={traceData}
        fromElevation={fromElevation}
        toElevation={toElevation}
        fromLabel={fromLabel}
        toLabel={toLabel}
        width={900}
        height={450}
        responsive
      />
    </div>
  );
}

interface TerrainGraphProps {
  traceData: TraceResponse;
  fromElevation: number;
  toElevation: number;
  fromLabel: string;
  toLabel: string;
  onExpand?: () => void;
}

function renderSmallGraph(
  traceData: TraceResponse,
  fromElevation: number,
  toElevation: number,
  dims: { width: number; height: number; top: number; right: number; bottom: number; left: number }
) {
  const innerWidth = dims.width - dims.left - dims.right;
  const innerHeight = dims.height - dims.top - dims.bottom;

  const result = useMemo(() => {
    const points = traceData.points;
    const totalDistance = (traceData.count - 1) * traceData.distance_between_points;

    const elevations = points.map(p => p.elv);
    const minE = Math.min(...elevations, fromElevation, toElevation);
    const maxE = Math.max(...elevations, fromElevation, toElevation);
    const elevationRange = maxE - minE || 1;
    const ePadding = elevationRange * 0.1;

    const xScale = (distance: number) => dims.left + (distance / totalDistance) * innerWidth;
    const yScale = (elevation: number) => innerHeight - ((elevation - (minE - ePadding)) / (elevationRange + ePadding * 2)) * innerHeight;

    const terrainPath = points.map((p, i) => {
      const distance = i * traceData.distance_between_points;
      const x = xScale(distance);
      const y = yScale(p.elv);
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');

    const fromX = xScale(0);
    const fromY = yScale(fromElevation);
    const toX = xScale(totalDistance);
    const toY = yScale(toElevation);
    const losPath = `M ${fromX} ${fromY} L ${toX} ${toY}`;

    const { blockedPaths, clearPaths } = computeSegments(
      points, traceData.distance_between_points, fromY, toY, xScale, yScale,
    );

    return {
      terrainPath, losPath, blockedPaths, clearPaths,
      minElevation: minE - ePadding, maxElevation: maxE + ePadding,
      xScale, yScale,
    };
  }, [traceData, fromElevation, toElevation, innerWidth, innerHeight]);

  const yTicks = useMemo(() => {
    const ticks: number[] = [];
    const range = (result.maxElevation as number) - (result.minElevation as number);
    const step = range > 500 ? 200 : range > 200 ? 100 : range > 100 ? 50 : 20;
    const start = Math.ceil((result.minElevation as number) / step) * step;
    const end = Math.floor((result.maxElevation as number) / step) * step;
    for (let v = start; v <= end; v += step) {
      ticks.push(v);
    }
    return ticks;
  }, [result.minElevation, result.maxElevation]);

  const xTicks = useMemo(() => {
    const ticks: number[] = [];
    const totalDistance = (traceData.count - 1) * traceData.distance_between_points;
    const step = totalDistance > 5000 ? 1000 : totalDistance > 2000 ? 500 : 200;
    for (let d = 0; d <= totalDistance; d += step) {
      ticks.push(d);
    }

    const avgLabelWidth = 30;
    const minGap = avgLabelWidth;
    const filtered: number[] = [];
    let lastX = -minGap;
    for (const tick of ticks) {
      const x = result.xScale(tick);
      if (x >= lastX + minGap) {
        filtered.push(tick);
        lastX = x;
      }
    }
    return filtered;
  }, [traceData, result.xScale, innerWidth]);

  return { ...result, yTicks, xTicks };
}

export function TerrainGraph({ traceData, fromElevation, toElevation, fromLabel, toLabel, onExpand }: TerrainGraphProps) {
  const dims = { width: 320, height: 160, top: 24, right: 48, bottom: 36, left: 48 };
  const { terrainPath, losPath, blockedPaths, clearPaths, xScale, yScale, yTicks, xTicks } = renderSmallGraph(traceData, fromElevation, toElevation, dims);

  return (
    <div className="terrain-graph-container">
      <button className="terrain-expand-btn" onClick={onExpand} title="Expand graph">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
        </svg>
      </button>
      <svg width={dims.width} height={dims.height} viewBox={`0 0 ${dims.width} ${dims.height}`} className="terrain-graph">
        <defs>
          <clipPath id={`clip-${fromLabel}-${toLabel}`}>
            <rect x={dims.left} y={dims.top} width={dims.width - dims.left - dims.right} height={dims.height - dims.bottom} />
          </clipPath>
        </defs>

        {yTicks.map(tick => {
          const y = yScale(tick);
          return (
            <g key={`y-${tick}`}>
              <line x1={dims.left} y1={y} x2={dims.width - dims.right} y2={y} stroke="var(--border-subtle)" strokeDasharray="2,3" />
              <text x={dims.left - 6} y={y + 4} textAnchor="end" fill="var(--text-tertiary)" fontSize="9" fontFamily="var(--font-mono)">
                {tick}
              </text>
              <text x={dims.width - 6} y={y + 4} textAnchor="end" fill="var(--text-tertiary)" fontSize="9" fontFamily="var(--font-mono)">
                {tick}
              </text>
            </g>
          );
        })}

        {xTicks.map(tick => {
          const x = xScale(tick);
          const label = tick >= 1000 ? `${(tick / 1000).toFixed(1)}km` : `${tick}m`;
          return (
            <g key={`x-${tick}`}>
              <line x1={x} y1={dims.top} x2={x} y2={dims.height - dims.bottom} stroke="var(--border-subtle)" strokeDasharray="2,3" />
              <text x={x} y={dims.height - dims.bottom + 14} textAnchor="middle" fill="var(--text-tertiary)" fontSize="9" fontFamily="var(--font-mono)">
                {label}
              </text>
            </g>
          );
        })}

        <g clipPath={`url(#clip-${fromLabel}-${toLabel})`}>
          {clearPaths.map((d, i) => (
            <path key={`clear-${i}`} d={d} fill="rgba(76,175,80,0.25)" />
          ))}
          {blockedPaths.map((d, i) => (
            <path key={`blocked-${i}`} d={d} fill="rgba(244,67,54,0.25)" />
          ))}
          <path d={terrainPath} fill="none" stroke="var(--accent)" strokeWidth="1.5" />
          <path d={losPath} stroke="#d32f2f" strokeWidth="1.5" strokeDasharray="4,3" fill="none" />
        </g>

        <text x={dims.left} y={dims.height - 2} fill="var(--text-primary)" fontSize="10" fontWeight="600">
          {fromLabel}
        </text>
        <text x={dims.width - dims.right} y={dims.height - 2} textAnchor="end" fill="var(--text-primary)" fontSize="10" fontWeight="600">
          {toLabel}
        </text>

        <text x={(dims.left + dims.width - dims.right) / 2} y={dims.height - 2} textAnchor="middle" fill="var(--text-tertiary)" fontSize="9">
          Distance (m)
        </text>
      </svg>
    </div>
  );
}
