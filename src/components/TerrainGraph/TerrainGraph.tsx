import { useMemo } from 'react';
import { type TraceResponse } from '../../services/auth';
import './TerrainGraph.css';

interface TerrainGraphProps {
  traceData: TraceResponse;
  fromElevation: number;
  toElevation: number;
  fromLabel: string;
  toLabel: string;
}

export function TerrainGraph({ traceData, fromElevation, toElevation, fromLabel, toLabel }: TerrainGraphProps) {
  const dims = { width: 320, height: 160, top: 24, right: 16, bottom: 36, left: 48 };
  const innerWidth = dims.width - dims.left - dims.right;
  const innerHeight = dims.height - dims.top - dims.bottom;

  const { terrainPath, losPath, minElevation, maxElevation, xScale, yScale } = useMemo(() => {
    const points = traceData.points;
    const totalDistance = traceData.count * traceData.distance_between_points;

    const elevations = points.map(p => p.elv);
    const minE = Math.min(...elevations, fromElevation, toElevation);
    const maxE = Math.max(...elevations, fromElevation, toElevation);
    const elevationRange = maxE - minE || 1;
    const ePadding = elevationRange * 0.1;

    const xScale = (distance: number) => (distance / totalDistance) * innerWidth;
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

    return { terrainPath, losPath, minElevation: minE - ePadding, maxElevation: maxE + ePadding, xScale, yScale };
  }, [traceData, fromElevation, toElevation, innerWidth, innerHeight]);

  const yTicks = useMemo(() => {
    const ticks = [];
    const range = (maxElevation as number) - (minElevation as number);
    const step = range > 500 ? 200 : range > 200 ? 100 : range > 100 ? 50 : 20;
    const start = Math.ceil((minElevation as number) / step) * step;
    const end = Math.floor((maxElevation as number) / step) * step;
    for (let v = start; v <= end; v += step) {
      ticks.push(v);
    }
    return ticks;
  }, [minElevation, maxElevation]);

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
      const x = xScale(tick);
      if (x >= lastX + minGap) {
        filtered.push(tick);
        lastX = x;
      }
    }
    return filtered;
  }, [traceData, xScale, innerWidth]);

  return (
    <svg width={dims.width} height={dims.height} viewBox={`0 0 ${dims.width} ${dims.height}`} className="terrain-graph">
      <defs>
        <linearGradient id="terrainFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.05" />
        </linearGradient>
      </defs>

      {yTicks.map(tick => {
        const y = yScale(tick);
        return (
          <g key={`y-${tick}`}>
            <line x1={dims.left} y1={y} x2={dims.width - dims.right} y2={y} stroke="var(--border-subtle)" strokeDasharray="2,3" />
            <text x={dims.left - 6} y={y + 4} textAnchor="end" fill="var(--text-tertiary)" fontSize="9" fontFamily="var(--font-mono)">
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

      <path d={terrainPath} fill="url(#terrainFill)" stroke="var(--accent)" strokeWidth="1.5" />
      <path d={losPath} stroke="#d32f2f" strokeWidth="1.5" strokeDasharray="4,3" fill="none" />

      <text x={dims.left} y={dims.height - 2} fill="var(--text-primary)" fontSize="10" fontWeight="600">
        {fromLabel}
      </text>
      <text x={dims.width - dims.right} y={dims.height - 2} textAnchor="end" fill="var(--text-primary)" fontSize="10" fontWeight="600">
        {toLabel}
      </text>

      <text x={dims.width / 2} y={dims.height - 2} textAnchor="middle" fill="var(--text-tertiary)" fontSize="9">
        Distance (m)
      </text>
    </svg>
  );
}
