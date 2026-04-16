# Squad Decisions

## Active Decisions

- **2026-04-16:** Project is HuMotivatoren — Norwegian motivation & humor tool for Itera hackathon.
- **2026-04-16:** Stack TBD pending Slack LLM info. Frontend likely React + Vite + TypeScript. Backend likely Node.js/Express.
- **2026-04-16:** All LLM output must pass content safety check aligned with Itera's values before reaching frontend.
- **2026-04-16:** Azure OpenAI (gpt-4o-mini) used for LLM quote generation. Fallback to hardcoded responses when API unavailable. See ADR in decisions/inbox/amy-adr-llm-azure-openai.md
- **2026-04-16:** App must be demo-ready on big screen in 2 minutes. Visual appeal is a first-class requirement.
- **2026-04-16:** Project docs were refreshed to match the current app state. Keep README, TESTING.md, DEVELOPMENT_HISTORY_PLAN.md, and DONOTREADME.md aligned with implemented behavior and preserve their existing tone/structure.

## Architectural Decisions & ADRs

### ADR-001: Use Azure OpenAI (gpt-4o-mini) for Personality-Aware Motivational Content
**Date:** 2026-04-16  
**Author:** Amy (Lead/Architect)  
**Status:** Accepted  
**Branch:** feature/llm-quotes

#### Context
HuMotivatoren needed dynamic generation of motivational quotes, facts, and tips that are contextually relevant to each user's task, personality-distinct, in Norwegian, and fast enough for live demo (sub-15s).

#### Decision
Use **Azure OpenAI with `gpt-4o-mini` deployment** (hosted at `openai-itera-hackathon-dev.openai.azure.com`).
- System prompt establishes personality, Norwegian language requirement, Itera values alignment, JSON-only output
- User prompt includes task + JSON schema for expected fields (quote, fact, tip, emoji)
- API version: `2025-01-01-preview`
- Timeout: 15 seconds
- Temperature: `0.5` for serious, `0.9` for all others

#### Fallback Strategy
Three-tier cascade:
1. Missing env vars → graceful fallback with console warning
2. API call fails (network/timeout/4xx/5xx) → personality-specific Norwegian fallback
3. JSON parse fails → personality-specific Norwegian fallback

#### Content Safety
System prompt includes: *"Innholdet skal alltid være positivt, inkluderende og i tråd med Iteras verdier. Ingen støtende, diskriminerende eller upassende innhold."*
This aligns with standing governance (2026-04-16) requiring all LLM output pass content safety checks aligned with Itera's values.

#### Mitigations
- Markdown fence stripping: Azure OpenAI occasionally wraps JSON in ` ```json ` despite system prompt — llmService.ts strips before parsing
- All external APIs mocked in tests — no real network calls in CI
- JSON robustness: try/catch for parse errors, explicit field constraints

---

### 2026-04-16: Project Structure Decisions
**By:** Amy (Lead)
- Monorepo with npm workspaces: frontend/ (React+Vite+TS), backend/ (Express+TS)
- Backend on port 3001, frontend proxied via Vite on 5173
- All env vars via .env (never committed)
- Backend app.ts exports app separately from index.ts for testability

---

### 2026-04-16: Test Strategy
**By:** Charles (Tester)
- Frontend: Vitest + React Testing Library
- Backend: Vitest + supertest (NOT Jest)
- All external APIs (LLM, GIF, news) MUST be mocked — no real network calls in CI
- Norwegian special characters (æøå) tested explicitly

---

## Governance

- All meaningful changes require team consensus
- Document architectural decisions here
- Keep history focused on work, decisions focused on direction
