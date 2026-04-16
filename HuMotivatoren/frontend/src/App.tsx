import { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import type { MotivationRequest, MotivationResponse } from './types';
import DevelopmentHistory from './views/DevelopmentHistory';
import ChangeDetail from './views/ChangeDetail';
import { CowsayBubble } from './components/CowsayBubble';
import { IrrelevantStats } from './components/IrrelevantStats';
import './bladerunner.css';

type PersonalityOption = NonNullable<MotivationRequest["personality"]>;

const PERSONALITIES: { value: PersonalityOption; label: string }[] = [
  { value: "silly", label: "😜 Useriøs" },
  { value: "serious", label: "🧐 Seriøs" },
  { value: "sports", label: "⚽ Sport" },
  { value: "nerdy", label: "🤓 Nerd" },
];

function App() {
  const [task, setTask] = useState("");
  const [personality, setPersonality] = useState<PersonalityOption>("silly");
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
      const request: MotivationRequest = { task: task.trim(), personality };
      const response = await fetch("/api/motivate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data: MotivationResponse = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Noe gikk galt!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Routes>
      <Route path="/development_history/:hash" element={<ChangeDetail />} />
      <Route path="/development_history" element={<DevelopmentHistory />} />
      <Route
        path="*"
        element={
          <Home
            task={task}
            setTask={setTask}
            personality={personality}
            setPersonality={setPersonality}
            loading={loading}
            result={result}
            error={error}
            handleSubmit={handleSubmit}
          />
        }
      />
    </Routes>
  );
}

interface HomeProps {
  task: string;
  setTask: (v: string) => void;
  personality: PersonalityOption;
  setPersonality: (v: PersonalityOption) => void;
  loading: boolean;
  result: MotivationResponse | null;
  error: string | null;
  handleSubmit: (e: React.FormEvent) => void;
}

function Home({
  task,
  setTask,
  personality,
  setPersonality,
  loading,
  result,
  error,
  handleSubmit,
}: HomeProps) {
  return (
    <div className="bladerunner-page">
      <div className="bladerunner-scanline" />
      <header className="bladerunner-header">
        <h1 className="bladerunner-title">HuMotivatoren</h1>
        <p className="bladerunner-subtitle">⚡ Unreasonably Relevant Motivation Engine ⚡</p>
        <nav className="bladerunner-nav">
          <Link to="/development_history" className="bladerunner-nav-link">
            📊 Development History
          </Link>
        </nav>
      </header>

      <div className="bladerunner-container">
        <main>
          <form onSubmit={handleSubmit} className="bladerunner-form">
            <input
              type="text"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="Hva skal du gjøre? (f.eks. 'lese nyheter')"
              disabled={loading}
              className="bladerunner-input"
            />

            <CowsayBubble inputText={task} />
            <IrrelevantStats inputText={task} />
            
            <div className="bladerunner-button-group">
              {PERSONALITIES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPersonality(value)}
                  className={`bladerunner-button ${personality === value ? 'active' : ''}`}
                >
                  {label}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || !task.trim()}
              className="bladerunner-button bladerunner-submit-btn"
            >
              {loading ? "⏳ Tenker..." : "Gi meg motivasjon! 💪"}
            </button>
          </form>

          {error && (
            <div className="bladerunner-error">
              <p style={{ margin: 0 }}>😅 {error}</p>
            </div>
          )}

          {result && (
            <div className="bladerunner-result">
              <div
                style={{
                  fontSize: "4rem",
                  textAlign: "center",
                  marginBottom: "1rem",
                }}
              >
                {result.emoji}
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <h2
                  style={{
                    color: "var(--br-cyan)",
                    marginBottom: "0.5rem",
                    fontSize: "1.2rem",
                  }}
                >
                  💬 Sitat
                </h2>
                <p
                  style={{
                    fontSize: "1.3rem",
                    fontStyle: "italic",
                    margin: 0,
                    color: "var(--br-text)",
                  }}
                >
                  "{result.quote}"
                </p>
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <h2
                  style={{
                    color: "var(--br-cyan)",
                    marginBottom: "0.5rem",
                    fontSize: "1.2rem",
                  }}
                >
                  📚 Fakta
                </h2>
                <p style={{ margin: 0, color: "var(--br-text)" }}>{result.fact}</p>
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <h2
                  style={{
                    color: "var(--br-cyan)",
                    marginBottom: "0.5rem",
                    fontSize: "1.2rem",
                  }}
                >
                  💡 Tips
                </h2>
                <p style={{ margin: 0, color: "var(--br-text)" }}>{result.tip}</p>
              </div>

              {result.gifUrl && (
                <div style={{ textAlign: "center", marginTop: "1rem" }}>
                  <img
                    src={result.gifUrl}
                    alt="Motiverende GIF"
                    style={{
                      maxWidth: "100%",
                      border: "2px solid var(--br-cyan)",
                      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
