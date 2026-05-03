# Architecture Overview

**Type:** Explanation

Helixtrace Frontend is a single-page React application for planning and visualizing radio networks on an interactive map. The application connects to a backend API for authentication, point data, and terrain elevation traces. All LOS (line-of-sight) computation runs client-side.

## System Context

```
┌─────────────────────────────────────────────────────┐
│                   User (Browser)                     │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │           Helixtrace Frontend (SPA)            │  │
│  │                                                │  │
│  │  React 19 + TypeScript + Vite + Leaflet        │  │
│  └────────────────────┬───────────────────────────┘  │
│                       │ HTTPS                        │
└───────────────────────┼──────────────────────────────┘
                        │
                        ▼
              ┌─────────────────────┐
              │  Helixtrace Backend │
              │  (REST API)         │
              │                     │
              │  - Auth endpoints   │
              │  - Point CRUD       │
              │  - Terrain traces   │
              │  - Elevation info   │
              └─────────────────────┘
```

### Actors

| Actor | Description |
|---|---|
| Radio Network Planner | Primary user who creates points, analyzes LOS paths, and plans network infrastructure |
| Helixtrace Backend | REST API service providing authentication, point data, and terrain elevation traces |

### External Systems

| System | Role | Criticality |
|---|---|---|
| Helixtrace Backend | Authentication, point storage, terrain data | Required — application is non-functional without it |
| OpenStreetMap / ESRI / CARTO / etc. | Map tile providers | Required — map visualization depends on tile servers |
| Browser Geolocation API | Initial map positioning | Optional — falls back to default center |

## Containers

The application is a single deployable unit: a static SPA served from a web server or CDN.

```
┌──────────────────────────────────────────────────────┐
│              Helixtrace Frontend (SPA)               │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │  index.html + Vite-bundled JS + CSS            │  │
│  │  Served as static files                        │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  Technologies:                                       │
│  - React 19                                         │
│  - TypeScript 6                                     │
│  - Vite 8 (build tool)                              │
│  - Leaflet 1.9 + React Leaflet 5 (maps)             │
│  - React Router 7 (routing)                         │
└──────────────────────────────────────────────────────┘
```

## Components

| Component | Description | Documentation |
|---|---|---|
| Authentication | Login, registration, session management, route guards | [Authentication](./authentication.md) |
| MapView | Leaflet-based interactive map, markers, layers | [MapView](./map-view.md) |
| RightPanel | Dashboard control panel, tools, LOS results | [RightPanel](./right-panel.md) |
| Line of Sight Analysis | LOS computation library, terrain graphs | [Line of Sight Analysis](./line-of-sight.md) |
| Point Management | Add/edit dialogs, categories, marker icons | [Point Management](./point-management.md) |
| Theme System | Light/dark mode, CSS variables, persistence | [Theme System](./theme-system.md) |
| Toast Notifications | Context-based notification system | [Toast Notifications](./toast-notifications.md) |

## Data Flow

### Authentication Flow

```
User → LoginPage → POST /api/login → Backend → AuthResponse
                                    ↓
                              storeAuth(token, email)
                                    ↓
                              Navigate to / (Dashboard)
```

### Point Creation Flow

```
User clicks map → MapView captures coordinates
      ↓
  AddPointDialog opens
      ↓
  User fills label, category, visibility
      ↓
  POST /api/point → Backend → Point
      ↓
  MapView updates local state, shows toast
```

### Line of Sight Analysis Flow

```
User toggles LOS mode in RightPanel
      ↓
User clicks markers on map (up to 3)
      ↓
DashboardInner computes pairs (2 markers → 1 pair, 3 markers → 3 pairs)
      ↓
For each pair: GET /api/trace-path → Backend → TraceResponse
      ↓
computeLOSStatus(traceData, fromElev, toElev) → LOSStatus
      ↓
MapView renders colored polylines
RightPanel renders TerrainGraph for each pair
```

## Cross-Cutting Concerns

### Authentication

All API calls use `authenticatedFetch` (`src/services/auth.ts:94-111`), which attaches a Bearer token from localStorage. On 401/403 responses, the function clears auth and redirects to `/login`. The `ProtectedRoute` component guards the dashboard route.

### Error Handling

API errors are caught and displayed as toast notifications. The pattern is consistent across the codebase:
```typescript
try {
  await someApiCall();
} catch (err) {
  if (err instanceof Error) {
    showToast(err.message, 'error');
  }
}
```

### State Management

The application uses React's built-in state management:
- **Local component state:** `useState` for UI state within components
- **Parent state:** `DashboardInner` in `App.tsx` holds shared dashboard state (selected markers, trace results, mode flags)
- **Context:** `ToastContext` for global notifications, `useTheme` for theme state
- **localStorage:** Token, theme, and map layer persistence

No external state management library is used.

### Styling

The application uses CSS custom properties (variables) defined in `src/index.css` for theming. Components have co-located CSS files. The theme system switches variables via `data-theme` attribute on the `<html>` element.

### Routing

React Router 7 handles client-side routing with two routes:
- `/login` — Login page (redirects to `/` if authenticated)
- `/` — Dashboard (protected by `ProtectedRoute`)
- `/*` — Catch-all redirect to `/`

## Quality Attributes

### Performance

- Vite provides fast HMR during development and optimized production builds
- Leaflet marker icons are cached in a module-level Map to avoid regeneration
- Terrain graphs use `useMemo` for expensive computations
- No code splitting is currently configured; the entire application loads as one bundle

### Reliability

- Authentication state is validated on each API call
- Session expiration triggers automatic logout and redirect
- Geolocation failure falls back to a default map center

### Scalability

- The application is designed for single-user sessions
- Point data is fetched on component mount; no pagination or virtualization for large datasets
- LOS computation runs on the main thread; very long traces may cause UI jank

## External Dependencies

| Dependency | Version | Purpose |
|---|---|---|
| React | ^19.2.4 | UI framework |
| React DOM | ^19.2.4 | DOM renderer |
| React Router | ^7.14.1 | Client-side routing |
| Leaflet | ^1.9.4 | Interactive maps |
| React Leaflet | ^5.0.0 | React bindings for Leaflet |
| TypeScript | ~6.0.2 | Type checking |
| Vite | ^8.0.8 | Build tool and dev server |
| ESLint | ^9.39.4 | Linting |

## Directory Structure

```
/
├── src/
│   ├── components/          # React UI components
│   │   ├── AddPointDialog/  # Point creation dialog
│   │   ├── EditPointDialog/ # Point editing dialog
│   │   ├── Login/           # Login/registration page
│   │   ├── MapLayerToggle/  # Map layer selector
│   │   ├── MapView/         # Interactive map component
│   │   ├── ProtectedRoute/  # Route guard
│   │   ├── RightPanel/      # Dashboard control panel
│   │   ├── TerrainGraph/    # LOS terrain visualization
│   │   ├── ThemeToggle/     # Theme switch button
│   │   └── Toast/           # Toast styles
│   ├── context/             # React contexts
│   │   └── ToastContext.tsx # Global toast provider
│   ├── hooks/               # Custom React hooks
│   │   └── useTheme.ts      # Theme state management
│   ├── lib/                 # Utility libraries
│   │   └── los.ts           # Line-of-sight computation
│   ├── services/            # API clients and business logic
│   │   ├── auth.ts          # Authentication and point API
│   │   ├── distance.ts      # Haversine distance calculation
│   │   └── pointCategories.ts # Category definitions and icons
│   ├── types/               # TypeScript type definitions
│   │   └── toast.ts         # Toast type
│   ├── App.tsx              # Root component with routing
│   ├── App.css              # Dashboard layout styles
│   ├── main.tsx             # Application entry point
│   ├── index.css            # Base styles and CSS variables
│   └── vite-env.d.ts        # Vite type declarations
├── public/                  # Static assets
├── dist/                    # Production build output
├── docker-compose.yml       # Docker composition
├── Dockerfile               # Container build
├── deploy.sh                # Deployment script
├── run.sh                   # Development convenience script
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
├── eslint.config.js         # ESLint configuration
└── package.json             # Dependencies and scripts
```
