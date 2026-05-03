# ADR-001: Client-Side LOS Computation

## Status

Accepted

## Context

The Helixtrace system needs to compute line-of-sight (LOS) status between pairs of radio network points. The backend provides terrain elevation data along a path between two coordinates via the `tracePath` API endpoint, returning a series of elevation samples.

Two options were considered for LOS computation:

1. **Server-side:** The backend computes LOS status from terrain data and returns the result alongside the trace data.
2. **Client-side:** The frontend receives raw terrain data and computes LOS status in the browser.

## Decision

LOS computation runs entirely on the client side. The backend returns raw terrain elevation data (`TraceResponse`), and the frontend's `computeLOSStatus` function in `src/lib/los.ts` determines whether the path is clear, blocked, or unknown.

## Consequences

### Positive
- **Reduced backend load:** The backend only serves terrain data, not computation results
- **Immediate visualization:** The frontend can render terrain graphs and LOS status without additional API calls
- **Flexibility:** LOS algorithm can be modified independently without backend deployment
- **Debugging:** Planners can inspect raw terrain data in browser dev tools

### Negative
- **Main thread blocking:** LOS computation runs on the JavaScript main thread. Very long traces with many elevation samples may cause UI jank.
- **Inconsistent results:** Different browser environments could theoretically produce slightly different results due to floating-point precision, though this is not observed in practice.
- **Code duplication risk:** If LOS computation needs to run server-side for other purposes (e.g., batch analysis), the algorithm would need to be implemented in two languages.

### Mitigations
- Current trace lengths complete within acceptable time (<100ms typical)
- The `computeLOSStatus` function is pure and deterministic, making server-side porting straightforward if needed
- Consider Web Workers for LOS computation if trace lengths increase significantly
