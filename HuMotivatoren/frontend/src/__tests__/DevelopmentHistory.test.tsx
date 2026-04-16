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

function renderDevelopmentHistory() {
  return render(
    <MemoryRouter>
      <DevelopmentHistory />
    </MemoryRouter>,
  );
}

describe("DevelopmentHistory", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn().mockImplementation((input: string | URL | Request) => {
      const url = String(input);

      if (url === "http://localhost:3001/api/development-history") {
        return Promise.resolve({
          ok: true,
          json: async () => FAKE_INDEX,
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
    renderDevelopmentHistory();

    expect(screen.getByText(/development_history/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/feat: add login page/i)).toBeInTheDocument();
    });
  });

  it("shows a loading message initially", () => {
    fetchMock.mockImplementationOnce(() => new Promise(() => {}));

    renderDevelopmentHistory();

    expect(screen.getByText(/loading entries/i)).toBeInTheDocument();
  });

  it("requests the backend development history endpoint", async () => {
    renderDevelopmentHistory();

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:3001/api/development-history",
      );
    });
  });

  it("renders a link for each entry after load", async () => {
    renderDevelopmentHistory();

    await waitFor(() => {
      expect(screen.getByText(/feat: add login page/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/fix: correct button color/i)).toBeInTheDocument();
  });

  it("links point to the detail route", async () => {
    renderDevelopmentHistory();

    await waitFor(() => {
      expect(screen.getByText(/feat: add login page/i)).toBeInTheDocument();
    });

    const link = screen.getByText(/feat: add login page/i).closest("a");
    expect(link).toHaveAttribute("href", "/development_history/abc1234");
  });

  it("shows entries sorted newest first", async () => {
    renderDevelopmentHistory();

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

  it("shows an empty state without crashing when the backend returns no entries", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    renderDevelopmentHistory();

    await waitFor(() => {
      expect(screen.getByText(/merge timeline :: 0 entries/i)).toBeInTheDocument();
    });

    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });

  it("shows an error message when fetch fails", async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 404 });

    renderDevelopmentHistory();

    await waitFor(() => {
      expect(screen.getByText(/\[ERROR\]/i)).toBeInTheDocument();
    });
  });
});
