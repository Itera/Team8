# Development History Feature - Plan

## Goal

The `/development_history` experience is now implemented. It shows merge-driven
change entries from `main`, with each item linking to a detail page for the full
markdown description. The UI keeps the late-1980s "matrix" aesthetic: black
background, green phosphor text, monospace font.

## Architecture

- React Router powers the client-side routing
- `backend/data/development-history/entries/` holds one markdown file per change (`{hash}.md`)
- `backend/data/development-history/index.json` is the manifest listing all entries
- A GitHub Actions workflow generates the markdown and updates the manifest on
  every push to `main`
- Seed data is committed so the page works immediately

## Plan

### Setup

- [x] 1. Create branch `feat/development-history`
- [x] 2. Install `react-router-dom` in `frontend/`

### Static data & content

- [x] 3. Create `backend/data/development-history/index.json` with seed entries
- [x] 4. Create markdown change files for each seed entry

### Frontend - routing

- [x] 5. Update `frontend/src/main.tsx` to wrap the app in `BrowserRouter`
- [x] 6. Update `frontend/src/App.tsx` to add `Routes` and nav links to the new pages

### Frontend - pages

- [x] 7. Create `frontend/src/views/DevelopmentHistory.tsx` - the list page
- [x] 8. Create `frontend/src/views/ChangeDetail.tsx` - the per-entry detail page

### Styles

- [x] 9. Create `frontend/src/matrix.css` with the Matrix style definitions
  (black bg, green text, monospace, scanline glow effect)
- [x] 10. Apply Matrix styles to both new pages

### GitHub Actions

- [x] 11. Create `.github/workflows/generate-change-entry.yml` that fires on
  every push to `main`, reads the latest merge commit message, generates
  a markdown file, and updates `index.json`

### Tests

- [x] 12. Write a Vitest unit test for `DevelopmentHistory` component
- [x] 13. Write a Vitest unit test for `ChangeDetail` component

### Final

- [x] 14. Verify all existing tests still pass
- [x] 15. Commit and open PR to `main`
