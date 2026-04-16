import { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import type { MotivationRequest, MotivationResponse } from './types';
import DevelopmentHistory from './views/DevelopmentHistory';
import ChangeDetail from './views/ChangeDetail';
import { CowsayBubble } from './components/CowsayBubble';
import { IrrelevantStats } from './components/IrrelevantStats';

// Cat words in many languages
const CAT_REGEX = /\b(cat|cats|kitten|kittens|kitty|kitties|katt|katten|katter|kattene|kattunge|kattungen|kattunger|kattungene|gato|gatos|gatito|gatitos|chat|chats|chaton|chatons|katze|katzen|k\u00e4tzchen|gatto|gatti|gattino|kat|katte|killing|killingen|poes|poesje|kot|koty|kotek|kissa|kissoja|\u732b|\u8c93|\u306d\u3053|\u0642\u0637\u0629)\b/i;

const QUOTES: Record<string, { content: string; author: string }[]> = {
  silly: [
    { content: "If at first you don't succeed, then skydiving definitely isn't for you.", author: "Steven Wright" },
    { content: "The road to success is dotted with many tempting parking spaces.", author: "Will Rogers" },
    { content: "People say nothing is impossible, but I do nothing every day.", author: "A.A. Milne" },
    { content: "I always wanted to be somebody, but now I realize I should have been more specific.", author: "Lily Tomlin" },
    { content: "The elevator to success is out of order. You'll have to use the stairs.", author: "Joe Girard" },
  ],
  serious: [
    { content: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { content: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
    { content: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
    { content: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { content: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  ],
  sports: [
    { content: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" },
    { content: "Champions keep playing until they get it right.", author: "Billie Jean King" },
    { content: "It's not whether you get knocked down, it's whether you get up.", author: "Vince Lombardi" },
    { content: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke" },
    { content: "The more I practice, the luckier I get.", author: "Gary Player" },
  ],
  nerdy: [
    { content: "First, solve the problem. Then, write the code.", author: "John Johnson" },
    { content: "Any sufficiently advanced technology is indistinguishable from magic.", author: "Arthur C. Clarke" },
    { content: "The best way to predict the future is to invent it.", author: "Alan Kay" },
    { content: "Programs must be written for people to read, and only incidentally for machines to execute.", author: "Harold Abelson" },
    { content: "Simplicity is the soul of efficiency.", author: "Austin Freeman" },
  ],
};

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
  const [quotableQuote, setQuotableQuote] = useState<{ content: string; author: string } | null>(null);
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
    const pool = QUOTES[personality];
    setQuotableQuote(pool[Math.floor(Math.random() * pool.length)]);
    try {
      const request: MotivationRequest = { task: task.trim(), personality };
      const response = await fetch("/api/motivate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });
      if (!response.ok) throw new Error(`Server responded with ${response.status}`);
      setResult(await response.json());
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
            quotableQuote={quotableQuote}
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
  quotableQuote: { content: string; author: string } | null;
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
  quotableQuote,
}: HomeProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "2rem",
        fontFamily: "system-ui, -apple-system, sans-serif",
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Real cat photo overlay when cat word is detected */}
      {catImageUrl && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundImage: `url(${catImageUrl})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          opacity: 0.35, pointerEvents: 'none', zIndex: 0,
          transition: 'opacity 0.6s ease',
        }} />
      )}
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          textAlign: "center",
          position: 'relative',
          zIndex: 1,
        }}
      >
        <header style={{ marginBottom: "2rem" }}>
          <h1
            style={{
              fontSize: "3.5rem",
              color: "white",
              margin: 0,
              textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
            }}
          >
            HuMotivatoren
          </h1>
          <p
            style={{
              fontSize: "1.5rem",
              color: "rgba(255,255,255,0.9)",
              marginTop: "0.5rem",
            }}
          >
            Fa (u)relevant inspirasjon til det du skal gjore
          </p>
          <nav style={{ marginTop: "1rem" }}>
            <Link
              to="/development_history"
              style={{
                color: "rgba(255,255,255,0.8)",
                fontSize: "0.9rem",
                textDecoration: "none",
                borderBottom: "1px solid rgba(255,255,255,0.4)",
                paddingBottom: "2px",
              }}
            >
              development_history
            </Link>
          </nav>
        </header>

        <main>
          <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
            <input
              type="text"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="Hva skal du gjøre? (f.eks. 'lese nyheter')"
              disabled={loading}
              style={{
                width: "100%",
                padding: "1rem 1.5rem",
                fontSize: "1.2rem",
                border: "none",
                borderRadius: "12px",
                marginBottom: "1rem",
                boxSizing: "border-box",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              }}
            />

            <CowsayBubble inputText={task} />
            <IrrelevantStats inputText={task} />

            {/* Cat info card — appears as soon as a cat word is typed */}
            {catImageUrl && (
              <div style={{
                background: 'rgba(255,255,255,0.92)', borderRadius: '12px',
                padding: '1.25rem 1.5rem', marginBottom: '1rem',
                textAlign: 'left', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                display: 'flex', gap: '1.25rem', alignItems: 'flex-start',
              }}>
                <img src={catImageUrl} alt="S\u00f8t katt"
                  style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '10px', flexShrink: 0 }}
                />
                <div>
                  {catBreed && (
                    <>
                      <p style={{ margin: '0 0 0.25rem', fontWeight: 'bold', color: '#764ba2', fontSize: '1rem' }}>\uD83D\uDC31 {catBreed.name}</p>
                      <p style={{ margin: '0 0 0.4rem', color: '#555', fontSize: '0.85rem' }}>\uD83C\uDFAD {catBreed.temperament}</p>
                      <p style={{ margin: '0 0 0.6rem', color: '#374151', fontSize: '0.9rem' }}>{catBreed.description}</p>
                    </>
                  )}
                  {catFact && <p style={{ margin: 0, color: '#374151', fontSize: '0.9rem', fontStyle: 'italic' }}>\uD83D\uDCA1 {catFact}</p>}
                </div>
              </div>
            )}
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '0.5rem', 
              marginBottom: '1rem',
              flexWrap: 'wrap'
            }}>
              {PERSONALITIES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPersonality(value)}
                  style={{
                    padding: "0.75rem 1.25rem",
                    fontSize: "1rem",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    background:
                      personality === value ? "white" : "rgba(255,255,255,0.3)",
                    color: personality === value ? "#764ba2" : "white",
                    fontWeight: personality === value ? "bold" : "normal",
                    transition: "all 0.2s ease",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || !task.trim()}
              style={{
                padding: "1rem 2.5rem",
                fontSize: "1.3rem",
                border: "none",
                borderRadius: "12px",
                cursor: loading || !task.trim() ? "not-allowed" : "pointer",
                background:
                  loading || !task.trim() ? "rgba(255,255,255,0.5)" : "white",
                color: "#764ba2",
                fontWeight: "bold",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                transition: "transform 0.2s ease",
              }}
            >
              {loading ? "⏳ Tenker..." : "Gi meg motivasjon! 💪"}
            </button>
          </form>

          {error && (
            <div
              style={{
                background: "#fee2e2",
                color: "#dc2626",
                padding: "1rem",
                borderRadius: "12px",
                marginBottom: "1rem",
              }}
            >
              <p style={{ margin: 0 }}>😅 {error}</p>
            </div>
          )}

          {result && (
            <div
              style={{
                background: "white",
                borderRadius: "16px",
                padding: "2rem",
                boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                textAlign: "left",
              }}
            >
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
                    color: "#764ba2",
                    marginBottom: "0.5rem",
                    fontSize: "1.2rem",
                  }}
                >
                  💬 Sitat
                </h2>
                {quotableQuote ? (
                  <>
                    <p style={{ fontSize: '1.3rem', fontStyle: 'italic', margin: '0 0 0.4rem', color: '#374151' }}>
                      "{quotableQuote.content}"
                    </p>
                    <p style={{ margin: 0, color: '#764ba2', fontWeight: 'bold', fontSize: '0.9rem' }}>— {quotableQuote.author}</p>
                  </>
                ) : (
                  <p
                    style={{
                      fontSize: "1.3rem",
                      fontStyle: "italic",
                      margin: 0,
                      color: "#374151",
                    }}
                  >
                    "{result.quote}"
                  </p>
                )}
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <h2
                  style={{
                    color: "#764ba2",
                    marginBottom: "0.5rem",
                    fontSize: "1.2rem",
                  }}
                >
                  📚 Fakta
                </h2>
                <p style={{ margin: 0, color: "#374151" }}>{result.fact}</p>
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <h2
                  style={{
                    color: "#764ba2",
                    marginBottom: "0.5rem",
                    fontSize: "1.2rem",
                  }}
                >
                  💡 Tips
                </h2>
                <p style={{ margin: 0, color: "#374151" }}>{result.tip}</p>
              </div>

              {result.gifUrl && !catImageUrl && (
                <div style={{ textAlign: "center", marginTop: "1rem" }}>
                  <img
                    src={result.gifUrl}
                    alt="Motiverende GIF"
                    style={{
                      maxWidth: "100%",
                      borderRadius: "12px",
                      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                    }}
                  />
                </div>
              )}

              {/* Cat section */}
              {catImageUrl && (catBreed || catFact) && (
                <div style={{ marginTop: '1.5rem', background: '#fef9ff', borderRadius: '10px', padding: '1rem' }}>
                  <h2 style={{ color: '#764ba2', marginBottom: '0.5rem', fontSize: '1.2rem' }}>🐱 Katte-fakta</h2>
                  {catBreed && <p style={{ margin: '0 0 0.3rem', fontWeight: 'bold', color: '#555' }}>{catBreed.name} — {catBreed.temperament}</p>}
                  {catFact && <p style={{ margin: 0, color: '#374151', fontStyle: 'italic' }}>{catFact}</p>}
                </div>
              )}

              {/* Cat image next to GIF */}
              {catImageUrl && (
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem', flexWrap: 'wrap' }}>
                  {result.gifUrl && (
                    <img src={result.gifUrl} alt="Motiverende GIF"
                      style={{ flex: '1 1 45%', maxWidth: '48%', minWidth: '200px', borderRadius: '12px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', objectFit: 'cover' }}
                    />
                  )}
                  <img src={catImageUrl} alt="S\u00f8t katt"
                    style={{ flex: '1 1 45%', maxWidth: '48%', minWidth: '200px', borderRadius: '12px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', objectFit: 'cover' }}
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
