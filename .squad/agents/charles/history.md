# Project Context

- **Owner:** Espen Berglund
- **Project:** HuMotivatoren — Norwegian motivation & humor tool
- **Stack:** React + TypeScript (frontend), Node.js or Python (backend), Vitest/Jest + React Testing Library
- **Created:** 2026-04-16

## Learnings

<!-- Append new learnings below. Each entry is something lasting about the project. -->
- Test framework: Vitest + RTL for frontend, Vitest + supertest for backend (NOT Jest — backend uses Vitest)
- All LLM/external APIs mocked in tests — critical for CI reliability
- Norwegian chars (æøå) tested explicitly in motivate.test.ts
- Backend app.ts must export app separately from server start (index.ts) for supertest to work
- 4 personality types: silly, serious, sports, nerdy
- Branch was `feature/project-structure` (not `squad/project-structure` as initially expected)
