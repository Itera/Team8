# Work Routing

How to decide who handles what.

## Routing Table

| Work Type | Route To | Examples |
|-----------|----------|----------|
| Architecture & design | Amy | Tech decisions, component boundaries, API contracts, ADRs |
| Code review | Amy | Review PRs, enforce quality, approve/reject |
| Scope & priorities | Amy | What to build next, trade-offs, Itera values compliance |
| React UI / Frontend | Jake | Components, views, personality types, big-screen layout, animations |
| API consumption (frontend) | Jake | Fetch calls, data binding, error states in UI |
| Backend API | Rosa | Express/FastAPI routes, middleware, response formatting |
| LLM integration | Rosa | Prompt engineering, content safety, LLM API calls |
| Open API integration | Rosa | News, facts, GIFs, trivia, and other external APIs |
| Testing | Charles | Unit tests, integration tests, API tests, edge cases |
| Session logging | Scribe | Automatic — never needs routing |

## Issue Routing

| Label | Action | Who |
|-------|--------|-----|
| `squad` | Triage: analyze issue, assign `squad:{member}` label | Lead |
| `squad:{name}` | Pick up issue and complete the work | Named member |

### How Issue Assignment Works

1. When a GitHub issue gets the `squad` label, the **Lead** triages it — analyzing content, assigning the right `squad:{member}` label, and commenting with triage notes.
2. When a `squad:{member}` label is applied, that member picks up the issue in their next session.
3. Members can reassign by removing their label and adding another member's label.
4. The `squad` label is the "inbox" — untriaged issues waiting for Lead review.

## Rules

1. **Features page sync** — After any feature work completes (frontend or backend), Jake MUST update `src/views/Features.tsx` to include the new feature. Route this as a follow-up task if the original agent wasn't Jake.
2. **Eager by default**— spawn all agents who could usefully start work, including anticipatory downstream work.
2. **Scribe always runs** after substantial work, always as `mode: "background"`. Never blocks.
3. **Quick facts → coordinator answers directly.** Don't spawn an agent for "what port does the server run on?"
4. **When two agents could handle it**, pick the one whose domain is the primary concern.
5. **"Team, ..." → fan-out.** Spawn all relevant agents in parallel as `mode: "background"`.
6. **Anticipate downstream work.** If a feature is being built, spawn the tester to write test cases from requirements simultaneously.
7. **Issue-labeled work** — when a `squad:{member}` label is applied to an issue, route to that member. The Lead handles all `squad` (base label) triage.
