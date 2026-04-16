# Development History Feature - Plan

## Goal

Create a new page `/development_history` that displays a timeline of all changes
introduced by merges to the `main` branch. Each entry is a commit title that
links to a subpage showing the full description of that change. The entire UI
is styled in a late-1980s "matrix" aesthetic: black background, green phosphor
text, monospace font.

## Architecture

- React Router v6 for client-side routing
- `frontend/public/changes/` holds one markdown file per merge commit (`{hash}.md`)
- `frontend/public/changes/index.json` is the manifest listing all entries
- A GitHub Actions workflow generates the markdown and updates the manifest on
  every push to `main`
- Fake seed data is committed so the page works without any merges yet

## Plan

### Setup

- [~] 1. Create branch `feat/development-history`
- [-] 2. Install `react-router-dom` in `frontend/`
- [x] 2. Install `react-router-dom` in `frontend/`

### Static data & content

- [-] 3. Create `frontend/public/changes/index.json` with fake seed entries
- [~] 3. Create `frontend/public/changes/index.json` with fake seed entries
- [x] 3. Create `frontend/public/changes/index.json` with fake seed entries
- [-] 4. Create fake markdown change files for each seed entry
- [~] 4. Create fake markdown change files for each seed entry
- [x] 4. Create fake markdown change files for each seed entry

### Frontend - routing

- [-] 5. Update `frontend/src/main.tsx` to wrap the app in `BrowserRouter`
- [~] 5. Update `frontend/src/main.tsx` to wrap the app in `BrowserRouter`
- [x] 5. Update `frontend/src/main.tsx` to wrap the app in `BrowserRouter`
- [-] 6. Update `frontend/src/App.tsx` to add `Routes` and a nav link to - [~] 6. Update `frontend/src/App.tsx` to add `Routes` and a nav link to - [x] 6. Update `frontend/src/App.tsx` to add `Routes` and a nav link to
  `/development_history`

### Frontend - pages

- [-] 7. Create `frontend/src/views/DevelopmentHistory.tsx` - the list page
- [~] 7. Create `frontend/src/views/DevelopmentHistory.tsx` - the list page
- [x] 7. Create `frontend/src/views/DevelopmentHistory.tsx` - the list page
- [-] 8. Create `frontend/src/views/ChangeDetail.tsx` - the per-entry detail page
- [~] 8. Create `frontend/src/views/ChangeDetail.tsx` - the per-entry detail page
- [x] 8. Create `frontend/src/views/ChangeDetail.tsx` - the per-entry detail page

### Styles

- [-] 9. Create `frontend/src/matrix.css` with the Matrix style definitions - [~] 9. Create `frontend/src/matrix.css` with the Matrix style definitions - [x] 9. Create `frontend/src/matrix.css` with the Matrix style definitions
  (black bg, green text, monospace, scanline glow effect)
- [-] 10. Apply Matrix styles to both new pages
- [x] 10. Apply Matrix styles to both new pages

### GitHub Actions

- [-] 11. Create `.github/workflows/generate-change-entry.yml` that fires on - [~] 11. Create `.github/workflows/generate-change-entry.yml` that fires on - [x] 11. Create `.github/workflows/generate-change-entry.yml` that fires on
  every push to `main`, reads the latest merge commit message, generates
  a markdown file, and updates `index.json`

### Tests

- [-] 12. Write a Vitest unit test for `DevelopmentHistory` component
- [~] 12. Write a Vitest unit test for `DevelopmentHistory` component
- [x] 12. Write a Vitest unit test for `DevelopmentHistory` component
- [-] 13. Write a Vitest unit test for `ChangeDetail` component
- [~] 13. Write a Vitest unit test for `ChangeDetail` component
- [x] 13. Write a Vitest unit test for `ChangeDetail` component

### Final

- [-] 14. Verify all existing tests still pass
- [x] 14. Verify all existing tests still pass
- [-] 15. Commit and open PR to `main`
- [~] 15. Commit and open PR to `main`
- [x] 15. Commit and open PR to `main`
