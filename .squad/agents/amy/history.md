# Project Context

- **Owner:** Espen Berglund
- **Project:** HuMotivatoren — Norwegian motivation & humor tool
- **Stack:** React + Vite + TypeScript (frontend), Node.js + Express + TypeScript (backend), Vitest (tests), LLM (TBD via Slack), open APIs
- **Repo structure:** Monorepo with npm workspaces under `HuMotivatoren/` — frontend/, backend/, tests/
- **Created:** 2026-04-16

## Learnings

<!-- Append new learnings below. Each entry is something lasting about the project. -->
- 2026-04-16: Scaffolded full project structure in PR #1 (`feature/project-structure`). Backend on port 3001, frontend proxied via Vite on 5173. Stub motivate endpoint returns Norwegian humor. Decision logged in inbox.
- Project scaffolded: HuMotivatoren/frontend (React+Vite+TS) and HuMotivatoren/backend (Express+TS)
- API contract: MotivationRequest { task, personality } → MotivationResponse { quote, fact, tip, gifUrl, emoji }
- 4 personality modes: silly, serious, sports, nerdy
- Backend app.ts exports app separately from index.ts for testability (Charles needs this)
- PR opened on feature/project-structure branch (PR #1)
