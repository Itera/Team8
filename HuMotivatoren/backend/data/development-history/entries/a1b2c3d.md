# feat: scaffold HuMotivatoren project structure

**Hash:** a1b2c3d  
**Date:** 2026-04-01  
**Author:** marcin

## Summary

Initial project scaffolding. Created monorepo layout with separate `frontend/`
and `backend/` packages. Established TypeScript configuration for both targets,
configured Vite for the React frontend and a minimal Express server for the
backend API.

## Changes

- Initialized `frontend/` with React 19 and Vite
- Initialized `backend/` with Express and TypeScript
- Added root `package.json` with workspace scripts
- Configured `tsconfig.json` for both packages
- Added `.gitignore` for `node_modules`, `dist`, and environment files

## Notes

This commit establishes the foundation that all subsequent work builds upon.
No business logic was introduced at this stage.
