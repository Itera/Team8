import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDevelopmentHistory } from "../services/api";
import type { DevelopmentHistoryEntry } from "../types";
import "../bladerunner.css";

function formatDate(iso: string): string {
  const d = new Date(iso);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function DevelopmentHistory() {
  const [entries, setEntries] = useState<DevelopmentHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getDevelopmentHistory()
      .then((data) => {
        if (cancelled) {
          return;
        }

        const sorted = [...data].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
        setEntries(sorted);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="bladerunner-page">
      <div className="bladerunner-scanline" />
      <header className="bladerunner-header">
        <h1 className="bladerunner-title">development_history</h1>
        <p className="bladerunner-subtitle">
          ⚡ Merge Timeline :: {entries.length} entries ⚡
        </p>
        <nav className="bladerunner-nav">
          <Link to="/" className="bladerunner-nav-link">
            🏠 Return to Home
          </Link>
        </nav>
      </header>


      <div className="bladerunner-container">
        {loading && <p style={{ color: "var(--br-cyan)" }}>{">"} loading entries...</p>}

        {error && (
          <p className="bladerunner-error">
            {"[ERROR]"} {error}
          </p>
        )}

        {!loading && !error && (
          <ul className="bladerunner-list" role="list">
            {entries.map((entry) => (
              <li key={entry.hash} className="bladerunner-list-item">
                <Link
                  to={`/development_history/${entry.hash}`}
                  style={{ fontSize: "1.1rem", fontWeight: "bold" }}
                >
                  {entry.title}
                </Link>
                <div className="bladerunner-list-meta">
                  📅 {formatDate(entry.date)} | 👤 {entry.author} | 🔗 {entry.hash}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
