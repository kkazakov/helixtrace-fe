# Theme System

**Type:** Explanation

The theme system provides light and dark mode support across the application. It uses CSS custom properties (variables) for styling, a React hook for state management, localStorage for persistence, and cross-tab synchronization via the StorageEvent API.

## Responsibility

- Manages light/dark theme state
- Persists theme preference to localStorage
- Detects and follows system color scheme preference
- Synchronizes theme across browser tabs
- Provides a toggle button component
- Applies theme via CSS custom properties on the root element

If this component is removed, the application loses theme switching capability and defaults to the browser's system preference.

## Public Interface

### `src/hooks/useTheme.ts`

| Export | Type | Description |
|---|---|---|
| `useTheme()` | `() => { theme: Theme; toggle: () => void; setTheme: (t: Theme) => void }` | Theme state and controls hook |

### `src/components/ThemeToggle/ThemeToggle.tsx`

| Export | Type | Description |
|---|---|---|
| `ThemeToggle` | React component | Sun/moon toggle button |

## Internal Structure

```
src/
├── hooks/
│   └── useTheme.ts              # Theme state management hook
├── components/
│   └── ThemeToggle/
│       ├── ThemeToggle.tsx      # Toggle button component
│       ├── ThemeToggle.css      # Button styling
│       └── index.ts             # Re-export
└── index.css                    # CSS variable definitions for both themes
```

### useTheme Hook (`src/hooks/useTheme.ts`)

The hook manages theme state through three effects:

#### Initial Theme (`src/hooks/useTheme.ts:9-13`)

`getInitialTheme` checks localStorage first, then falls back to the system preference via `window.matchMedia('(prefers-color-scheme: dark)')`.

#### Theme Application (`src/hooks/useTheme.ts:18-22`)

On theme change:
1. Sets `data-theme` attribute on `<html>` element
2. Persists to localStorage with key `helixtrace_theme`
3. Dispatches a `StorageEvent` to notify other tabs

#### System Preference Listener (`src/hooks/useTheme.ts:24-34`)

Listens for `prefers-color-scheme` changes. Only updates theme if no explicit preference is stored in localStorage, allowing system preference to serve as the default.

#### Cross-Tab Sync (`src/hooks/useTheme.ts:36-44`)

Listens for `StorageEvent` on the `helixtrace_theme` key. When another tab changes the theme, this listener updates the local state to match.

### CSS Variables (`src/index.css`)

The application uses CSS custom properties for all color values. Two theme blocks are defined:

- `[data-theme="light"]` — Explicit light theme variables
- `[data-theme="dark"]` — Explicit dark theme variables
- `:root` — Default variables (light theme)
- `@media (prefers-color-scheme: dark)` — System preference fallback

### Variable Categories

| Category | Variables |
|---|---|
| Background | `--bg-primary`, `--bg-secondary`, `--bg-tertiary`, `--bg-panel`, `--bg-input`, `--bg-input-focus`, `--bg-hover`, `--bg-active` |
| Text | `--text-primary`, `--text-secondary`, `--text-tertiary`, `--text-inverse` |
| Border | `--border-subtle`, `--border-medium`, `--border-focus` |
| Accent | `--accent`, `--accent-hover`, `--accent-light` |
| Status | `--error`, `--error-light`, `--success`, `--success-light` |
| Shadow | `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-xl` |
| Radius | `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl` |
| Font | `--font-body`, `--font-mono` |
| Transition | `--transition-fast`, `--transition-base`, `--transition-slow` |
| Layout | `--sidebar-width`, `--header-height` |

## Dependencies

### Internal
- None (foundational component used by other components)

### External
- **Browser APIs:** `localStorage`, `window.matchMedia`, `StorageEvent`

## Data Model

### `Theme`
```typescript
type Theme = 'light' | 'dark';
```

## Key Logic

### Theme Priority (`src/hooks/useTheme.ts:24-34`)

The system implements a priority order for theme selection:
1. Explicit user preference (localStorage) — highest priority
2. System color scheme preference — fallback
3. Default light theme — ultimate fallback

The system preference listener only activates when no explicit preference is stored, ensuring user choice always wins.

### Cross-Tab Synchronization (`src/hooks/useTheme.ts:36-44`)

When a user toggles the theme in one tab:
1. The `useEffect` in `useTheme` dispatches a `StorageEvent`
2. Other tabs receive the event via their `storage` event listener
3. Each tab updates its local theme state to match

This pattern works because `StorageEvent` fires in other browsing contexts, not the one that made the change.

## Configuration

| localStorage Key | Purpose | Values |
|---|---|---|
| `helixtrace_theme` | Persistent theme preference | `light`, `dark` |

## Design Decisions and Trade-offs

### CSS Custom Properties

**Decision:** Use CSS variables rather than CSS-in-JS or separate stylesheet loading.
**Rationale:** Zero-runtime overhead, instant theme switching, and broad browser support. Variables are defined once in `index.css` and consumed throughout component stylesheets.
**Trade-off:** All components must use variable references rather than hardcoded values. Requires discipline in stylesheet authoring.

### data-theme Attribute

**Decision:** Use `data-theme` attribute on `<html>` rather than a class on `<body>`.
**Rationale:** The `data-theme` attribute is more semantically clear and avoids class name collisions. Both `[data-theme="dark"]` and `[data-theme="light"]` selectors have equal specificity.
**Trade-off:** Slightly more verbose selectors than a class-based approach.

### Manual StorageEvent Dispatch

**Decision:** Manually dispatch `StorageEvent` after localStorage write to trigger cross-tab sync.
**Rationale:** `StorageEvent` only fires in other tabs by default. The manual dispatch ensures the current tab's components also react to programmatic theme changes.
**Trade-off:** The current tab receives the event twice (from manual dispatch and from its own localStorage write). The handler filters by key and valid values, so duplicate processing is harmless.

## Testing

No dedicated test files exist for the theme system. Manual testing covers:
- Theme toggle button interaction
- Theme persistence across page reloads
- System preference detection
- Cross-tab synchronization

## Related Components

- [MapView](./map-view.md) — Auto-switches CartoDB layer based on theme
- [RightPanel](./right-panel.md) — Contains ThemeToggle in header
- [Login](./authentication.md) — Contains ThemeToggle on login page
