### 2026-04-16T00:00:00Z: Backend-owned development history store and API
**By:** Rosa
**What:** Development history now reads from backend/data/development-history with index metadata in index.json and markdown entry bodies in entries/{hash}.md, exposed via GET /api/development-history and GET /api/development-history/:hash.
**Why:** This keeps the frontend out of static content ownership, preserves the existing commit-list plus markdown-detail behavior, and avoids adding a database for generated history content.
