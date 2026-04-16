import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { IrrelevantStats } from "../components/IrrelevantStats";
import { getChaosWeather } from "../services/api";
import type { ChaosWeatherResponse } from "../types";
import "../bladerunner.css";

type ChaosDashboardProps = {
  latestTask: string;
};

const DEFAULT_LOCATION_LABEL = "Gran Canaria";

function analyzeTask(task: string, weather?: ChaosWeatherResponse) {
  const normalized = task.trim().toLowerCase();
  const words = normalized ? normalized.split(/\s+/).length : 0;
  const procrastinationHits = ["senere", "kanskje", "orker ikke", "etterpå", "i morgen"].filter((word) =>
    normalized.includes(word),
  ).length;
  const actionHits = ["starte", "bygge", "fullføre", "gjøre", "teste", "send"].filter((word) =>
    normalized.includes(word),
  ).length;

  const weatherChaos = weather?.chaosLevel ?? 20;
  const focus = Math.max(5, Math.min(100, 82 - words * 3 + actionHits * 9 - procrastinationHits * 18));
  const caffeineNeed = Math.max(
    5,
    Math.min(100, 18 + words * 2 + procrastinationHits * 20 + ((weather?.temperature ?? 18) < 12 ? 18 : 0)),
  );

  return {
    chaosLevel: Math.max(5, Math.min(100, weatherChaos + words * 2 + procrastinationHits * 14)),
    focus,
    caffeineNeed,
    progress: Math.max(5, Math.min(100, actionHits * 24 + (words > 0 ? 18 : 0) - procrastinationHits * 10)),
    verdict:
      words === 0
        ? "Ingen oppgave ennå. Dashboardet venter tålmodig på litt menneskelig ambisjon."
        : procrastinationHits > 0
          ? "Du har valgt kreativ utsettelse. Respekt, men systemet ser gjennom det."
          : actionHits > 0
            ? "Dette ser ut som en oppgave med faktisk fremdrift. Farlig nivå av kontroll."
            : "Nøytral oppgave med potensial for både heroisme og små pauser.",
    recommendedAction:
      words === 0
        ? "Skriv inn noe du faktisk skal gjøre, så starter analysen."
        : procrastinationHits > 0
          ? "Velg den minste mulige første handlingen og ignorer resten i fem minutter."
          : "Del oppgaven i tre små steg og ta første steg nå.",
  };
}

export default function ChaosDashboard({ latestTask }: ChaosDashboardProps) {
  const [weather, setWeather] = useState<ChaosWeatherResponse | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [locationMode, setLocationMode] = useState<"default" | "user">("default");

  const seed = latestTask.trim() || "standard";

  useEffect(() => {
    void loadWeather();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const analysis = useMemo(() => analyzeTask(latestTask, weather ?? undefined), [latestTask, weather]);

  async function loadWeather(lat?: number, lon?: number, mode: "default" | "user" = "default") {
    setLoadingWeather(true);
    setWeatherError(null);

    try {
      const data = await getChaosWeather(lat, lon);
      setWeather(data);
      setLocationMode(mode);
    } catch (error) {
      setWeatherError(error instanceof Error ? error.message : "Kunne ikke hente værdata");
    } finally {
      setLoadingWeather(false);
    }
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      void loadWeather();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        void loadWeather(position.coords.latitude, position.coords.longitude, "user");
      },
      () => {
        void loadWeather();
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60_000 },
    );
  }

  const metrics = useMemo(
    () => [
      { label: "Kaosnivå", value: `${analysis.chaosLevel}%` },
      { label: "Fokus", value: `${analysis.focus}%` },
      { label: "Koffeinbehov", value: `${analysis.caffeineNeed}%` },
      { label: "Fremdrift", value: `${analysis.progress}%` },
    ],
    [analysis],
  );

  const signalBars = useMemo(
    () => [
      { label: "Task gravity", value: analysis.progress },
      { label: "Focus lock", value: analysis.focus },
      { label: "Chaos pressure", value: analysis.chaosLevel },
      { label: "Coffee demand", value: analysis.caffeineNeed },
    ],
    [analysis],
  );

  return (
    <div className="bladerunner-page chaos-page">
      <div className="bladerunner-scanline" />
      <header className="bladerunner-header chaos-header">
        <div className="home-kicker">LIVE TELEMETRY</div>
        <h1 className="bladerunner-title">Chaos Dashboard</h1>
        <p className="bladerunner-subtitle">⚡ Analyse av siste oppgave + været som om verden bryr seg ⚡</p>

        <nav className="bladerunner-nav home-nav">
          <Link to="/" className="bladerunner-nav-link">
            🏠 Home
          </Link>
          <Link to="/development_history" className="bladerunner-nav-link">
            📊 Development History
          </Link>
        </nav>
      </header>

      <div className="bladerunner-container chaos-layout">
        <section className="home-panel chaos-panel chaos-summary">
          <div className="home-section-label">Current signal</div>
          <p className="chaos-copy">
            Siste analyserte oppgave: <strong>{latestTask.trim() || "Ingen oppgave ennå"}</strong>
          </p>

          <div className="chaos-location-row">
            <button type="button" className="bladerunner-nav-link chaos-location-btn" onClick={useCurrentLocation}>
              Bruk min plassering
            </button>
            <span className="chaos-location-status">
              {locationMode === "user" ? "Location: user" : `Location: ${DEFAULT_LOCATION_LABEL} (default)`}
            </span>
          </div>

          {loadingWeather && <p className="chaos-status">Henter værdata...</p>}
          {weatherError && <p className="bladerunner-error">[ERROR] {weatherError}</p>}

          {weather && (
            <div className="chaos-weather-card">
              <div className="chaos-weather-location">{weather.locationName}</div>
              <div className="chaos-weather-summary">{weather.summary}</div>
              <div className="chaos-weather-grid">
                <div><span>Temp</span><strong>{Math.round(weather.temperature)}°C</strong></div>
                <div><span>Vind</span><strong>{Math.round(weather.windSpeed)} km/t</strong></div>
                <div><span>Nedbør</span><strong>{weather.precipitation.toFixed(1)} mm</strong></div>
              </div>
              <p className="chaos-copy">{weather.verdict}</p>
              <p className="chaos-copy chaos-action">Anbefaling: {weather.recommendedAction}</p>
            </div>
          )}

          <div className="chaos-metrics">
            {metrics.map((metric) => (
              <article key={metric.label} className="chaos-metric">
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
              </article>
            ))}
          </div>

          <div className="chaos-verdict">
            <div className="home-section-label">Verdict</div>
            <p>{analysis.verdict}</p>
            <p className="chaos-action">Neste steg: {analysis.recommendedAction}</p>
          </div>
        </section>

        <section className="home-panel chaos-panel chaos-stats">
          <div className="home-section-label">Irrelevant analytics</div>
          <IrrelevantStats inputText={seed} />
          <div className="chaos-mini-note">Seed: {seed}</div>
          <div className="chaos-mini-note">Tallene er delvis seriøse og delvis dramatikk.</div>
        </section>

        <section className="home-panel chaos-panel chaos-signals">
          <div className="home-section-label">Signal map</div>
          <div className="chaos-signal-list">
            {signalBars.map((item) => (
              <div key={item.label} className="chaos-signal-row">
                <div className="chaos-signal-head">
                  <span>{item.label}</span>
                  <strong>{item.value}%</strong>
                </div>
                <div className="chaos-signal-track">
                  <div className="chaos-signal-fill" style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
