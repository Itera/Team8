# 🎉 HuMotivatoren

**HuMotivatoren** er et norsk motivasjons- og humorverktøy laget for Itera sitt hackathon. Fortell appen hva du skal gjøre, og den gir deg (ir)relevante fakta, humor, GIF-er og useriøs inspirasjon — alt drevet av AI. Perfekt for å gi deg den lille ekstra motivasjonen du trenger, med et glimt i øyet.

## 🚀 Quick Start

```bash
# Install all dependencies (frontend, backend, tests)
npm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your actual API keys

# Start both frontend and backend in dev mode
npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3001

## 🏗️ Architecture

Monorepo with npm workspaces:

```
HuMotivatoren/
├── frontend/    — React + Vite + TypeScript (UI)
├── backend/     — Node.js + Express + TypeScript (API + LLM)
└── tests/       — Vitest test suites
```

- **Frontend** routes between the home screen, `/chaos`, `/development_history`, and `/word_of_your_mouth`
- **Backend** serves motivation plus supporting endpoints for health, cowsay, chaos weather, mouth-word, and development history
- **Environment variables** in `.env` (never committed) — see `.env.example`

## 🔑 Environment Variables

| Variable        | Description                        |
| --------------- | ---------------------------------- |
| `AZURE_OPENAI_ENDPOINT` | Azure OpenAI resource endpoint |
| `AZURE_OPENAI_DEPLOYMENT` | Azure OpenAI deployment name |
| `AZURE_OPENAI_API_VERSION` | Azure OpenAI API version |
| `AZURE_OPENAI_API_KEY` | Azure OpenAI API key |
| `ALLOWED_ORIGINS` | Comma-separated CORS allowlist |
| `GIPHY_API_KEY`  | Giphy API key for GIF integration  |
| `NEWS_API_KEY`   | NewsAPI key for fun facts           |
| `PORT`          | Backend server port (default 3001) |

## 👥 Team

| Name      | Role             |
| --------- | ---------------- |
| **Amy**   | Lead / Architect |
| **Jake**  | Frontend Dev    |
| **Rosa**  | Backend Dev     |
| **Charles** | Tester        |

## 📋 Scripts

| Script          | Description                              |
| --------------- | ---------------------------------------- |
| `npm run dev`   | Start frontend + backend in dev mode     |
| `npm run build` | Build frontend and backend for production|
| `npm run test`  | Run the tests workspace                  |
| `npm run test --workspace=frontend` | Run frontend Vitest tests |
| `npm run test --workspace=backend`  | Run backend Vitest tests  |
