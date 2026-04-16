# Testing — HuMotivatoren

## Oversikt

Vi tester backend API og frontend-komponenter separat. Alle eksterne APIer er mocket i tester, så testsuiten kjører uten ekte nettverkskall.

## Kjøre tester

### Backend
```bash
npm run test --workspace=backend
```

### Frontend
```bash
npm run test --workspace=frontend
```

### Alt på en gang
```bash
npm run test
```

## Hva vi tester

### Backend (Vitest + supertest)
- `GET /api/health` — returnerer status og versjonsinfo
- `POST /api/motivate` — happy path og feilhåndtering
- `GET /api/development-history` og `GET /api/development-history/:hash`
- `POST /api/cowsay`, `POST /api/mouth-word`, og `GET /api/weather/chaos`
- Validering av tomme, for lange og ugyldige payloads

### Frontend (Vitest + React Testing Library)
- App rendrer hovedsiden og navigasjonen til de tre undersidene
- Resultat vises etter vellykket innsending
- Tom innsending krasjer ikke appen
- Development history og detail-view rendres med riktig innhold

## Mockestrategi

- LLM- og API-klienter mockes i backend-tester
- `services/api.ts` og fetch-kall mockes i frontend-tester
- Ingen `.env`-variabler nødvendig for å kjøre tester

## Edge cases dekket

- Norske spesialtegn (æøå) i input
- Tomt input
- Veldig langt input
- Alle 4 personality-typer: silly, serious, sports, nerdy
- API-feil og 400/404-svar (håndteres i frontend error-state)
