import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import App from "../App";

const MOCK_RESPONSE = {
  quote: "Du klarer det!",
  fact: "Visste du at 90% av alle statistikker er oppdiktet?",
  tip: "Ta en kopp kaffe og ga for det",
  emoji: "🚀",
  personality: "silly",
};

const MOCK_HISTORY_ENTRIES = [
  {
    hash: "abc1234",
    title: "feat: add development history route",
    date: "2026-04-10T12:00:00Z",
    author: "alice",
  },
];

function renderApp(initialEntries: string[] = ["/"]) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <App />
    </MemoryRouter>,
  );
}

describe("App", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((input: string | URL | Request) => {
        const url = String(input);

        if (url === "/api/motivate") {
          return Promise.resolve({
            ok: true,
            json: async () => MOCK_RESPONSE,
          });
        }

        if (url === "http://localhost:3001/api/development-history") {
          return Promise.resolve({
            ok: true,
            json: async () => MOCK_HISTORY_ENTRIES,
          });
        }

        return Promise.resolve({ ok: false, status: 404 });
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders HuMotivatoren heading", () => {
    renderApp();
    expect(screen.getByText(/HuMotivatoren/i)).toBeInTheDocument();
  });

  it("renders the task input field", () => {
    renderApp();
    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
  });

  it("renders the submit button", () => {
    renderApp();
    expect(
      screen.getByRole("button", { name: /start mission/i }),
    ).toBeInTheDocument();
  });

  it("navigates from the home page to development history", async () => {
    renderApp();

    fireEvent.click(screen.getByRole("link", { name: /development history/i }));

    expect(screen.getByText(/development_history/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByRole("link", { name: /feat: add development history route/i }),
      ).toBeInTheDocument();
    });
  });

  it("renders personality buttons", () => {
    renderApp();
    expect(screen.getByRole("button", { name: "Useriøs Litt kaos, mye sjarm" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Seriøs Fokus og struktur" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sport Full energi" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Nerd Presisjon og fakta" })).toBeInTheDocument();
  });

  it("shows motivation result after valid submission", async () => {
    renderApp();
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "lese nyheter" } });
    fireEvent.click(screen.getByRole("button", { name: /start mission/i }));

    await waitFor(() => {
      expect(screen.getByText(/Du klarer det/i)).toBeInTheDocument();
    });
  });

  it("does not crash on empty submit", () => {
    renderApp();
    expect(() => {
      fireEvent.click(screen.getByRole("button", { name: /start mission/i }));
    }).not.toThrow();
  });

  it("displays the emoji from response", async () => {
    renderApp();
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "hackathon" },
    });
    fireEvent.click(screen.getByRole("button", { name: /start mission/i }));

    await waitFor(() => {
      expect(screen.getByText("🚀")).toBeInTheDocument();
    });
  });

  it("renders the chaos dashboard route", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          locationName: "Gran Canaria",
          latitude: 27.9206,
          longitude: -15.5477,
          temperature: 25,
          windSpeed: 12,
          precipitation: 0,
          weatherCode: 0,
          summary: "Klar himmel, nesten mistenkelig bra forhold.",
          chaosLevel: 18,
          verdict: "Optimal dag for å late som du har full kontroll.",
          recommendedAction: "Del oppgaven og sett en tydelig første milepæl.",
        }),
      }),
    );

    render(
      <MemoryRouter initialEntries={["/chaos"]}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Chaos Dashboard/i)).toBeInTheDocument();
    expect(await screen.findByText(/Gran Canaria/i)).toBeInTheDocument();
  });

  it("auto-triggers motivation when selecting a category", async () => {
    renderApp();
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "lese nyheter" } });
    fireEvent.click(screen.getByRole("button", { name: "Sport Full energi" }));

    await waitFor(() => {
      expect(vi.mocked(fetch)).toHaveBeenCalledWith(
        "/api/motivate",
        expect.objectContaining({
          method: "POST",
        }),
      );
    });
  });
});
