# Authentication

**Type:** Explanation

The authentication component manages user login, registration, session persistence, and route protection for the Helixtrace frontend application.

## Responsibility

Handles the complete authentication lifecycle:
- User login and registration via the backend API
- JWT token storage and retrieval in `localStorage`
- Session validation and automatic redirect on expired tokens
- Route protection for authenticated pages

If this component is removed, users cannot authenticate, and all protected routes become inaccessible.

## Public Interface

### `src/services/auth.ts`

| Export | Type | Description |
|---|---|---|
| `login(credentials)` | `async (LoginCredentials) => Promise<AuthResponse>` | Authenticates user against backend |
| `register(credentials)` | `async (RegisterCredentials) => Promise<AuthResponse>` | Registers new user |
| `getStoredAuth()` | `() => AuthState` | Returns current auth state from localStorage |
| `storeAuth(auth)` | `(AuthState) => void` | Persists auth state to localStorage |
| `clearAuth()` | `() => void` | Removes auth state from localStorage |
| `authenticatedFetch(url, options)` | `async (string, RequestInit) => Promise<Response>` | Fetch with auto-attached Bearer token |

### `src/components/Login/Login.tsx`

| Export | Type | Description |
|---|---|---|
| `LoginPage` | React component | Login/registration page with form UI |

### `src/components/ProtectedRoute/ProtectedRoute.tsx`

| Export | Type | Description |
|---|---|---|
| `ProtectedRoute` | React component | Route guard that redirects unauthenticated users to `/login` |

## Internal Structure

```
src/
├── services/
│   └── auth.ts              # Auth API client, token storage, authenticated fetch wrapper
├── components/
│   ├── Login/
│   │   ├── Login.tsx        # Login/registration page component
│   │   ├── Login.css        # Login page styles
│   │   └── index.ts         # Re-export
│   └── ProtectedRoute/
│       └── ProtectedRoute.tsx  # Route guard component
```

### Auth Service (`src/services/auth.ts`)

The auth service is the central module for all authentication-related logic. It handles:

- **Token Storage:** Uses `localStorage` with key `helixtrace_auth` to persist `AuthState` objects containing `token`, `email`, and `isAuthenticated` fields.
- **API Base URL:** Reads from `VITE_API_BASE_URL` environment variable, defaults to `http://127.0.0.1:8000`.
- **Authenticated Fetch:** The `authenticatedFetch` function wraps `fetch` to automatically attach the Bearer token from stored auth. On 401/403 responses, it clears auth and redirects to `/login`.

### Login Page (`src/components/Login/Login.tsx`)

The login page supports two modes:
- **Login mode:** Submits credentials to `POST /api/login`
- **Register mode:** Submits credentials to `POST /api/register`

On successful response, the component calls `storeAuth()` with the returned token and email, then triggers the `onLogin` callback which navigates to the dashboard via `window.location.href = '/'`.

### Protected Route (`src/components/ProtectedRoute/ProtectedRoute.tsx`)

A simple route guard that checks `getStoredAuth().isAuthenticated`. Returns `<Navigate to="/login" />` if unauthenticated, otherwise renders children.

## Dependencies

### Internal
- None (this is a foundational component)

### External
- **Backend API:** Requires the Helixtrace backend service for `/api/login`, `/api/register` endpoints
- **localStorage:** Browser API for token persistence
- **react-router-dom:** For `<Navigate>` component in ProtectedRoute

## Data Model

### `AuthState`
```typescript
interface AuthState {
  token: string | null;
  email: string | null;
  isAuthenticated: boolean;
}
```

### `AuthResponse`
```typescript
interface AuthResponse {
  token: string;
  email: string;
}
```

## Key Logic

### Token Attachment (`src/services/auth.ts:94-111`)

The `authenticatedFetch` function retrieves the stored token and attaches it as a Bearer header. On 401/403 responses, it clears the auth state and redirects to `/login`, ensuring users are logged out when sessions expire.

### Session Validation (`src/services/auth.ts:45-53`)

`getStoredAuth` reads from localStorage, parses the JSON, and derives `isAuthenticated` from the presence of a token. Returns a default unauthenticated state on parse errors or missing data.

## Configuration

| Environment Variable | Purpose | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Backend API base URL | `http://127.0.0.1:8000` |

## Design Decisions and Trade-offs

### localStorage for Token Storage

**Decision:** Store JWT tokens in `localStorage` rather than `httpOnly` cookies.
**Rationale:** Simpler client-side implementation without cookie synchronization complexity. The frontend directly controls token lifecycle.
**Trade-off:** Tokens are accessible to JavaScript, creating XSS risk. Mitigated by the backend using short-lived tokens and the frontend clearing tokens on 401/403 responses.

### Hard Navigation After Login

**Decision:** Use `window.location.href = '/'` instead of React Router navigation after login.
**Rationale:** Ensures a clean state transition and avoids potential routing edge cases during authentication state changes.
**Trade-off:** Full page reload loses any in-memory state, though this is acceptable since login represents a fresh session.

## Testing

No dedicated test files exist for the authentication component. Manual testing covers:
- Login with valid/invalid credentials
- Registration flow
- Session expiration handling
- Protected route redirect

## Related Components

- [MapView](./map-view.md) — Uses `authenticatedFetch` for point operations
- [RightPanel](./right-panel.md) — Displays user email, handles logout
