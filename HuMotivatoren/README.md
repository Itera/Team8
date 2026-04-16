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

- **Frontend** sends user input to backend via `POST /api/motivate`
- **Backend** calls an LLM and open APIs, then returns motivation + humor
- **Environment variables** in `.env` (never committed) — see `.env.example`

## 🔑 Environment Variables

| Variable        | Description                        |
| --------------- | ---------------------------------- |
| `LLM_API_KEY`   | API key for the LLM provider       |
| `LLM_BASE_URL`  | LLM API base URL                   |
| `GIPHY_API_KEY`  | Giphy API key for GIF integration  |
| `NEWS_API_KEY`   | NewsAPI key for fun facts           |
| `PORT`          | Backend server port (default 3001) |

## 👥 Team

| Name      | Role             |
| --------- | ---------------- |
| **Amy**   | Lead / Architect |
| **Jake**  | Frontend         |
| **Rosa**  | Backend          |
| **Charles** | Tester         |

## 📋 Scripts

| Script          | Description                              |
| --------------- | ---------------------------------------- |
| `npm run dev`   | Start frontend + backend in dev mode     |
| `npm run build` | Build frontend and backend for production|
| `npm run test`  | Run all Vitest tests                     |
