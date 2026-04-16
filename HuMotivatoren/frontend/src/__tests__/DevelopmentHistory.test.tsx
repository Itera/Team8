import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import DevelopmentHistory from "../views/DevelopmentHistory";

const FAKE_INDEX = [
  {
    hash: "abc1234",
    title: "feat: add login page",
    date: "2026-04-10T12:00:00Z",
    author: "alice",
  },
  {
    hash: "def5678",
    title: "fix: correct button color",
    date: "2026-04-08T09:00:00Z",
    author: "bob",
  },
];

describe("DevelopmentHistory", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => FAKE_INDEX,
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the page heading", async () => {
    render(
      <MemoryRouter>
        <DevelopmentHistory />
      </MemoryRouter>,
    );
    expect(screen.getByText(/development_history/i)).toBeInTheDocument();
  });

  it("shows a loading message initially", () => {
    render(
      <MemoryRouter>
        <DevelopmentHistory />
      </MemoryRouter>,
    );
    expect(screen.getByText(/loading entries/i)).toBeInTheDocument();
  });

  it("renders a link for each entry after load", async () => {
    render(
      <MemoryRouter>
        <DevelopmentHistory />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText(/feat: add login page/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/fix: correct button color/i)).toBeInTheDocument();
  });

  it("links point to the detail route", async () => {
    render(
      <MemoryRouter>
        <DevelopmentHistory />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText(/feat: add login page/i)).toBeInTheDocument();
    });

    const link = screen.getByText(/feat: add login page/i).closest("a");
    expect(link).toHaveAttribute("href", "/development_history/abc1234");
  });

  it("shows entries sorted newest first", async () => {
    render(
      <MemoryRouter>
        <DevelopmentHistory />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText(/feat: add login page/i)).toBeInTheDocument();
    });

    const links = screen
      .getAllByRole("link")
      .filter((l) =>
        l.getAttribute("href")?.startsWith("/development_history/"),
      );
    expect(links[0].textContent).toMatch(/feat: add login page/i);
    expect(links[1].textContent).toMatch(/fix: correct button color/i);
  });

  it("shows an error message when fetch fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 404 }),
    );

    render(
      <MemoryRouter>
        <DevelopmentHistory />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText(/\[ERROR\]/i)).toBeInTheDocument();
    });
  });
});
