# Point Management

**Type:** Explanation

The point management system handles the creation, editing, categorization, and visual representation of radio network points on the map. It includes dialog components for point input, category definitions, and marker icon generation.

## Responsibility

- Provides dialog UI for adding new points via map click or manual coordinates
- Provides dialog UI for editing existing point properties
- Defines point categories with labels and visual markers
- Generates cached SVG marker icons with color coding by category and visibility
- Manages marker icon lifecycle and caching

If this component is removed, users cannot add or edit points, and the map loses its visual markers.

## Public Interface

### `src/components/AddPointDialog/AddPointDialog.tsx`

| Prop | Type | Description |
|---|---|---|
| `lat` | `number` | Initial latitude |
| `lon` | `number` | Initial longitude |
| `editableCoords` | `boolean` | Allow editing coordinates (default: false) |
| `onSave` | `(lat, lon, label, categoryId, isPublic) => void` | Save callback |
| `onCancel` | `() => void` | Cancel callback |

### `src/components/EditPointDialog/EditPointDialog.tsx`

| Prop | Type | Description |
|---|---|---|
| `lat` | `number` | Current latitude |
| `lon` | `number` | Current longitude |
| `label` | `string` | Current label |
| `categoryId` | `number` | Current category ID |
| `isPublic` | `boolean` | Current visibility |
| `onSave` | `(lat, lon, label, categoryId, isPublic) => void` | Save callback |
| `onCancel` | `() => void` | Cancel callback |

### `src/services/pointCategories.ts`

| Export | Type | Description |
|---|---|---|
| `POINT_CATEGORIES` | `readonly array` | Category definitions with id, key, label |
| `getCategoryIcon(categoryId, public_, selected?, external?)` | `(number, boolean, boolean?, boolean?) => L.Icon` | Generate/cached marker icon |

## Internal Structure

```
src/
├── services/
│   └── pointCategories.ts      # Category definitions, icon generation, caching
├── components/
│   ├── AddPointDialog/
│   │   ├── AddPointDialog.tsx  # Dialog for adding new points
│   │   └── AddPointDialog.css  # Dialog styles
│   └── EditPointDialog/
│       ├── EditPointDialog.tsx # Dialog for editing existing points
│       └── EditPointDialog.css # Dialog styles
```

### Point Categories (`src/services/pointCategories.ts:3-7`)

Three categories are defined:

| ID | Key | Label |
|---|---|---|
| 1 | `poi` | Point of interest |
| 2 | `repeater` | Repeater |
| 3 | `unknown` | Unknown |

### Marker Icon System (`src/services/pointCategories.ts:9-40`)

The icon system generates SVG marker icons with color coding:

#### Color Matrix

| Category | Public | Private |
|---|---|---|
| POI (1) | `#1976d2` (blue) | `#7b1fa2` (purple) |
| Repeater (2) | `#2e7d32` (green) | `#d32f2f` (red) |
| Unknown (3) | `#f9a825` (amber) | `#ef6c00` (orange) |

Special cases:
- Selected markers: `#000000` (black)
- External repeaters: `#388e3c` (dark green)

#### Icon Caching (`src/services/pointCategories.ts:15`)

Icons are cached in a `Map<string, L.Icon>` using a composite key: `${categoryId}-${public_ ? 'p' : 'v'}-${selected ? 's' : 'n'}-${external ? 'e' : 'i'}`. This avoids regenerating SVG data URIs for repeated icon requests.

### Dialog Components

Both `AddPointDialog` and `EditPointDialog` share the same form structure:
- Latitude field (read-only in AddPointDialog unless `editableCoords` is true)
- Longitude field (read-only in AddPointDialog unless `editableCoords` is true)
- Label text input
- Category dropdown (select from `POINT_CATEGORIES`)
- Public visibility checkbox

The dialogs use an overlay pattern with click-outside-to-close behavior.

## Dependencies

### Internal
- [Authentication](./authentication.md) — Point data types (`Point`, `CreatePointPayload`) defined in auth service
- [MapView](./map-view.md) — Dialogs are rendered by MapView; icons are consumed by PointMarker

### External
- **Leaflet** — `L.Icon` type for marker icons

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

### `CreatePointPayload` (from `src/services/auth.ts`)
```typescript
interface CreatePointPayload {
  lat: number;
  lon: number;
  public: boolean;
  label: string;
  category_id: number;
}
```

## Key Logic

### Icon Cache Key Generation (`src/services/pointCategories.ts:29`)

The cache key encodes four dimensions: category ID, visibility (public/visible), selection state, and external status. This ensures each visual variant gets a unique cached icon.

### SVG Marker Generation (`src/services/pointCategories.ts:9-13`)

Markers are generated as inline SVG data URIs with a teardrop shape and centered white circle. The SVG is encoded and prefixed with `data:image/svg+xml,` for use as a Leaflet icon URL.

## Configuration

No direct configuration. Categories are hardcoded in `POINT_CATEGORIES`. Adding new categories requires updating both the categories array and the `categoryColors` mapping.

## Design Decisions and Trade-offs

### Hardcoded Categories

**Decision:** Define categories as a constant array rather than fetching from the backend.
**Rationale:** The category set is small and stable. Avoiding an API call simplifies the initialization flow.
**Trade-off:** Adding or removing categories requires a frontend deployment. If the backend supports dynamic categories, the frontend would need to be updated to fetch them.

### Icon Caching Strategy

**Decision:** Cache icons in a module-level `Map` rather than React state or memoization.
**Rationale:** Icons are pure functions of their parameters and never change during a session. A module-level cache persists across component mounts and unmounts.
**Trade-off:** The cache is never cleared, creating a small memory leak if many unique icon variants are generated. In practice, the number of variants is bounded (3 categories × 2 visibility × 2 selection × 2 external = 24 max).

### Dialog Reuse Pattern

**Decision:** Use the same `AddPointDialog` component for both click-to-add and coordinate-based add flows, differentiated by the `editableCoords` prop.
**Rationale:** The forms are nearly identical. The `editableCoords` flag controls whether coordinate fields are inputs or read-only spans.
**Trade-off:** The component has conditional rendering logic that adds complexity. A separate component could be cleaner but would duplicate most of the form code.

## Testing

No dedicated test files exist for the point management components. Manual testing covers:
- Point creation via map click dialog
- Point creation via coordinate dialog
- Point editing via popup action
- Category selection and icon rendering
- Public/private visibility toggle

## Related Components

- [MapView](./map-view.md) — Renders dialogs and consumes category icons
- [Authentication](./authentication.md) — Point data types and API calls
