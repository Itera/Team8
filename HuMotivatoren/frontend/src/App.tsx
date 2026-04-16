import { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import type { MotivationRequest, MotivationResponse } from './types';
import DevelopmentHistory from './views/DevelopmentHistory';
import ChangeDetail from './views/ChangeDetail';
import { CowsayBubble } from './components/CowsayBubble';
import { IrrelevantStats } from './components/IrrelevantStats';
import './bladerunner.css';

// Cat words in many languages
const CAT_REGEX = /\b(cat|cats|kitten|kittens|kitty|kitties|katt|katten|katter|kattene|kattunge|kattungen|kattunger|kattungene|gato|gatos|gatito|gatitos|chat|chats|chaton|chatons|katze|katzen|kätzchen|gatto|gatti|gattino|kat|katte|killing|killingen|poes|poesje|kot|koty|kotek|kissa|kissoja|猫|貓|ねこ|قطة)\b/i;

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
  const [catImageUrl, setCatImageUrl] = useState<string | null>(null);
  const [catFact, setCatFact] = useState<string | null>(null);
  const [catBreed, setCatBreed] = useState<{ name: string; temperament: string; description: string } | null>(null);
  const lastFetchedFor = useRef<string | null>(null);

  useEffect(() => {
    const hasCat = CAT_REGEX.test(task);
    if (hasCat && lastFetchedFor.current !== task) {
      lastFetchedFor.current = task;
      fetch('https://api.thecatapi.com/v1/images/search?has_breeds=1')
        .then((r) => r.json())
        .then((data: { url: string; breeds?: { name: string; temperament: string; description: string }[] }[]) => {
          if (data?.[0]?.url) setCatImageUrl(data[0].url);
          const breed = data?.[0]?.breeds?.[0];
          if (breed) setCatBreed({ name: breed.name, temperament: breed.temperament, description: breed.description });
        })
        .catch(() => {});
      fetch('https://catfact.ninja/fact')
        .then((r) => r.json())
        .then((data: { fact: string }) => { if (data?.fact) setCatFact(data.fact); })
        .catch(() => {});
    } else if (!hasCat) {
      setCatImageUrl(null);
      setCatFact(null);
      setCatBreed(null);
      lastFetchedFor.current = null;
    }
  }, [task]);

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
            catImageUrl={catImageUrl}
            catFact={catFact}
            catBreed={catBreed}
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
  catImageUrl: string | null;
  catFact: string | null;
  catBreed: { name: string; temperament: string; description: string } | null;
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
  catImageUrl,
  catFact,
  catBreed,
}: HomeProps) {
  return (
    <div className="bladerunner-page">
      <div className="bladerunner-scanline" />

      {/* Real cat photo overlay when cat word is detected */}
      {catImageUrl && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundImage: `url(${catImageUrl})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          opacity: 0.18, pointerEvents: 'none', zIndex: 0,
        }} />
      )}
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

            {/* Cat info card — appears when a cat word is typed */}
            {catImageUrl && (
              <div style={{
                background: 'rgba(0,255,255,0.07)', border: '1px solid var(--br-cyan)',
                borderRadius: '4px', padding: '1rem 1.25rem', marginBottom: '1rem',
                display: 'flex', gap: '1rem', alignItems: 'flex-start',
              }}>
                <img src={catImageUrl} alt="Søt katt"
                  style={{ width: '110px', height: '110px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0, border: '1px solid var(--br-cyan)' }}
                />
                <div>
                  {catBreed && (
                    <>
                      <p style={{ margin: '0 0 0.2rem', fontWeight: 'bold', color: 'var(--br-cyan)', fontSize: '1rem' }}>🐱 {catBreed.name}</p>
                      <p style={{ margin: '0 0 0.3rem', color: 'var(--br-orange)', fontSize: '0.85rem' }}>🎭 {catBreed.temperament}</p>
                      <p style={{ margin: '0 0 0.5rem', color: 'var(--br-text)', fontSize: '0.88rem' }}>{catBreed.description}</p>
                    </>
                  )}
                  {catFact && <p style={{ margin: 0, color: 'var(--br-text)', fontSize: '0.88rem', fontStyle: 'italic' }}>💡 {catFact}</p>}
                </div>
              </div>
            )}
            
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
              {loading ? "🤖 AI genererer..." : "Gi meg motivasjon! 💪"}
            </button>
          </form>

          {loading && (
            <div
              style={{
                background: "rgba(0,255,255,0.07)",
                border: "1px solid var(--br-cyan)",
                borderRadius: "4px",
                padding: "2rem",
                textAlign: "center",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            >
              <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
              <p style={{ color: "var(--br-cyan)", fontSize: "1.2rem", margin: 0 }}>
                🤖 Henter motivasjon fra AI...
              </p>
            </div>
          )}

          {error && (
            <div className="bladerunner-error">
              <p style={{ margin: 0 }}>😅 {error}</p>
            </div>
          )}

          {result && (
            <div className="bladerunner-result" style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  top: "1rem",
                  right: "1rem",
                  background: "var(--br-cyan)",
                  color: "#0a0a0f",
                  fontSize: "0.72rem",
                  fontWeight: "bold",
                  padding: "0.25rem 0.65rem",
                  borderRadius: "2px",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                ✨ AI-generert
              </span>

              <p
                style={{
                  fontSize: "0.85rem",
                  color: "var(--br-orange)",
                  margin: "0 0 1rem 0",
                  fontStyle: "italic",
                }}
              >
                Motivasjon for: {task}
              </p>
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

              {result.gifUrl && !catImageUrl && (
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

              {/* Cat section in result */}
              {catImageUrl && (catBreed || catFact) && (
                <div style={{ marginTop: '1.5rem', background: 'rgba(0,255,255,0.07)', border: '1px solid var(--br-cyan)', borderRadius: '4px', padding: '1rem' }}>
                  <h2 style={{ color: 'var(--br-cyan)', marginBottom: '0.5rem', fontSize: '1.2rem' }}>🐱 Katte-fakta</h2>
                  {catBreed && <p style={{ margin: '0 0 0.3rem', fontWeight: 'bold', color: 'var(--br-orange)' }}>{catBreed.name} — {catBreed.temperament}</p>}
                  {catFact && <p style={{ margin: 0, color: 'var(--br-text)', fontStyle: 'italic' }}>{catFact}</p>}
                </div>
              )}

              {catImageUrl && (
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem', flexWrap: 'wrap' }}>
                  {result.gifUrl && (
                    <img src={result.gifUrl} alt="Motiverende GIF"
                      style={{ flex: '1 1 45%', maxWidth: '48%', minWidth: '200px', border: '2px solid var(--br-cyan)', objectFit: 'cover' }}
                    />
                  )}
                  <img src={catImageUrl} alt="Søt katt"
                    style={{ flex: '1 1 45%', maxWidth: '48%', minWidth: '200px', border: '2px solid var(--br-cyan)', objectFit: 'cover' }}
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
