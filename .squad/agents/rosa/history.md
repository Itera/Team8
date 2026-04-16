# Project Context

- **Owner:** Espen Berglund
- **Project:** HuMotivatoren — Norwegian motivation & humor tool
- **Stack:** Node.js/Express or Python/FastAPI (backend), LLM integration (TBD), open APIs (news/facts/GIFs/trivia)
- **Created:** 2026-04-16

## Learnings

- 2026-04-16: Azure OpenAI (gpt-4o-mini) occasionally wraps JSON in markdown code fences despite system prompt saying not to. llmService.ts strips ` ```json ` and ` ``` ` fences before JSON.parse() for robustness.
- 2026-04-16: LLM integration feature complete (feature/llm-quotes). Markdown fence stripping prevents silent fallback to hardcoded responses.
<!-- Append new learnings below. Each entry is something lasting about the project. -->
