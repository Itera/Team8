# feat: implement health check endpoint

**Hash:** b5c6d7e  
**Date:** 2026-04-14  
**Author:** alex  

## Summary

Added a `GET /api/health` endpoint that returns server status and uptime. This
endpoint is used by the CI pipeline and will be used by future monitoring
integrations.

## Changes

- Created `backend/src/routes/health.ts` with a simple status response
- Registered the route in `backend/src/app.ts`
- Created `backend/src/__tests__/health.test.ts`
- Added the endpoint to the API documentation in `README.md`

## Notes

The health response includes `status: "ok"` and `uptime` in seconds. No
authentication is required for this endpoint.
