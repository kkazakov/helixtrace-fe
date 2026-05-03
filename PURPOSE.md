# Helixtrace Frontend — Purpose

## Problem Statement

Radio network planners need a visual tool to assess line-of-sight (LOS) between potential network points, accounting for terrain elevation and Earth's curvature. Existing tools are either command-line based, require desktop installation, or lack interactive terrain visualization.

## Target Users and Stakeholders

| Audience | Role |
|---|---|
| Radio Network Engineers | Primary users who plan network infrastructure, place repeaters, and assess signal paths |

## Value and Success Metrics

### Value
- Enables rapid visual assessment of radio signal paths between network points
- Reduces planning time through interactive map-based interface
- Provides terrain-aware LOS analysis with Earth curvature compensation

### Success Metrics
- Planners can evaluate LOS between 3 points in under 30 seconds
- Terrain graphs accurately reflect signal obstruction
- Users can create and manage network points without backend API knowledge

## Non-Goals

- Real-time collaboration between multiple planners
- Historical analysis of past network configurations
- Automated optimal point placement (partially implemented as placeholder)
- Mobile-native experience (the application is desktop-first)
- Offline operation (requires backend connectivity)

## Constraints

- Requires active connection to the Helixtrace backend API
- LOS computation runs on the client's main thread, limiting trace length
- Point data is fetched on-demand; no offline caching strategy
- Single-user sessions; no multi-user coordination

## System Role

The frontend is the user-facing component of the Helixtrace system. It consumes the backend's REST API for authentication, point CRUD operations, and terrain elevation data. The frontend performs LOS computation client-side from the terrain data returned by the backend.

See [Architecture Overview](./docs/explanation/architecture-overview.md) for system context and component relationships.

## Lifecycle Expectations

- **Development:** Active development with new features and bug fixes
- **Deployment:** Static SPA deployed via `deploy.sh` script, containerized via Docker
- **Maintenance:** Ongoing dependency updates and bug fixes
- **Data Retention:** No data stored permanently in the frontend; all state is ephemeral or in localStorage for user convenience
