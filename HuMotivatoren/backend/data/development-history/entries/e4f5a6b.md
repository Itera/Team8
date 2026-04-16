# feat: add motivate endpoint with LLM integration

**Hash:** e4f5a6b  
**Date:** 2026-04-03  
**Author:** alex

## Summary

Introduced the core `/api/motivate` POST endpoint. The endpoint accepts a task
description and an optional personality parameter, forwards the request to an
external LLM provider, and returns a motivational message.

## Changes

- Created `backend/src/routes/motivate.ts` with POST handler
- Created `backend/src/services/llm.ts` for LLM abstraction
- Created `backend/src/services/externalApis.ts` for external API calls
- Added request/response types to `backend/src/types/index.ts`
- Registered the route in `backend/src/app.ts`

## Notes

The LLM provider is configured via environment variable `LLM_API_KEY`. A
fallback stub is used when the variable is absent so development can proceed
without credentials.
