import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ChangeDetail from '../views/ChangeDetail';

const FAKE_MARKDOWN = `# feat: add login page

**Hash:** abc1234
**Date:** 2026-04-10
**Author:** alice

## Summary

Added the login page with form validation.

## Changes

- Created LoginPage component
- Added route /login
`;

const FAKE_INDEX = [
  {
    hash: 'abc1234',
    title: 'feat: add login page',
    date: '2026-04-10T12:00:00Z',
    author: 'alice',
  },
];

function renderWithHash(hash: string) {
  return render(
    <MemoryRouter initialEntries={[`/development_history/${hash}`]}>
      <Routes>
        <Route path="/development_history/:hash" element={<ChangeDetail />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ChangeDetail', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string) => {
        if (url.includes('abc1234.md')) {
          return Promise.resolve({ ok: true, text: async () => FAKE_MARKDOWN });
        }
        if (url.includes('index.json')) {
          return Promise.resolve({ ok: true, json: async () => FAKE_INDEX });
        }
        return Promise.resolve({ ok: false, status: 404 });
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the page heading', () => {
    renderWithHash('abc1234');
    expect(screen.getByText(/development_history :: change/i)).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    renderWithHash('abc1234');
    expect(screen.getByText(/loading change/i)).toBeInTheDocument();
  });

  it('renders markdown content after load', async () => {
    renderWithHash('abc1234');

    await waitFor(() => {
      expect(screen.getByText(/Added the login page with form validation/i)).toBeInTheDocument();
    });
  });

  it('renders meta information from index', async () => {
    renderWithHash('abc1234');

    await waitFor(() => {
      const metaSpans = document.querySelectorAll('.matrix-meta span');
      const authors = Array.from(metaSpans).map((s) => s.textContent);
      expect(authors).toContain('alice');
    });

    const metaSpans = document.querySelectorAll('.matrix-meta span');
    const hashes = Array.from(metaSpans).map((s) => s.textContent);
    expect(hashes).toContain('abc1234');
  });

  it('shows back link to history', () => {
    renderWithHash('abc1234');
    const link = screen.getByText(/\[back to history\]/i);
    expect(link.closest('a')).toHaveAttribute('href', '/development_history');
  });

  it('shows error when markdown file not found', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 404, text: async () => '' })
    );

    renderWithHash('notexist');

    await waitFor(() => {
      expect(screen.getByText(/\[ERROR\]/i)).toBeInTheDocument();
    });
  });

  it('renders list items from markdown', async () => {
    renderWithHash('abc1234');

    await waitFor(() => {
      expect(screen.getByText(/Created LoginPage component/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Added route \/login/i)).toBeInTheDocument();
  });
});
