# Helixtrace Frontend Documentation

## Navigation

### Getting Started
- [README.md](../README.md) — Project overview, build/run/test commands, tech stack
- [PURPOSE.md](../PURPOSE.md) — Business intent, value, stakeholders, constraints

### Architecture
- [Architecture Overview](explanation/architecture-overview.md) — System context, components, data flow, cross-cutting concerns

### Component Deep-Dives
- [Authentication](explanation/authentication.md) — Login, registration, session management, protected routes
- [MapView](explanation/map-view.md) — Leaflet-based interactive map, markers, layers, point interactions
- [RightPanel](explanation/right-panel.md) — Dashboard control panel, tools, LOS controls
- [Line of Sight Analysis](explanation/line-of-sight.md) — LOS computation library, terrain profiling, clear/blocked detection
- [Point Management](explanation/point-management.md) — Add/edit dialogs, point categories, marker icons
- [Theme System](explanation/theme-system.md) — Light/dark mode, CSS variables, persistence, cross-tab sync
- [Toast Notifications](explanation/toast-notifications.md) — Context-based notification system, auto-dismiss

### Reference
- [Developer Reference](reference/developer-reference.md) — Technical conventions, state management patterns, API service structure, and contribution checklist

### Architecture Decision Records
- [ADR-001: Client-Side LOS Computation](architecture/adr/ADR-001-client-side-los-computation.md) — Why LOS runs in the browser
