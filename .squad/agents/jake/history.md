# Project Context

- **Owner:** Espen Berglund
- **Project:** HuMotivatoren — Norwegian motivation & humor tool
- **Stack:** React + TypeScript (frontend), Vite or Next.js, Node.js backend, LLM + open APIs
- **Created:** 2026-04-16

## Learnings

- 2026-04-16: Updated App.tsx for LLM integration (feature/llm-quotes PR #9). Loading button "🤖 AI genererer...", pulsing loading card, "✨ AI-generert" badge, task caption. Commit f52b910.
- 2026-04-16: Created Features page at `/features` (feat/features-page). Built `views/Features.tsx` — 11 feature cards in auto-fill CSS grid, each with emoji, Orbitron name, description, and access hint. Color-coded using 5 Blade Runner CSS vars (cyan/pink/purple/amber/green). Hover lift animation via inline `onMouseEnter`/`onMouseLeave`. Added route + nav link in `App.tsx`. Pattern: static data array (Feature[]) → map to styled articles — no fetch needed.
- 2026-04-16: Refreshed project docs to reflect the current codebase state; keep the docs aligned with implemented routes, tests, and the development-history feature.
- 2026-04-16: WordOfYourMouth now derives subtitle text from the transmission's primary joke line via getJokeSubtitleFromTransmission(), while preserving mouth-motion detection, backend signal fetch flow, and subtitle fade timing. Updated UI labels to joke semantics (Joke Feed, Joke line, joke-trigger status) and verified with `npm run test --workspace=frontend -- WordOfYourMouth`.
- 2026-04-16: Replaced the homepage with a self-contained Snake clone using a reducer-driven game loop, arrow-key controls, collision reset/game-over state, and CSS-only nyan-cat background layers. Reusable pattern: keep keyboard game state in one reducer so movement, growth, and restart stay deterministic.
<!-- Append new learnings below. Each entry is something lasting about the project. -->
