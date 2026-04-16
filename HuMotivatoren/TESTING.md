# Testing — HuMotivatoren

## Oversikt

Vi tester backend API og frontend-komponenter separat. Alle eksterne APIer (LLM, GIF, nyheter) er alltid mocket i tester — ingen ekte nettverkskall i testsuiten.

## Kjøre tester

### Backend
```bash
cd humotivatoren/backend
npm install
npm test
```

### Frontend
```bash
cd humotivatoren/frontend
npm install
npm test
```

## Hva vi tester

### Backend (Vitest + supertest)
- `GET /api/health` — returnerer 200 og status ok
- `POST /api/motivate` — happy path med alle personality-typer
- Validering: manglende task, tomt task, for lang task
- Norske spesialtegn (æøå) håndteres riktig

### Frontend (Vitest + React Testing Library)
- App rendrer heading, input, knapp og personality-velger
- Resultat vises etter vellykket innsending
- Tom innsending krasjer ikke appen
- Emoji vises fra API-respons

## Mockestrategi

- LLM-service mockes i alle backend-tester (`vi.mock('../services/llmService.js', ...)`)
- `services/api.ts` mockes i alle frontend-tester
- Ingen `.env`-variabler nødvendig for å kjøre tester

## Edge cases dekket

- Norske spesialtegn (æøå) i input
- Tomt input
- Veldig langt input
- Alle 4 personality-typer: silly, serious, sports, nerdy
- API-feil (håndteres i frontend error-state)
