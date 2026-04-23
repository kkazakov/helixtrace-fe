# Helixtrace Frontend

A React-based web application for planning and visualizing radio networks on an interactive map. The application provides point management, terrain-aware line-of-sight analysis, and multi-layer map visualization.

See [PURPOSE.md](./PURPOSE.md) for business context and goals.

## What It Does

Helixtrace enables radio network engineers to:
- Place and manage network points (POIs, repeaters) on an interactive map
- Analyze line-of-sight (LOS) between up to 3 points with terrain profiling
- View elevation profiles with blocked/clear segment visualization
- Switch between multiple map layers (OSM, satellite, terrain, etc.)

## Architecture at a Glance

The application is a single-page React app that connects to a backend REST API. LOS computation runs client-side from terrain data returned by the backend.

```
Browser (SPA)  ←HTTPS→  Helixtrace Backend (REST API)
    ↓
Leaflet Map + Terrain Graphs + Point Management
```

### Components

| Component | Purpose | Details |
|---|---|---|
| [Authentication](./docs/explanation/authentication.md) | Login, registration, session management | JWT tokens in localStorage |
| [MapView](./docs/explanation/map-view.md) | Interactive map with markers and layers | Leaflet-based, 6 tile layers |
| [RightPanel](./docs/explanation/right-panel.md) | Dashboard control panel | Tools, LOS results, user controls |
| [Line of Sight](./docs/explanation/line-of-sight.md) | LOS computation and terrain graphs | Client-side, Earth curvature aware |
| [Point Management](./docs/explanation/point-management.md) | Add/edit dialogs, categories, icons | 3 categories, cached SVG icons |
| [Theme System](./docs/explanation/theme-system.md) | Light/dark mode | CSS variables, cross-tab sync |
| [Toast Notifications](./docs/explanation/toast-notifications.md) | User feedback | Context-based, auto-dismiss |

## Tech Stack

| Category | Technology |
|---|---|
| **Framework** | React 19 |
| **Language** | TypeScript 6 |
| **Build Tool** | Vite 8 |
| **Routing** | React Router 7 |
| **Maps** | Leaflet 1.9 + React Leaflet 5 |
| **Linting** | ESLint 9 (typescript-eslint) |
| **Fonts** | DM Sans, JetBrains Mono |

## Prerequisites

- Node.js (latest LTS recommended)
- npm

## Build, Run, Test

### Install dependencies

```bash
npm install
```

### Run development server

```bash
npm run dev
```

Or use the convenience script:

```bash
./run.sh
```

The app will be available at `http://localhost:5173`.

### Build for production

```bash
npm run build
```

Output is written to `dist/`.

### Preview production build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

### Docker

```bash
docker compose up --build
```

### Deploy

```bash
./deploy.sh
```

## Environment Variables

| Variable | Purpose | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Backend API base URL | `http://127.0.0.1:8000` |

See `.env.example` for template. Do not commit `.env` files.

## Repository Map

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
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility libraries (LOS computation)
│   ├── services/            # API clients and business logic
│   ├── types/               # TypeScript type definitions
│   ├── App.tsx              # Root component with routing
│   ├── main.tsx             # Application entry point
│   ├── index.css            # Base styles and CSS variables
│   └── App.css              # Dashboard layout styles
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

## Documentation

- [Documentation Index](./docs/index.md) — Navigation hub for all documentation
- [Architecture Overview](./docs/explanation/architecture-overview.md) — System context, components, data flow
- [PURPOSE.md](./PURPOSE.md) — Business intent, value, stakeholders
- [Component Deep-Dives](./docs/explanation/) — Detailed documentation per component
- [ADRs](./docs/architecture/adr/) — Architecture decision records

## Ownership

Maintained by Krasimir Kazakov

