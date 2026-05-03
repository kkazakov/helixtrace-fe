# RightPanel

**Type:** Explanation

The RightPanel component is the dashboard control panel that provides tool controls, user information, and line-of-sight analysis results display. It sits alongside the MapView as the primary interaction surface for the dashboard.

## Responsibility

- Displays user information and logout button
- Provides tool toggles for add-point mode and line-of-sight analysis
- Shows selected LOS markers with removal controls
- Displays distance calculations between selected markers
- Renders terrain graph previews for each LOS trace result
- Handles graph expansion to full-screen view

If this component is removed, users lose the primary control interface for map tools and cannot view LOS analysis results.

## Public Interface

### `src/components/RightPanel/RightPanel.tsx`

| Prop | Type | Description |
|---|---|---|
| `onLogout` | `() => void` | Callback to trigger logout |
| `addPointMode` | `boolean` | Whether add-point mode is active |
| `onToggleAddPoint` | `() => void` | Toggle add-point mode |
| `onAddByCoordinates` | `() => void` | Open coordinate-based add dialog |
| `lineOfSightMode` | `boolean` | Whether LOS mode is active |
| `onToggleLineOfSight` | `() => void` | Toggle LOS mode |
| `selectedMarkers` | `Point[]` | Markers selected for LOS analysis |
| `onMarkerRemove` | `(id) => void` | Remove a selected LOS marker |
| `traceResults` | `TraceResult[]` | LOS trace results with terrain data |
| `traceLoading` | `boolean` | Whether LOS traces are being computed |
| `losStatus` | `'unknown' \| 'clear' \| 'blocked'` | Overall LOS status |
| `onExpandGraph` | `(index) => void` | Expand a terrain graph to full screen |

## Internal Structure

```
src/components/RightPanel/
├── RightPanel.tsx        # Control panel component
├── RightPanel.css        # Panel layout and styling
└── index.ts              # Re-export
```

### Layout Sections

The panel is divided into three sections:

1. **Header** — Application logo, title, and theme toggle
2. **User Bar** — User avatar (from email initial), email display, logout button
3. **Tools Section** — Tool buttons and LOS analysis results

### Tools

| Tool | Button Label | Action |
|---|---|---|
| Line of Sight | "Line of sight" | Toggles LOS analysis mode |
| Add by Click | "Add point by click" / "Cancel" | Toggles click-to-add mode |
| Add by Coordinates | "Add by coordinates" | Opens coordinate dialog |
| Optimal Placement | "Find optimal placement" | Placeholder (not yet implemented) |

## Dependencies

### Internal
- [Authentication](./authentication.md) — Uses `getStoredAuth()`, `clearAuth()` for user info and logout
- [Point Management](./point-management.md) — Uses `formatDistance` from distance service
- [Line of Sight Analysis](./line-of-sight.md) — Displays `TerrainGraph` components for trace results
- [Theme System](./theme-system.md) — Contains `ThemeToggle` in header

### External
- None directly (relies on internal components for external dependencies)

## Data Model

### `TraceResult` (local to RightPanel)
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

### Logout Flow (`src/components/RightPanel/RightPanel.tsx:34-37`)

The `handleLogout` function calls `clearAuth()` to remove the stored token, then triggers the `onLogout` callback which navigates to `/login`.

### Distance Display (`src/components/RightPanel/RightPanel.tsx:132-165`)

For 2 selected markers, shows a single distance. For 3 markers, shows all 3 pairwise distances separated by `/`. Uses `calculateDistance` (haversine) and `formatDistance` from the distance service.

### LOS Results Rendering (`src/components/RightPanel/RightPanel.tsx:173-191`)

When `selectedMarkers.length >= 2` and traces are complete:
- Shows a loading spinner while `traceLoading` is true
- Renders a `TerrainGraph` for each trace result
- Each graph has an expand button to view full-screen

## Configuration

No direct configuration. The panel inherits behavior from parent state managed in `App.tsx`.

## Design Decisions and Trade-offs

### State Ownership in App.tsx

**Decision:** The RightPanel is a presentational component — all state lives in `DashboardInner` (`src/App.tsx:24-197`).
**Rationale:** The panel shares state with MapView (selected markers, trace results, mode flags). Centralizing state in the parent avoids prop drilling and state synchronization issues.
**Trade-off:** The panel receives many props (12+), making its interface complex. The parent component (`DashboardInner`) becomes the orchestrator for all dashboard logic.

### Placeholder Tool Button

**Decision:** Include "Find optimal placement" button without implementation.
**Rationale:** Reserves UI space for a planned feature, maintaining layout consistency.
**Trade-off:** The button is non-functional, which may confuse users. Consider hiding until implementation begins.

## Testing

No dedicated test files exist for the RightPanel component. Manual testing covers:
- Tool toggle interactions
- LOS marker list and removal
- Distance calculation display
- Terrain graph rendering and expansion
- Logout flow

## Related Components

- [MapView](./map-view.md) — Coordinated through shared parent state in App.tsx
- [Line of Sight Analysis](./line-of-sight.md) — TerrainGraph components display trace results
- [Authentication](./authentication.md) — User info display and logout
