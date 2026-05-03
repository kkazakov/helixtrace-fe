# Line of Sight Analysis

**Type:** Explanation

The line-of-sight (LOS) analysis system computes whether radio signals can propagate between two or more points by analyzing terrain elevation data along the path, accounting for Earth's curvature. It includes a computation library, terrain visualization components, and map overlay rendering.

## Responsibility

- Computes LOS status (clear/blocked/unknown) between point pairs
- Accounts for Earth's curvature in LOS calculations
- Renders terrain profile graphs showing elevation data and LOS path
- Renders colored segments indicating blocked vs. clear terrain portions
- Provides both inline and expanded full-screen graph views

If this component is removed, the application loses its core radio planning capability — the ability to assess signal paths between network points.

## Public Interface

### `src/lib/los.ts`

| Export | Type | Description |
|---|---|---|
| `computeLOSStatus(traceData, fromElevation, toElevation)` | `(TraceResponse, number, number) => LOSStatus` | Computes clear/blocked/unknown status |
| `LOSStatus` | `type` | `'unknown' \| 'clear' \| 'blocked'` |

### `src/components/TerrainGraph/TerrainGraph.tsx`

| Export | Type | Description |
|---|---|---|
| `TerrainGraph` | React component | Inline terrain profile graph (320x160) |
| `TerrainGraphInner` | React component | Configurable-size terrain graph |
| `TerrainGraphExpandedSVG` | React component | Full-screen terrain graph (900x450) |

### `src/components/TerrainGraph/TerrainGraphExpanded.tsx`

| Export | Type | Description |
|---|---|---|
| `TerrainGraphExpanded` | React component | Full-screen overlay with expanded graph |

## Internal Structure

```
src/
├── lib/
│   └── los.ts                          # LOS computation library
└── components/
    └── TerrainGraph/
        ├── TerrainGraph.tsx             # Terrain graph components
        ├── TerrainGraph.css             # Graph styling
        ├── TerrainGraphExpanded.tsx     # Full-screen overlay wrapper
        ├── TerrainGraphExpanded.css     # Expanded overlay styling
        └── index.ts                     # Re-exports
```

### LOS Library (`src/lib/los.ts`)

The core computation module. Contains:

#### `haversineDistance` (`src/lib/los.ts:7-23`)

Computes the great-circle distance between two lat/lng points using the haversine formula. Uses Earth radius of 6,371,000 meters.

#### `computeLOSStatus` (`src/lib/los.ts:29-91`)

The main LOS computation function:
1. Validates trace data has at least 2 points
2. Computes total distance and cumulative distances between trace points
3. Calculates Earth curvature drop at each point: `(d * (totalDistance - d)) / (2 * EARTH_RADIUS)`
4. Subtracts curvature drop from terrain elevations
5. Scales elevations to Y coordinates
6. Computes LOS Y coordinate at each point via linear interpolation
7. Checks each terrain point against the LOS line — if terrain Y < LOS Y, the path is blocked
8. Returns `'blocked'` on first obstruction, `'clear'` if all points pass, `'unknown'` otherwise

### TerrainGraph Components (`src/components/TerrainGraph/TerrainGraph.tsx`)

#### `computeSegments` (`src/components/TerrainGraph/TerrainGraph.tsx:16-73`)

Segments the terrain profile into blocked and clear regions by tracking state transitions. Generates SVG path strings for each segment, filling the area between terrain and LOS line.

#### `renderGraph` / `renderSmallGraph` (`src/components/TerrainGraph/TerrainGraph.tsx:75-338`)

Shared rendering logic that computes:
- X/Y scales from trace data and dimensions
- Terrain path (SVG line string)
- LOS path (dashed red line)
- Blocked/clear segment paths
- Axis ticks with adaptive spacing

#### Graph Variants

| Component | Dimensions | Use Case |
|---|---|---|
| `TerrainGraph` | 320x160 | Inline in RightPanel |
| `TerrainGraphInner` | Configurable | Base renderer |
| `TerrainGraphExpandedSVG` | 900x450 responsive | Full-screen overlay |

## Dependencies

### Internal
- [Authentication](./authentication.md) — Uses `TraceResponse` type from auth service
- [MapView](./map-view.md) — Receives `traceResults` for polyline rendering

### External
- None (pure computation and rendering)

## Data Model

### `TraceResponse` (from `src/services/auth.ts`)
```typescript
interface TraceResponse {
  points: TracePoint[];
  count: number;
  distance_between_points: number;
  status: string;
}

interface TracePoint {
  lat: number;
  lng: number;
  elv: number;
}
```

### `LOSStatus`
```typescript
type LOSStatus = 'unknown' | 'clear' | 'blocked';
```

## Key Logic

### Earth Curvature Compensation (`src/lib/los.ts:58-60`)

The curvature drop formula `(d * (totalDistance - d)) / (2 * EARTH_RADIUS)` approximates how much the Earth's surface drops below a straight line at distance `d` from the start. This is critical for long-distance LOS analysis, as terrain that appears clear on a flat projection may be blocked by Earth's curvature.

### Blocked Detection (`src/lib/los.ts:25-27`)

```typescript
function isBlocked(terrainY: number, losY: number): boolean {
  return terrainY < losY;
}
```

In SVG coordinates, lower Y values are higher on screen. A terrain point is "blocked" if its Y coordinate is less than the LOS Y coordinate, meaning the terrain rises above the line of sight.

### Segment Rendering (`src/components/TerrainGraph/TerrainGraph.tsx:16-73`)

The `computeSegments` function walks through terrain points, tracking transitions between blocked and clear states. At each transition, it closes the current segment path and starts a new one. This produces separate SVG paths for blocked regions (red fill) and clear regions (green fill).

## Configuration

No direct configuration. The LOS library uses a fixed Earth radius constant (`EARTH_RADIUS = 6371000` meters).

## Design Decisions and Trade-offs

### Client-Side Computation

**Decision:** Compute LOS status entirely in the browser rather than on the backend.
**Rationale:** The backend provides terrain elevation data via `tracePath`. The frontend computes LOS status from this data, allowing immediate visualization without additional API calls. See [ADR-001](../architecture/adr/ADR-001-client-side-los-computation.md).
**Trade-off:** Computation runs on the main thread. For very long traces with many points, this could cause UI jank. Current implementation completes within acceptable time for typical traces.

### Curvature Approximation

**Decision:** Use a simple quadratic approximation for Earth curvature rather than a full geometric model.
**Rationale:** The formula `(d * (totalDistance - d)) / (2 * R)` provides sufficient accuracy for radio planning at distances under 100 km.
**Trade-off:** Less accurate for very long paths (>200 km). Adequate for the application's intended use case.

## Testing

No dedicated test files exist for the LOS computation or terrain graph components. Manual testing covers:
- Clear LOS between low-elevation points
- Blocked LOS with terrain obstruction
- 3-marker triangle analysis
- Graph expansion and rendering

## Related Components

- [MapView](./map-view.md) — Renders LOS polylines using trace results
- [RightPanel](./right-panel.md) — Displays TerrainGraph components in tools panel
- [Authentication](./authentication.md) — `tracePath` API call fetches terrain data from backend
