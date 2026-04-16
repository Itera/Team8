import { useEffect, useRef, useState } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import ChangeDetail from './views/ChangeDetail';
import ChaosDashboard from './views/ChaosDashboard';
import DevelopmentHistory from './views/DevelopmentHistory';
import Features from './views/Features';
import WordOfYourMouth from './views/WordOfYourMouth';
import { CowsayBubble } from './components/CowsayBubble';
import { IrrelevantStats } from './components/IrrelevantStats';
import type { MotivationRequest, MotivationResponse } from './types';
import './bladerunner.css';

type PersonalityOption = NonNullable<MotivationRequest['personality']>;

// Cat words in many languages
const CAT_REGEX = /\b(cat|cats|kitten|kittens|kitty|kitties|katt|katten|katter|kattene|kattunge|kattungen|kattunger|kattungene|gato|gatos|gatito|gatitos|chat|chats|chaton|chatons|katze|katzen|kätzchen|gatto|gatti|gattino|kat|katte|killing|killingen|poes|poesje|kot|koty|kotek|kissa|kissoja|猫|貓|ねこ|قطة)\b/i;

// Rottweiler words in Norwegian, English, and German
const ROTTWEILER_REGEX = /\b(rottweiler|rottweilers|rotty|rottie|rotties|rottvakt|rottvakter)\b/i;

const PERSONALITIES: { value: PersonalityOption; label: string; hint: string }[] = [
  { value: 'silly', label: 'Useriøs', hint: 'Litt kaos, mye sjarm' },
  { value: 'serious', label: 'Seriøs', hint: 'Fokus og struktur' },
  { value: 'sports', label: 'Sport', hint: 'Full energi' },
  { value: 'nerdy', label: 'Nerd', hint: 'Presisjon og fakta' },
];

function App() {
  const [task, setTask] = useState('');
  const [latestTask, setLatestTask] = useState(() => localStorage.getItem('humotivatoren.latestTask') ?? '');
  const [personality, setPersonality] = useState<PersonalityOption>('silly');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MotivationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [catImageUrl, setCatImageUrl] = useState<string | null>(null);
  const [catFact, setCatFact] = useState<string | null>(null);
  const [catBreed, setCatBreed] = useState<{ name: string; temperament: string; description: string } | null>(null);
  const [rottweilerImageUrl, setRottweilerImageUrl] = useState<string | null>(null);
  const [rottweilerFact, setRottweilerFact] = useState<string | null>(null);
  const lastFetchedFor = useRef<string | null>(null);
  const lastFetchedRottweilerFor = useRef<string | null>(null);

  useEffect(() => {
    localStorage.setItem('humotivatoren.latestTask', latestTask);
  }, [latestTask]);

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

  useEffect(() => {
    const hasRottweiler = ROTTWEILER_REGEX.test(task);
    if (hasRottweiler && lastFetchedRottweilerFor.current !== task) {
      lastFetchedRottweilerFor.current = task;
      fetch('https://dog.ceo/api/breed/rottweiler/images/random')
        .then((r) => r.json())
        .then((data: { message: string; status: string }) => {
          if (data?.message) setRottweilerImageUrl(data.message);
        })
        .catch(() => {});
      fetch('https://dogapi.dog/api/v2/facts?limit=1')
        .then((r) => r.json())
        .then((data: { data: { id: string; type: string; attributes: { body: string } }[] }) => {
          if (data?.data?.[0]?.attributes?.body) setRottweilerFact(data.data[0].attributes.body);
        })
        .catch(() => {});
    } else if (!hasRottweiler) {
      setRottweilerImageUrl(null);
      setRottweilerFact(null);
      lastFetchedRottweilerFor.current = null;
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
      setLatestTask(task.trim());

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
    <Routes>
      <Route path="/development_history/:hash" element={<ChangeDetail />} />
      <Route path="/development_history" element={<DevelopmentHistory />} />
      <Route path="/features" element={<Features />} />
      <Route path="/word_of_your_mouth" element={<WordOfYourMouth />} />
      <Route path="/chaos" element={<ChaosDashboard latestTask={latestTask} />} />
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
            rottweilerImageUrl={rottweilerImageUrl}
            rottweilerFact={rottweilerFact}
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
  rottweilerImageUrl: string | null;
  rottweilerFact: string | null;
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
  rottweilerImageUrl,
  rottweilerFact,
}: HomeProps) {
  return (
    <div className="bladerunner-page home-page">
      <div className="bladerunner-scanline" />

      {catImageUrl && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundImage: `url(${catImageUrl})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            opacity: 0.18, pointerEvents: 'none', zIndex: 0,
          }}
          aria-hidden="true"
        />
      )}

      {rottweilerImageUrl && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundImage: `url(${rottweilerImageUrl})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            opacity: 0.12, pointerEvents: 'none', zIndex: 0,
          }}
          aria-hidden="true"
        />
      )}

      <header className="bladerunner-header home-header">
        <div className="home-kicker">MISSION CONTROL</div>
        <h1 className="bladerunner-title">HuMotivatoren</h1>
        <p className="bladerunner-subtitle">⚡ Unreasonably Relevant Motivation Engine ⚡</p>

        <nav className="bladerunner-nav home-nav">
          <Link to="/chaos" className="bladerunner-nav-link">🌪 Chaos Dashboard</Link>
          <Link to="/development_history" className="bladerunner-nav-link">📊 Development History</Link>
          <Link to="/word_of_your_mouth" className="bladerunner-nav-link">👄 Word of Your Mouth</Link>
          <Link to="/features" className="bladerunner-nav-link">✨ Features</Link>
        </nav>
      </header>

      <div className="bladerunner-container home-layout">
        <section className="home-panel home-intro">
          <div className="home-section-label">Briefing</div>
          <h2>Tell oss hva du skal gjøre</h2>
          <p>
            Vi pakker oppgaven din inn i en liten motivasjonsrakett med humor, fakta og akkurat
            nok kaos til at den føles mindre tung.
          </p>

          <div className="home-badges">
            <span>Motivasjon</span>
            <span>Humor</span>
            <span>Fakta</span>
            <span>GIF</span>
          </div>
        </section>

        <section className="home-panel home-form-panel">
          <form onSubmit={handleSubmit} className="bladerunner-form home-form">
            <label className="home-section-label" htmlFor="task-input">Oppdrag</label>
            <input
              id="task-input"
              type="text"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="Hva skal du gjøre? (f.eks. 'lese nyheter')"
              disabled={loading}
              className="bladerunner-input"
            />

            <CowsayBubble inputText={task} />

            {catImageUrl && (
              <div
                role="region"
                aria-label="Katteinformasjon"
                style={{
                  background: 'rgba(0,255,255,0.07)', border: '1px solid var(--br-cyan)',
                  borderRadius: '4px', padding: '1rem 1.25rem', marginBottom: '1rem',
                  display: 'flex', gap: '1rem', alignItems: 'flex-start',
                }}
              >
                <img
                  src={catImageUrl}
                  alt={catBreed ? `${catBreed.name} katt` : 'Søt katt'}
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

            {rottweilerImageUrl && (
              <div role="region" aria-label="Rottweilerinformasjon" style={{
                background: 'rgba(255,140,0,0.07)', border: '1px solid var(--br-orange)',
                borderRadius: '4px', padding: '1rem 1.25rem', marginBottom: '1rem',
                display: 'flex', gap: '1rem', alignItems: 'flex-start',
              }}>
                <img
                  src={rottweilerImageUrl}
                  alt="Rottweiler"
                  style={{ width: '110px', height: '110px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0, border: '1px solid var(--br-orange)' }}
                />
                <div>
                  <p style={{ margin: '0 0 0.2rem', fontWeight: 'bold', color: 'var(--br-orange)', fontSize: '1rem' }}>🐕 Rottweiler</p>
                  <p style={{ margin: '0 0 0.3rem', color: 'var(--br-cyan)', fontSize: '0.85rem' }}>🎭 Lojal, selvsikker, modig</p>
                  {rottweilerFact && <p style={{ margin: 0, color: 'var(--br-text)', fontSize: '0.88rem', fontStyle: 'italic' }}>💡 {rottweilerFact}</p>}
                </div>
              </div>
            )}

            <div className="home-personality-grid">
              {PERSONALITIES.map(({ value, label, hint }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPersonality(value)}
                  className={`home-personality ${personality === value ? 'active' : ''}`}
                >
                  <strong>{label}</strong>
                  <span>{hint}</span>
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || !task.trim()}
              className="bladerunner-button bladerunner-submit-btn home-submit"
            >
              {loading ? '⏳ Tenker...' : 'Start mission'}
            </button>

            <IrrelevantStats inputText={task} />
          </form>

          {error && (
            <div className="bladerunner-error">
              <p style={{ margin: 0 }}>😅 {error}</p>
            </div>
          )}
        </section>

        {result && (
          <section className="home-panel home-result">
            <div className="home-section-label">Signal received</div>
            <div className="home-result-emoji">{result.emoji}</div>

            <div className="home-result-grid">
              <article>
                <h3>Quote</h3>
                <p>“{result.quote}”</p>
              </article>
              <article>
                <h3>Fakta</h3>
                <p>{result.fact}</p>
              </article>
              <article>
                <h3>Tips</h3>
                <p>{result.tip}</p>
              </article>
            </div>

            {(result.gifUrl || catImageUrl || rottweilerImageUrl) && (
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem', flexWrap: 'wrap' }}>
                {result.gifUrl && (
                  <img src={result.gifUrl} alt="Motiverende GIF"
                    style={{ flex: '1 1 45%', maxWidth: '48%', minWidth: '140px', border: '2px solid var(--br-cyan)', objectFit: 'cover' }} />
                )}
                {catImageUrl && (
                  <img src={catImageUrl} alt={catBreed?.name ?? 'Søt katt'}
                    style={{ flex: '1 1 45%', maxWidth: '48%', minWidth: '140px', border: '2px solid var(--br-cyan)', objectFit: 'cover' }} />
                )}
                {rottweilerImageUrl && (
                  <img src={rottweilerImageUrl} alt="Rottweiler"
                    style={{ flex: '1 1 45%', maxWidth: '48%', minWidth: '140px', border: '2px solid var(--br-orange)', objectFit: 'cover' }} />
                )}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

export default App;
