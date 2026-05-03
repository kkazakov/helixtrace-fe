# Developer Reference

**Type:** Reference

This document describes the technical machinery of the Helixtrace Frontend codebase. Use it as a dictionary to understand conventions, patterns, file organization, and expectations when contributing.

---

## Development Environment

| Requirement | Version | Purpose |
|---|---|---|
| Node.js | Latest LTS recommended | Runtime and package management |
| npm | Bundled with Node.js | Dependency installation and script execution |
| Helixtrace Backend | Running and accessible | Provides REST API for auth, points, and terrain data |

### Environment Variables

Define variables in a `.env` file at the project root. Do not commit `.env` files.

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_BASE_URL` | `http://127.0.0.1:8000` | Backend API base URL |

Vite exposes only variables prefixed with `VITE_` to the client-side code.

---

## Project Structure

```
/
├── src/
│   ├── components/          # React UI components (co-located CSS)
│   │   ├── AddPointDialog/
│   │   ├── EditPointDialog/
│   │   ├── Login/
│   │   ├── MapLayerToggle/
│   │   ├── MapView/
│   │   ├── ProtectedRoute/
│   │   ├── RightPanel/
│   │   ├── TerrainGraph/
│   │   ├── ThemeToggle/
│   │   └── Toast/
│   ├── context/             # React Context providers
│   │   └── ToastContext.tsx
│   ├── hooks/               # Custom React hooks
│   │   └── useTheme.ts
│   ├── lib/                 # Domain-specific utility libraries
│   │   └── los.ts           # Line-of-sight computation
│   ├── services/            # API clients and business logic
│   │   ├── auth.ts          # Authentication and point API
│   │   ├── distance.ts      # Haversine distance calculation
│   │   └── pointCategories.ts # Category definitions and icons
│   ├── types/               # TypeScript type definitions
│   │   └── toast.ts
│   ├── App.tsx              # Root component with routing and dashboard state
│   ├── App.css              # Dashboard layout styles
│   ├── main.tsx             # Application entry point
│   ├── index.css            # Base styles and CSS variables
│   └── vite-env.d.ts        # Vite type declarations
├── public/                  # Static assets copied to dist/
├── dist/                    # Production build output (generated)
├── docs/                    # Project documentation
├── docker-compose.yml       # Docker composition
├── Dockerfile               # Container build
├── deploy.sh                # Deployment script
├── run.sh                   # Development convenience script
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
├── tsconfig.app.json        # TypeScript configuration for the app
├── tsconfig.node.json       # TypeScript configuration for Vite/Node tooling
├── eslint.config.js         # ESLint configuration
└── package.json             # Dependencies and scripts
```

### Where to Add New Code

| If you are adding... | Place it in... |
|---|---|
| A new UI component | `src/components/ComponentName/` with `.tsx` and `.css` |
| A new reusable hook | `src/hooks/useHookName.ts` |
| A new API client function | `src/services/` (group by domain, e.g., `auth.ts` for auth/points) |
| A new pure utility | `src/lib/` if domain-specific, or a new file in `src/services/` if data-related |
| A new global type | `src/types/` |
| A new context | `src/context/` |

---

## Build System

### Vite Configuration

The project uses Vite 8 as the build tool and development server. Key behaviors:

- **Entry point:** `index.html` → `src/main.tsx`
- **Dev server:** Runs on `http://localhost:5173` by default
- **HMR:** Enabled for rapid development iteration
- **Production build:** Outputs to `dist/`
- **No code splitting** is currently configured; the application builds as a single bundle

### Available Scripts

| Script | Command | Purpose |
|---|---|---|
| `dev` | `vite` | Start development server |
| `build` | `tsc -b && vite build` | Type-check and build for production |
| `preview` | `vite preview` | Preview the production build locally |
| `lint` | `eslint .` | Run ESLint across the entire project |

### TypeScript Project References

The project uses TypeScript project references for clean separation:

- **`tsconfig.json`**: Root configuration referencing the two sub-projects
- **`tsconfig.app.json`**: Application source code compilation settings
- **`tsconfig.node.json`**: Vite configuration and tooling compilation settings

When building, `tsc -b` resolves references in the correct order.

---

## Coding Conventions

### Naming

| Construct | Convention | Example |
|---|---|---|
| Components | PascalCase | `MapView.tsx`, `RightPanel.tsx` |
| Component directories | PascalCase | `AddPointDialog/` |
| Hooks | camelCase, prefixed with `use` | `useTheme.ts` |
| Services / utilities | camelCase | `auth.ts`, `distance.ts` |
| Types / interfaces | PascalCase | `Point`, `TraceResult`, `LOSStatus` |
| CSS files | Co-located, same base name | `MapView.tsx` + `MapView.css` |

### File Organization

- Components are **co-located** in directories containing the `.tsx` file and any supporting files (e.g., CSS)
- Each component file should export its primary component as a named export or default export consistently
- Avoid default exports for utility functions; prefer named exports

### React Patterns

- **Functional components only.** No class components.
- **Props interfaces** are defined inline or immediately above the component.
- **State lifting:** Shared dashboard state lives in `DashboardInner` (`App.tsx`) and is passed down via props.

### TypeScript Strictness

The project uses TypeScript 6 with strict checking. Key expectations:

- Explicit typing for function parameters and return types in services and utilities
- Avoid `any`; use `unknown` with type guards when necessary
- The `!` non-null assertion is acceptable only when the runtime guarantee is obvious (e.g., `document.getElementById('root')!`)

---

## State Management Patterns

The application does **not** use an external state management library. State is managed through three mechanisms:

### 1. Local Component State (`useState`)

Used for UI state scoped to a single component (e.g., dialog open/close, form inputs).

### 2. Parent State (`DashboardInner`)

`DashboardInner` in `App.tsx` holds all shared dashboard state:

| State | Type | Purpose |
|---|---|---|
| `addPointMode` | `boolean` | Toggle for map click-to-add-point mode |
| `showCoordsDialog` | `boolean` | Toggle for coordinate input dialog |
| `lineOfSightMode` | `boolean` | Toggle for LOS analysis mode |
| `selectedMarkers` | `Point[]` | Currently selected LOS markers (max 3) |
| `traceResults` | `TraceResult[]` | Computed LOS trace data and status |
| `losStatus` | `LOSStatus` | Aggregated clear/blocked/unknown status |
| `traceLoading` | `boolean` | Loading indicator for trace fetches |
| `expandedGraph` | `{ index: number } \| null` | Which terrain graph is expanded |

`DashboardInner` computes side effects (trace fetches, LOS computation) in a `useEffect` triggered by `selectedMarkers` changes.

### 3. Context

| Context | Location | Purpose |
|---|---|---|
| `ToastContext` | `src/context/ToastContext.tsx` | Global notification queue and `showToast()` function |
| `useTheme` | `src/hooks/useTheme.ts` | Theme state (light/dark), persistence, cross-tab sync |

Contexts are used for truly global concerns that many components need to access without deep prop drilling.

### 4. `localStorage` Persistence

| Key | Data | Set by |
|---|---|---|
| Auth token | JWT string | `authenticatedFetch` / login flow |
| Theme preference | `"light"` or `"dark"` | `useTheme` hook |
| Map layer | Layer identifier | `MapLayerToggle` component |

---

## API & Service Patterns

### `authenticatedFetch`

All API calls must use `authenticatedFetch` (`src/services/auth.ts`), which:

1. Attaches a `Bearer` token from `localStorage`
2. On `401`/`403` responses, clears auth state and redirects to `/login`
3. Returns the parsed JSON response

### Error Handling Pattern

API errors are caught and surfaced as toast notifications. The standard pattern is:

```typescript
try {
  await someApiCall();
} catch (err) {
  if (err instanceof Error) {
    showToast(err.message, 'error');
  }
}
```

### Service Structure

| File | Responsibility |
|---|---|
| `src/services/auth.ts` | Authentication endpoints, point CRUD, terrain trace fetching, `authenticatedFetch` |
| `src/services/distance.ts` | Haversine distance calculation between coordinates |
| `src/services/pointCategories.ts` | Category definitions, colors, and SVG icon mapping |

When adding a new backend endpoint, add the fetch function to the appropriate service file. Group related endpoints together (e.g., point operations live in `auth.ts` alongside auth operations because they share the same `authenticatedFetch` mechanism).

---

## Component Patterns

### Co-located CSS

Each major component has a dedicated directory containing:

- `ComponentName.tsx`
- `ComponentName.css` (if styles are specific)

Global styles and CSS variables live in `src/index.css`.

### Props Interface Conventions

Define props as an interface immediately before the component. Use destructuring in the function signature:

```typescript
interface MyComponentProps {
  value: string;
  onChange: (value: string) => void;
}

function MyComponent({ value, onChange }: MyComponentProps) {
  // ...
}
```

### Dialog Patterns

Dialogs follow a controlled pattern:

- Parent holds `isOpen` state
- Dialog receives `isOpen`, `onClose`, and `onSubmit` props
- Dialogs are rendered conditionally in the parent JSX

Example: `AddPointDialog` and `EditPointDialog`

### Leaflet Integration

- `MapView` encapsulates all Leaflet logic
- `React Leaflet` components are used where possible
- Map layer state is managed inside `MapView` with persistence to `localStorage`
- Marker icons are cached in a module-level `Map` to avoid SVG regeneration

---

## Styling & Theming

### CSS Custom Properties

The theme system uses CSS custom properties defined in `src/index.css`. Variables are scoped to the `:root` element and overridden via a `data-theme` attribute on `<html>`.

### Theme Switching

The `useTheme` hook manages the active theme. It:

1. Reads the initial theme from `localStorage` or defaults to system preference
2. Sets `document.documentElement.dataset.theme`
3. Persists changes to `localStorage`
4. Listens for `storage` events to sync across browser tabs

### Adding Theme-Aware Styles

Always use CSS custom properties instead of hardcoded colors. For example:

```css
.my-component {
  background-color: var(--bg-primary);
  color: var(--text-primary);
}
```

---

## Map & LOS Integration

### Communication Between MapView and RightPanel

`MapView` and `RightPanel` do not communicate directly. All coordination flows through `DashboardInner` in `App.tsx`:

```
DashboardInner (state + callbacks)
    ├── MapView (props: mode flags, selected markers, trace results)
    └── RightPanel (props: mode flags, selected markers, trace results, callbacks)
```

### Trace Caching

LOS trace data is cached in a `useRef<Record<string, TraceResponse>>` inside `DashboardInner`. The cache key is a string of the form `${from.lat},${from.lon}-${to.lat},${to.lon}`. This prevents redundant API calls when markers are dragged or reselected.

### LOS Computation Placement

The `computeLOSStatus` function from `src/lib/los.ts` is called inside the `useEffect` in `DashboardInner` after trace data is fetched. It runs synchronously on the main thread. Keep this in mind when modifying the algorithm — long traces may cause UI jank.

### Marker Selection Rules

- Maximum **3** markers for LOS analysis
- Clicking an existing marker removes it from the selection
- Temporary LOS markers (created by clicking on the map in LOS mode) receive IDs prefixed with `temp-los-`

---

## Linting & Quality

### ESLint Configuration

The project uses ESLint 9 with the flat config format (`eslint.config.js`).

| Plugin / Config | Purpose |
|---|---|
| `@eslint/js` | Core ESLint recommended rules |
| `typescript-eslint` | TypeScript-aware linting |
| `eslint-plugin-react-hooks` | Rules of Hooks enforcement |
| `eslint-plugin-react-refresh` | Fast Refresh compatibility |

Run linting with:

```bash
npm run lint
```

### Expectations

- All code should pass `npm run lint` without errors
- TypeScript compilation (`tsc -b`) must succeed before building
- No `console.log` statements should be left in production code
- Hooks must follow the Rules of Hooks (only called at top level, only in React functions)

---

## Adding a Feature: Checklist

Use this checklist when implementing a new feature:

1. **Types** — Add or update TypeScript interfaces in `src/types/` or inline if component-scoped
2. **Services** — Add API functions to the appropriate file in `src/services/`
3. **Library code** — Add pure/domain logic to `src/lib/`
4. **Components** — Create a new directory under `src/components/` with `.tsx` and `.css`
5. **State** — If the feature needs shared state, add it to `DashboardInner` in `App.tsx` and thread props down
6. **Routing** — If a new route is needed, add it to the `Routes` in `App.tsx`
7. **Error handling** — Wrap API calls in `try/catch` and use `showToast()` for errors
8. **Documentation** — Update the relevant Explanation or Reference document if the change affects architecture or developer workflows
9. **Lint** — Run `npm run lint` and fix any issues

---

## External Dependencies

| Dependency | Version | Purpose |
|---|---|---|
| `react` | `^19.2.4` | UI framework |
| `react-dom` | `^19.2.4` | DOM renderer |
| `react-router-dom` | `^7.14.1` | Client-side routing |
| `leaflet` | `^1.9.4` | Interactive maps |
| `react-leaflet` | `^5.0.0` | React bindings for Leaflet |

When adding a new dependency, consider:

- Is the functionality already achievable with existing libraries?
- Does the library increase bundle size significantly?
- Is it compatible with React 19 and Vite 8?

Always run `npm install <package>` and commit `package-lock.json`.
