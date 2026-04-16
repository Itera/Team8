# fix: correct personality parameter validation

**Hash:** c7d8e9f  
**Date:** 2026-04-05  
**Author:** sara

## Summary

The `personality` field in the motivate request was not validated against the
allowed enum values, causing silent failures when an unrecognised value was
sent. This commit adds explicit validation and returns a `400 Bad Request`
with a descriptive error message for invalid inputs.

## Changes

- Added enum guard in `backend/src/routes/motivate.ts`
- Returned structured error JSON on invalid personality value
- Updated `backend/src/types/index.ts` to export the personality enum
- Added a test case for the invalid personality scenario in
  `backend/src/__tests__/motivate.test.ts`

## Notes

Valid personality values are: `silly`, `serious`, `sports`, `nerdy`.
Any other value now produces a clear error instead of an unexpected LLM prompt.
