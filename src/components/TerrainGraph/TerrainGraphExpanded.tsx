import { TerrainGraphExpandedSVG } from './TerrainGraph';
import { type TraceResponse } from '../../services/auth';
import './TerrainGraphExpanded.css';

interface TerrainGraphExpandedProps {
  traceData: TraceResponse;
  fromElevation: number;
  toElevation: number;
  fromLabel: string;
  toLabel: string;
  onClose: () => void;
}

export function TerrainGraphExpanded({ traceData, fromElevation, toElevation, fromLabel, toLabel, onClose }: TerrainGraphExpandedProps) {
  return (
    <div className="terrain-expanded-overlay" onClick={onClose}>
      <div className="terrain-expanded" onClick={e => e.stopPropagation()}>
        <button className="terrain-expanded-close" onClick={onClose}>×</button>
        <TerrainGraphExpandedSVG
          traceData={traceData}
          fromElevation={fromElevation}
          toElevation={toElevation}
          fromLabel={fromLabel}
          toLabel={toLabel}
        />
      </div>
    </div>
  );
}
