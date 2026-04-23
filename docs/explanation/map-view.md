# MapView

**Type:** Explanation

The MapView component renders the Leaflet-based interactive map that serves as the primary visualization surface for the Helixtrace application. It handles marker rendering, map interactions, point CRUD operations, line-of-sight visualization, and map layer switching.

## Responsibility

- Renders an interactive Leaflet map with configurable tile layers
- Displays point markers with category-based icons and popups
- Handles point creation via map click or coordinate dialog
- Supports point editing and deletion through popup actions
- Renders line-of-sight polylines and temporary markers during LOS analysis
- Manages map center tracking and geolocation initialization

If this component is removed, the application loses its primary visualization interface and all map-based interactions.

## Public Interface

### `src/components/MapView/MapView.tsx`

| Prop | Type | Description |
|---|---|---|
| `addPointMode` | `boolean` | Enables click-to-add-point mode |
| `onCancelAddPoint` | `() => void` | Callback to exit add-point mode |
| `onPointAdded` | `() => void` | Callback when a point is created |
| `showCoordsDialog` | `boolean` | Shows coordinate-based add dialog |
| `onCancelCoordsDialog` | `() => void` | Callback to close coordinate dialog |
| `onMarkerSelect` | `(point: Point) => void` | Callback when a marker is selected in LOS mode |
| `lineOfSightMode` | `boolean` | Enables LOS analysis mode |
| `selectedMarkers` | `Point[]` | Markers selected for LOS analysis |
| `onMarkerDrag` | `(id, lat, lon) => void` | Callback when a temp LOS marker is dragged |
| `onAddLosPoint` | `(lat, lon) => void` | Callback when map is clicked in LOS mode |
| `onMarkerRemove` | `(id) => void` | Callback to remove a selected LOS marker |
| `traceResults` | `TraceResult[]` | LOS trace results for rendering polylines |

## Internal Structure

```
src/components/MapView/
├── MapView.tsx        # Main map component with all sub-components
├── MapView.css        # Map container and overlay styles
└── index.ts           # Re-export
```

The MapView file is a single large module (706 lines) containing multiple internal components:

### Internal Components

| Component | Purpose |
|---|---|
| `PointMarker` | Renders a single point marker with popup, edit/delete actions |
| `LocationMarker` | Initializes map view via browser geolocation |
| `MapClickHandler` | Captures map clicks for add-point and LOS modes |
| `MapCenter` | Programs map center when a point is added |
| `MapCenterTracker` | Tracks map center changes for coordinate dialog |
| `LineOfSightLine` | Renders LOS polylines between selected markers |
| `ElevationLabel` | Renders elevation labels above LOS markers |
| `TempLosMarker` | Renders draggable temporary markers for LOS analysis |

### PointMarker (`src/components/MapView/MapView.tsx:14-202`)

The `PointMarker` component renders a Leaflet marker for a single point. Key behaviors:
- Shows a popup with point details (label, coordinates, elevation, visibility, type)
- In LOS mode, disables popups and triggers `onMarkerSelect` on click
- Fetches point details via `getPointDetails()` to show owner information
- Renders edit/delete icons in popup for the point owner
- Supports dragging for temporary LOS markers

### LineOfSightLine (`src/components/MapView/MapView.tsx:286-357`)

Renders polylines between selected markers for LOS analysis:
- Colors lines green (clear), red (blocked), or gray (unknown)
- Uses dashed lines when fewer than 2 of 3 paths are clear in 3-marker mode
- Adjusts colors based on map layer (lighter colors for ESRI satellite)

### LocationMarker (`src/components/MapView/MapView.tsx:206-229`)

Initializes the map view:
- Attempts browser geolocation first
- Falls back to Athens, Greece `[42.6977, 23.3215]` at zoom 12

## Dependencies

### Internal
- [Authentication](./authentication.md) — Uses `listPoints`, `createPoint`, `getPointDetails`, `deletePoint`, `updatePoint`, `getStoredAuth`
- [Point Management](./point-management.md) — Uses `POINT_CATEGORIES`, `getCategoryIcon`
- [Toast Notifications](./toast-notifications.md) — Uses `useToast` for error/success messages
- [Theme System](./theme-system.md) — Uses `useTheme` for CartoDB layer auto-switching
- [Line of Sight Analysis](./line-of-sight.md) — Receives `traceResults` for polyline rendering

### External
- **Leaflet** — Core mapping library
- **react-leaflet** — React bindings for Leaflet
- **Browser Geolocation API** — For initial map positioning

## Data Model

### `Point` (from `src/services/auth.ts`)
```typescript
interface Point {
  id: string;
  lat: number;
  lon: number;
  elevation: number;
  public: boolean;
  external: boolean;
  label: string;
  category_id: number;
}
```

### `TraceResult` (local to MapView)
```typescript
interface TraceResult {
  traceData: TraceResponse;
  fromElevation: number;
  toElevation: number;
  fromLabel: string;
  toLabel: string;
  losStatus: 'unknown' | 'clear' | 'blocked';
}
```

## Key Logic

### Map Layer Management (`src/components/MapView/MapView.tsx:459-473`)

The component supports 6 tile layers:
- `osm` — OpenStreetMap (default)
- `opentopomap` — OpenTopoMap
- `stamenterrain` — Stamen Terrain
- `esri` — ESRI Satellite
- `cartodb_positron` — CARTO light theme
- `cartodb_dark` — CARTO dark theme

Persistence via `localStorage` key `helixtrace_maplayer`. When `cartodb` is stored, the component auto-switches between positron/dark based on the current theme.

### Point CRUD Operations (`src/components/MapView/MapView.tsx:520-582`)

- **Create:** `savePoint` calls `createPoint()`, appends to local state, centers map on new point
- **Update:** `handlePointUpdated` calls `updatePoint()`, patches local state
- **Delete:** `handlePointDeleted` calls `deletePoint()`, filters from local state

### Popup Owner Detection (`src/components/MapView/MapView.tsx:71-155`)

When a marker is selected, the component fetches point details to determine ownership. Edit and delete icons only appear if `data.user === currentUser`.

## Configuration

| localStorage Key | Purpose | Values |
|---|---|---|
| `helixtrace_maplayer` | Persistent map layer preference | `osm`, `opentopomap`, `stamenterrain`, `esri`, `cartodb_positron`, `cartodb_dark`, `cartodb` |

## Design Decisions and Trade-offs

### Single File Component (`src/components/MapView/MapView.tsx`)

**Decision:** Keep all map-related sub-components in a single file.
**Rationale:** Tight coupling between components through shared Leaflet map instance and props. Splitting would require passing many props through intermediate components.
**Trade-off:** The file exceeds 700 lines, making it harder to navigate. Consider splitting if the component grows further.

### Client-Side Point State

**Decision:** Maintain point list in component state rather than a global store.
**Rationale:** The map view is the sole consumer of point data. A global store would add complexity without benefit.
**Trade-off:** Points are re-fetched on component mount. No real-time updates from other tabs or users.

### Default Map Center

**Decision:** Default to Athens, Greece `[42.6977, 23.3215]`.
**Trade-off:** Users in other regions see an unexpected default view. Mitigated by geolocation auto-detection.

## Testing

No dedicated test files exist for the MapView component. Manual testing covers:
- Point creation via map click and coordinate dialog
- Point editing and deletion
- LOS mode marker selection and polyline rendering
- Map layer switching
- Geolocation fallback

## Related Components

- [RightPanel](./right-panel.md) — Controls add-point mode, LOS mode, and coordinate dialog
- [Point Management](./point-management.md) — AddPointDialog and EditPointDialog triggered by MapView
- [Line of Sight Analysis](./line-of-sight.md) — Trace results rendered as polylines
