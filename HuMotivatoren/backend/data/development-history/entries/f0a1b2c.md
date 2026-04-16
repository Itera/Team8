# feat: add frontend React app with personality selector

**Hash:** f0a1b2c  
**Date:** 2026-04-07  
**Author:** marcin

## Summary

Shipped the initial React frontend. Users can type a task, choose a
personality style, and receive a motivational message rendered in the browser.

## Changes

- Created `frontend/src/App.tsx` with form, personality selector, and result
  display
- Created `frontend/src/App.css` with gradient background styling
- Created `frontend/src/services/api.ts` for fetch calls to the backend
- Created `frontend/src/types/index.ts` mirroring backend request/response types
- Configured Vite proxy so `/api/*` requests forward to `localhost:3001`

## Notes

The UI intentionally does not use any UI component library to keep the bundle
small. Inline styles and a single CSS file cover all styling needs.
