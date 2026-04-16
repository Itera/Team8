import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ChangeDetail from "../views/ChangeDetail";

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

const FAKE_ENTRY = {
  hash: "abc1234",
  title: "feat: add login page",
  date: "2026-04-10T12:00:00Z",
  author: "alice",
  content: FAKE_MARKDOWN,
};

function renderWithHash(hash: string) {
  return render(
    <MemoryRouter initialEntries={[`/development_history/${hash}`]}>
      <Routes>
        <Route path="/development_history/:hash" element={<ChangeDetail />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ChangeDetail", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn().mockImplementation((input: string | URL | Request) => {
      const url = String(input);

      if (url === "http://localhost:3001/api/development-history/abc1234") {
        return Promise.resolve({
          ok: true,
          json: async () => FAKE_ENTRY,
        });
      }

      return Promise.resolve({ ok: false, status: 404 });
    });

    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the page heading", async () => {
    renderWithHash("abc1234");

    expect(
      screen.getByText(/change detail/i),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByText(/Added the login page with form validation/i),
      ).toBeInTheDocument();
    });
  });

  it("shows loading state initially", () => {
    fetchMock.mockImplementationOnce(() => new Promise(() => {}));

    renderWithHash("abc1234");

    expect(screen.getByText(/loading change/i)).toBeInTheDocument();
  });

  it("requests the backend detail endpoint", async () => {
    renderWithHash("abc1234");

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:3001/api/development-history/abc1234",
      );
    });
  });

  it("renders markdown content after load", async () => {
    renderWithHash("abc1234");

    await waitFor(() => {
      expect(
        screen.getByText(/Added the login page with form validation/i),
      ).toBeInTheDocument();
    });
  });

  it("renders meta information from the API response", async () => {
    renderWithHash("abc1234");

    await waitFor(() => {
      expect(screen.getAllByText("alice").length).toBeGreaterThan(0);
    });

    expect(screen.getAllByText("abc1234").length).toBeGreaterThan(0);
  });

  it("shows back link to history", async () => {
    renderWithHash("abc1234");

    const link = screen.getByText(/Back to History/i);
    expect(link.closest("a")).toHaveAttribute("href", "/development_history");

    await waitFor(() => {
      expect(
        screen.getByText(/Added the login page with form validation/i),
      ).toBeInTheDocument();
    });
  });

  it("shows error when the history entry is not found", async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 404 });

    renderWithHash("notexist");

    await waitFor(() => {
      expect(screen.getByText(/\[ERROR\]/i)).toBeInTheDocument();
    });
  });

  it("renders list items from markdown", async () => {
    renderWithHash("abc1234");

    await waitFor(() => {
      expect(
        screen.getByText(/Created LoginPage component/i),
      ).toBeInTheDocument();
    });

    expect(screen.getByText(/Added route \/login/i)).toBeInTheDocument();
  });
});
