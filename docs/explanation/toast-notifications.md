# Toast Notifications

**Type:** Explanation

The toast notification system provides a context-based mechanism for displaying transient success, error, and info messages across the application. Toasts auto-dismiss after 4 seconds and can be manually dismissed by the user.

## Responsibility

- Provides a global toast context for displaying notifications
- Auto-dismisses toasts after a configurable timeout
- Renders toasts with type-based styling
- Supports manual dismissal

If this component is removed, the application loses user feedback for async operations (point creation, deletion, errors).

## Public Interface

### `src/context/ToastContext.tsx`

| Export | Type | Description |
|---|---|---|
| `ToastProvider` | React component | Context provider with toast container |
| `useToast()` | `() => { toasts: Toast[]; showToast: (message, type?) => void }` | Hook to access toast context |

### `src/types/toast.ts`

| Export | Type | Description |
|---|---|---|
| `Toast` | `interface` | Toast data structure |

## Internal Structure

```
src/
├── context/
│   └── ToastContext.tsx        # Context provider and hook
├── types/
│   └── toast.ts                # Toast type definition
└── components/
    └── Toast/
        └── Toast.css           # Toast container and item styles
```

### ToastContext (`src/context/ToastContext.tsx`)

The context provider manages a list of active toasts in component state. Key behaviors:

#### `showToast` (`src/context/ToastContext.tsx:23-29`)

Creates a new toast with a timestamp-based ID and the specified type (defaults to `'info'`). Schedules auto-removal after 4000ms via `setTimeout`.

#### `dismissToast` (`src/context/ToastContext.tsx:31-33`)

Removes a toast by ID. Used for manual dismissal via the close button.

#### Rendering (`src/context/ToastContext.tsx:35-47`)

The provider renders children plus a `toast-container` div containing all active toasts. Each toast displays the message and a dismiss button.

### Toast Type (`src/types/toast.ts`)

```typescript
interface Toast {
  id: number;
  message: string;
  type: 'error' | 'success' | 'info';
}
```

## Dependencies

### Internal
- None (foundational component consumed by other components)

### External
- None

## Data Model

### `Toast` (from `src/types/toast.ts`)
```typescript
interface Toast {
  id: number;
  message: string;
  type: 'error' | 'success' | 'info';
}
```

## Key Logic

### Auto-Dismiss (`src/context/ToastContext.tsx:26-28`)

Each toast schedules its own removal after 4000ms. The timeout uses the toast's ID to filter it from the state array. If the user manually dismisses before the timeout, the `setTimeout` callback runs harmlessly since the toast is already removed.

### ID Generation (`src/context/ToastContext.tsx:24`)

Uses `Date.now()` as the toast ID. This is sufficient for the application's usage pattern (toasts are rare and short-lived). Collision is possible if two toasts are created in the same millisecond, but unlikely in practice.

## Configuration

| Parameter | Value | Purpose |
|---|---|---|
| Auto-dismiss timeout | `4000` ms | Duration before toast auto-removes |

## Design Decisions and Trade-offs

### Context-Based Architecture

**Decision:** Use React Context rather than a state management library.
**Rationale:** Toast notifications are a simple, global concern that doesn't justify the overhead of Redux, Zustand, or similar libraries. Context provides the necessary global access with minimal boilerplate.
**Trade-off:** All consumers re-render when the toast list changes. This is acceptable since toast updates are infrequent.

### Timestamp-Based IDs

**Decision:** Use `Date.now()` for toast IDs rather than a counter or UUID library.
**Rationale:** Avoids external dependencies and stateful counters. Sufficient uniqueness for the application's toast frequency.
**Trade-off:** Theoretical collision risk if multiple toasts fire in the same millisecond. Not observed in practice.

### Inline Toast Rendering

**Decision:** Render toasts directly in the context provider rather than as a separate component.
**Rationale:** The toast container is simple and tightly coupled with the context state. A separate component would add an unnecessary abstraction layer.
**Trade-off:** The provider component handles both state management and rendering. Separation of concerns is reduced, but the component remains short and readable.

## Testing

No dedicated test files exist for the toast notification system. Manual testing covers:
- Toast display on point creation/deletion
- Error toast on API failures
- Auto-dismiss after 4 seconds
- Manual dismissal via close button

## Related Components

- [MapView](./map-view.md) — Shows toasts for point CRUD operations and errors
- [Dashboard](./architecture-overview.md) — ToastProvider wraps the Dashboard component
