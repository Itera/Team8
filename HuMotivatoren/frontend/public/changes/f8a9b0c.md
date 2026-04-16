# docs: add README and TESTING documentation

**Hash:** f8a9b0c  
**Date:** 2026-04-15  
**Author:** sara

## Summary

Wrote comprehensive documentation covering project setup, development
workflow, testing strategy, and deployment notes.

## Changes

- Rewrote `README.md` with setup instructions, environment variables table,
  and API reference
- Created `TESTING.md` with instructions for running unit and integration tests
- Added inline comments to complex sections of the backend service layer
- Updated `.env.example` with all required and optional variables

## Notes

The TESTING.md document follows the testing philosophy of separating unit tests
(inside each package) from integration tests (in the `tests/` root directory).
All commands in the documentation were verified on macOS and Ubuntu.
