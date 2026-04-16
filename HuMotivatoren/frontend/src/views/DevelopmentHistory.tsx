import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDevelopmentHistory } from "../services/api";
import type { DevelopmentHistoryEntry } from "../types";
import "../matrix.css";

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
    <div className="matrix-page">
      <div className="matrix-header">
        <h1>development_history</h1>
        <p className="matrix-subtitle">
          {">>"} merge timeline :: {entries.length} entries :: source:
          /api/development-history
        </p>
      </div>

      <nav>
        <Link to="/" className="matrix-back-link">
          [back to main]
        </Link>
      </nav>

      {loading && <p className="matrix-loading">{">"} loading entries...</p>}

      {error && (
        <p className="matrix-error">
          {"[ERROR]"} {error}
        </p>
      )}

      {!loading && !error && (
        <ul className="matrix-list" role="list">
          {entries.map((entry) => (
            <li key={entry.hash} className="matrix-list-item">
              <span className="matrix-date">{formatDate(entry.date)}</span>
              <span className="matrix-author">{entry.author}</span>
              <span className="matrix-hash">[{entry.hash}]</span>
              <Link
                to={`/development_history/${entry.hash}`}
                className="matrix-entry-link"
              >
                {entry.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
