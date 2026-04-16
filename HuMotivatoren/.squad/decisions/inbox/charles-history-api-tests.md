### 2026-04-16T14:45:00Z: History API contract tests
**By:** hejuhenryk (via Copilot / Charles)
**What:** Aligned development history coverage around backend-owned endpoints by adding backend route tests and updating frontend history tests to call `/api/development-history` and `/api/development-history/:hash` instead of static file fetches.
**Why:** The refactor moves history behind the backend API, so test coverage needs to validate the contract boundary rather than the old frontend asset layout.
