import './App.css';
import { useState, useId } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import type { MotivationRequest, MotivationResponse } from './types';
import { IrrelevantStats } from './components/IrrelevantStats';
import { CowsayBubble } from './components/CowsayBubble';

/* ── Types ── */
type PersonalityOption = NonNullable<MotivationRequest['personality']>;
type Tab = 'motivate' | 'quotes';

/* ── Constants ── */
const PERSONALITIES: { value: PersonalityOption; label: string; emoji: string }[] = [
  { value: 'silly',   label: 'Useriøs', emoji: '😜' },
  { value: 'serious', label: 'Seriøs',  emoji: '🧐' },
  { value: 'sports',  label: 'Sport',   emoji: '⚽' },
  { value: 'nerdy',   label: 'Nerd',    emoji: '🤓' },
];

const QUOTES: Record<PersonalityOption, { content: string; author: string }[]> = {
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

/* ── API helpers (used by TanStack mutations/queries) ── */
async function fetchMotivation(req: MotivationRequest): Promise<MotivationResponse> {
  const res = await fetch('/api/motivate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // Input is already trimmed + length-validated client-side; server validates again
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Server svarte med ${res.status}`);
  }
  return res.json() as Promise<MotivationResponse>;
}

const CAT_REGEX = /\b(cat|cats|kitten|kittens|kitty|katt|katten|katter|kattunge|gato|chat|katze|gatto|kot|kissa|猫|貓|ねこ|قطة)\b/i;

async function fetchCatData() {
  const [imgRes, factRes] = await Promise.all([
    fetch('https://api.thecatapi.com/v1/images/search?has_breeds=1'),
    fetch('https://catfact.ninja/fact'),
  ]);
  const [imgData, factData] = await Promise.all([imgRes.json(), factRes.json()]) as [
    { url: string; breeds?: { name: string; temperament: string; description: string }[] }[],
    { fact: string },
  ];
  return {
    imageUrl: imgData?.[0]?.url ?? null,
    breed: imgData?.[0]?.breeds?.[0] ?? null,
    fact: factData?.fact ?? null,
  };
}

/* ── App ── */
export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('motivate');
  const tabPanelId = useId();

  return (
    <div className="app-shell">
      <div className="orb orb-1" aria-hidden="true" />
      <div className="orb orb-2" aria-hidden="true" />
      <div className="orb orb-3" aria-hidden="true" />

      <div className="app-container">
        <header className="app-header">
          <h1 className="app-title">
            HuMotivatoren <span className="rocket" aria-hidden="true">🚀</span>
          </h1>
          <p className="app-subtitle">Få (u)relevant inspirasjon til det du skal gjøre</p>
        </header>

        {/* ── Tab bar ── */}
        <nav className="tab-bar" role="tablist" aria-label="Seksjoner">
          {([
            { id: 'motivate' as Tab, label: '💪 Motivér meg', desc: 'Motivasjon og statistikk' },
            { id: 'quotes'   as Tab, label: '💬 Sitater',     desc: 'Inspirerende sitater' },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              role="tab"
              id={`tab-${tab.id}`}
              aria-controls={`${tabPanelId}-${tab.id}`}
              aria-selected={activeTab === tab.id}
              className={`tab-btn${activeTab === tab.id ? ' active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.label}</span>
              <span className="tab-desc">{tab.desc}</span>
            </button>
          ))}
        </nav>

        {/* ── Panels ── */}
        <main>
          <div
            role="tabpanel"
            id={`${tabPanelId}-motivate`}
            aria-labelledby="tab-motivate"
            hidden={activeTab !== 'motivate'}
          >
            {activeTab === 'motivate' && <MotivatePanel />}
          </div>
          <div
            role="tabpanel"
            id={`${tabPanelId}-quotes`}
            aria-labelledby="tab-quotes"
            hidden={activeTab !== 'quotes'}
          >
            {activeTab === 'quotes' && <QuotesPanel />}
          </div>
        </main>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   TAB 1 — Motivate + Statistics
══════════════════════════════════════════ */
function MotivatePanel() {
  const [task, setTask] = useState('');
  const [personality, setPersonality] = useState<PersonalityOption>('silly');
  const inputId = useId();

  // Cat data query — only enabled when input contains a cat word
  const hasCat = CAT_REGEX.test(task);
  const catQuery = useQuery({
    queryKey: ['cat', task],
    queryFn: fetchCatData,
    enabled: hasCat,
    staleTime: 60_000,
  });

  // Motivation mutation (POST, not a GET query)
  const motivationMutation = useMutation({
    mutationFn: fetchMotivation,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = task.trim();
    if (!trimmed || trimmed.length > 280) return;
    motivationMutation.mutate({ task: trimmed, personality });
  };

  const result = motivationMutation.data;
  const isLoading = motivationMutation.isPending;
  const errorMsg = motivationMutation.error?.message;

  return (
    <>
      {/* Cat background overlay */}
      {catQuery.data?.imageUrl && (
        <div
          className="cat-bg visible"
          style={{ backgroundImage: `url(${catQuery.data.imageUrl})` }}
          aria-hidden="true"
        />
      )}

      <div className="glass-card">
        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor={inputId} className="field-label">Hva skal du gjøre?</label>
          <input
            id={inputId}
            type="text"
            className="task-input"
            value={task}
            onChange={(e) => {
              const val = e.target.value;
              if (val.length <= 280) setTask(val);
            }}
            placeholder="F.eks. 'lese nyheter' eller 'trene'"
            disabled={isLoading}
            maxLength={280}
            autoComplete="off"
            aria-describedby={errorMsg ? 'motivate-error' : undefined}
          />
          <div className="char-count" aria-live="polite" aria-atomic="true">
            {task.length > 240 && <span>{280 - task.length} tegn igjen</span>}
          </div>

          {/* Cat info card */}
          {catQuery.data?.imageUrl && (
            <div className="cat-card mt-2" role="region" aria-label="Katteinformasjon">
              <img src={catQuery.data.imageUrl} alt={catQuery.data.breed ? `${catQuery.data.breed.name} katt` : 'Søt katt'} />
              <div>
                {catQuery.data.breed && (
                  <>
                    <p className="cat-card-breed">🐱 {catQuery.data.breed.name}</p>
                    <p className="cat-card-temperament">🎭 {catQuery.data.breed.temperament}</p>
                    <p className="cat-card-desc">{catQuery.data.breed.description}</p>
                  </>
                )}
                {catQuery.data.fact && <p className="cat-card-fact">💡 {catQuery.data.fact}</p>}
              </div>
            </div>
          )}

          {/* Live cowsay preview */}
          <div className="mt-2">
            <CowsayBubble inputText={task} />
          </div>

          {/* Personality selector */}
          <fieldset className="personality-fieldset mt-2">
            <legend className="field-label">Velg tone:</legend>
            <div className="personality-group" role="group">
              {PERSONALITIES.map(({ value, label, emoji }) => (
                <button
                  key={value}
                  type="button"
                  className={`personality-btn${personality === value ? ' active' : ''}`}
                  aria-pressed={personality === value}
                  onClick={() => setPersonality(value)}
                >
                  <span aria-hidden="true">{emoji}</span> {label}
                </button>
              ))}
            </div>
          </fieldset>

          <button
            type="submit"
            className="submit-btn"
            disabled={isLoading || !task.trim()}
            aria-busy={isLoading}
          >
            {isLoading ? '⏳ Tenker...' : 'Gi meg motivasjon! 💪'}
          </button>
        </form>

        {errorMsg && (
          <div id="motivate-error" className="error-box" role="alert" aria-live="assertive">
            ❌ {errorMsg}
          </div>
        )}
      </div>

      {/* Skeleton while loading */}
      {isLoading && (
        <div className="result-card" aria-busy="true" aria-label="Laster motivasjon...">
          <div className="skeleton-line wide" />
          <div className="skeleton-line medium" />
          <div className="skeleton-line narrow" />
          <div className="skeleton-line wide mt-2" />
          <div className="skeleton-line medium" />
        </div>
      )}

      {/* Result */}
      {result && !isLoading && (
        <article className="result-card" aria-label="Motivasjonssvar">
          <span className="result-emoji" aria-hidden="true">{result.emoji}</span>

          <p className="result-section-title">💬 Sitat</p>
          <p className="result-quote">"{result.quote}"</p>

          <hr className="result-divider" />
          <p className="result-section-title">📚 Fakta</p>
          <p className="result-text">{result.fact}</p>

          <hr className="result-divider" />
          <p className="result-section-title">💡 Tips</p>
          <p className="result-text">{result.tip}</p>

          {catQuery.data?.breed && catQuery.data?.fact && (
            <>
              <hr className="result-divider" />
              <p className="result-section-title">🐱 Katte-fakta</p>
              <p className="result-text" style={{ fontWeight: 600, color: '#764ba2', marginBottom: '0.3rem' }}>
                {catQuery.data.breed.name} — {catQuery.data.breed.temperament}
              </p>
              <p className="result-text" style={{ fontStyle: 'italic' }}>{catQuery.data.fact}</p>
            </>
          )}

          {(result.gifUrl || catQuery.data?.imageUrl) && (
            <div className="result-image-row">
              {result.gifUrl && <img src={result.gifUrl} alt="Motiverende illustrasjon" />}
              {catQuery.data?.imageUrl && (
                <img src={catQuery.data.imageUrl} alt={catQuery.data.breed?.name ?? 'Søt katt'} />
              )}
            </div>
          )}
        </article>
      )}

      {/* Statistics — shown as soon as user types */}
      {task.trim() && (
        <section className="mt-3" aria-label="Statistikk">
          <IrrelevantStats inputText={task} />
        </section>
      )}
    </>
  );
}

/* ══════════════════════════════════════════
   TAB 2 — Quotes
══════════════════════════════════════════ */
function QuotesPanel() {
  const [activePersonality, setActivePersonality] = useState<PersonalityOption>('silly');
  const [currentIdx, setCurrentIdx] = useState(0);

  const quotes = QUOTES[activePersonality];
  const quote = quotes[currentIdx];

  const handlePersonalityChange = (p: PersonalityOption) => {
    setActivePersonality(p);
    setCurrentIdx(0);
  };

  const next = () => setCurrentIdx((i) => (i + 1) % quotes.length);
  const prev = () => setCurrentIdx((i) => (i - 1 + quotes.length) % quotes.length);

  return (
    <div className="glass-card">
      <h2 className="panel-title">💬 Inspirerende sitater</h2>
      <p className="panel-subtitle">Velg kategori og bla gjennom sitater</p>

      {/* Personality filter */}
      <fieldset className="personality-fieldset mt-2">
        <legend className="field-label">Kategori:</legend>
        <div className="personality-group">
          {PERSONALITIES.map(({ value, label, emoji }) => (
            <button
              key={value}
              type="button"
              className={`personality-btn${activePersonality === value ? ' active' : ''}`}
              aria-pressed={activePersonality === value}
              onClick={() => handlePersonalityChange(value)}
            >
              <span aria-hidden="true">{emoji}</span> {label}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Quote display */}
      <div className="quote-display mt-3" aria-live="polite" aria-atomic="true">
        <blockquote className="quote-blockquote">
          <p className="quote-text">"{quote.content}"</p>
          <footer className="quote-footer">
            <cite>— {quote.author}</cite>
          </footer>
        </blockquote>

        <div className="quote-nav" role="group" aria-label="Naviger sitater">
          <button
            type="button"
            className="quote-nav-btn"
            onClick={prev}
            aria-label="Forrige sitat"
          >
            ← Forrige
          </button>
          <span className="quote-counter" aria-live="polite">
            {currentIdx + 1} / {quotes.length}
          </span>
          <button
            type="button"
            className="quote-nav-btn"
            onClick={next}
            aria-label="Neste sitat"
          >
            Neste →
          </button>
        </div>
      </div>

      {/* All quotes list */}
      <section className="quotes-list mt-3" aria-label="Alle sitater i kategorien">
        <h3 className="field-label">Alle i kategorien:</h3>
        <ol className="quotes-ol">
          {quotes.map((q, i) => (
            <li
              key={i}
              className={`quotes-li${i === currentIdx ? ' current' : ''}`}
              aria-current={i === currentIdx ? 'true' : undefined}
            >
              <button
                type="button"
                className="quote-list-btn"
                onClick={() => setCurrentIdx(i)}
              >
                <span className="quote-list-text">"{q.content}"</span>
                <span className="quote-list-author">— {q.author}</span>
              </button>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
