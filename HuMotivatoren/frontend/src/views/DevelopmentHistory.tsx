import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../matrix.css';

interface ChangeEntry {
  hash: string;
  title: string;
  date: string;
  author: string;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export default function DevelopmentHistory() {
  const [entries, setEntries] = useState<ChangeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/changes/index.json')
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load index: ${r.status}`);
        return r.json() as Promise<ChangeEntry[]>;
      })
      .then((data) => {
        const sorted = [...data].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setEntries(sorted);
      })
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="matrix-page">
      <div className="matrix-header">
        <h1>development_history</h1>
        <p className="matrix-subtitle">
          {'>>'} merge timeline :: {entries.length} entries :: source: /changes/index.json
        </p>
      </div>

      <nav>
        <Link to="/" className="matrix-back-link">
          [back to main]
        </Link>
      </nav>

      {loading && (
        <p className="matrix-loading">{'>'} loading entries...</p>
      )}

      {error && (
        <p className="matrix-error">{'[ERROR]'} {error}</p>
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
