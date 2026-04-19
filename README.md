# Helixtrace - Radio Network Planner

A web-based frontend application for planning and visualizing radio networks on an interactive map.

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

## Getting Started

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

## Project Structure

```
src/
├── components/
│   ├── AddPointDialog/    # Dialog for adding points by coordinates
│   ├── Login/             # Authentication page
│   ├── MapView/           # Leaflet-based interactive map
│   ├── ProtectedRoute/    # Route guard for authenticated pages
│   ├── RightPanel/        # Dashboard control panel
│   ├── ThemeToggle/       # Light/dark theme switcher
│   └── Toast/             # Notification toasts
├── context/
│   └── ToastContext.tsx   # Global toast state management
├── hooks/
│   └── useTheme.ts        # Theme persistence hook
├── services/
│   ├── auth.ts            # Authentication utilities
│   └── pointCategories.ts # Point category definitions
├── types/
│   └── toast.ts           # Toast type definitions
├── App.tsx                # Root component with routing
├── main.tsx               # Application entry point
├── App.css                # Global styles
└── index.css              # Base styles
```

## Features

- **Authentication** - Login-protected dashboard with route guards
- **Interactive Map** - Leaflet-based map for visualizing radio network points
- **Point Management** - Add points by clicking on the map or entering coordinates
- **Point Categories** - Categorized point types for network planning
- **Theme Support** - Light and dark mode with persisted preference
- **Toast Notifications** - Context-based notification system
