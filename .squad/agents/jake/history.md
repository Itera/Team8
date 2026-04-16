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
- 2026-04-16: Audited App.tsx post-refactor (+527/-149). All three markers confirmed present: `/features` route, `✨ Features` nav link in Home, and `Features` import. Identified one NEW feature not yet in Features.tsx: `SnakeAmbient` — a keyboard-controlled Snake clone living in the background of the Home page. Added it as a new entry (🐍 Snake Ambient, green) in Features.tsx. The footer count is dynamic (`{FEATURES.length}`) so it auto-updates.
- 2026-04-16: Moved Snake from home ambience to a dedicated `/snake` feature route in `App.tsx`, added discoverability links from both home and features navigation, and upgraded board semantics (`role="grid"` + `role="gridcell"`) with a live status region so keyboard instructions/state are accessible and testable.
- 2026-04-16: Added stage-scoped fullscreen support to WordOfYourMouth using a dedicated stage ref, `fullscreenchange` state sync, and an accessible toggle (`aria-pressed` + dynamic label) with graceful unsupported-browser fallback. Verified with frontend tests that `requestFullscreen`/`exitFullscreen` are called and control state updates correctly.
<!-- Append new learnings below. Each entry is something lasting about the project. -->
