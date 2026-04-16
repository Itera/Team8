import { useState } from 'react';
import type { MotivationRequest, MotivationResponse } from './types';

function App() {
  const [task, setTask] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MotivationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const request: MotivationRequest = { task: task.trim() };
      const response = await fetch('/api/motivate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data: MotivationResponse = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Noe gikk galt!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎉 HuMotivatoren</h1>
        <p className="subtitle">Din useriøse motivasjonskilde</p>
      </header>

      <main className="app-main">
        <form onSubmit={handleSubmit} className="input-section">
          <label htmlFor="task-input" className="input-label">
            Hva skal du gjøre?
          </label>
          <input
            id="task-input"
            type="text"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="F.eks. skrive en rapport, vaske gulvet, lære TypeScript..."
            className="task-input"
            disabled={loading}
          />
          <button type="submit" className="submit-button" disabled={loading || !task.trim()}>
            {loading ? '⏳ Tenker...' : '🚀 Gi meg inspirasjon!'}
          </button>
        </form>

        {error && (
          <div className="error-message">
            <p>😅 {error}</p>
          </div>
        )}

        {result && (
          <div className="result-section">
            <div className="motivation-card">
              <h2>💡 Motivasjon</h2>
              <p className="motivation-text">{result.motivation}</p>
            </div>

            {result.humor && (
              <div className="humor-card">
                <h2>😂 Humor</h2>
                <p className="humor-text">{result.humor}</p>
              </div>
            )}

            {result.funFact && (
              <div className="fact-card">
                <h2>🤓 Fun fact</h2>
                <p className="fact-text">{result.funFact}</p>
              </div>
            )}

            {result.gifUrl && (
              <div className="gif-card">
                <img src={result.gifUrl} alt="Motiverende GIF" className="result-gif" />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
