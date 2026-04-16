import { useState } from 'react';
import type { MotivationRequest, MotivationResponse } from './types';
import { CowsayBubble } from './components/CowsayBubble';
import { IrrelevantStats } from './components/IrrelevantStats';
import { AskPanel } from './components/AskPanel';

type PersonalityOption = NonNullable<MotivationRequest['personality']>;

const PERSONALITIES: { value: PersonalityOption; label: string }[] = [
  { value: 'silly', label: '😜 Useriøs' },
  { value: 'serious', label: '🧐 Seriøs' },
  { value: 'sports', label: '⚽ Sport' },
  { value: 'nerdy', label: '🤓 Nerd' },
];

function App() {
  const [task, setTask] = useState('');
  const [personality, setPersonality] = useState<PersonalityOption>('silly');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MotivationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'motivate' | 'ask'>('motivate');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const request: MotivationRequest = { task: task.trim(), personality };
      const response = await fetch('/api/motivate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      if (!response.ok) throw new Error(`Server svarte med ${response.status}`);
      const data: MotivationResponse = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Noe gikk galt!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '1.5rem',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#1f2937',
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

        {/* ── HEADER ── */}
        <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h1 style={{
            fontSize: 'clamp(1.8rem, 5vw, 3rem)',
            color: 'white',
            margin: '0 0 0.5rem 0',
            textShadow: '2px 2px 8px rgba(0,0,0,0.25)',
          }}>
            HuMotivatoren 🚀
          </h1>
          <p style={{
            fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)',
            color: 'rgba(255,255,255,0.9)',
            margin: 0,
            lineHeight: 1.4,
          }}>
            Få (u)relevant inspirasjon når du trenger det
          </p>
        </header>

        {/* ── TAB SWITCHER (Accessible) ── */}
        <nav style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1.5rem',
          background: 'rgba(255,255,255,0.1)',
          padding: '0.4rem',
          borderRadius: '12px',
          backdropFilter: 'blur(4px)',
        }} role="tablist">
          {(['motivate', 'ask'] as const).map((tab) => (
            <button
              key={tab}
              role="tab"
              aria-selected={activeTab === tab}
              aria-controls={`${tab}-panel`}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: '0.7rem 1rem',
                fontSize: '1rem',
                fontWeight: activeTab === tab ? 'bold' : 'normal',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                background: activeTab === tab ? 'white' : 'transparent',
                color: activeTab === tab ? '#764ba2' : 'rgba(255,255,255,0.8)',
                transition: 'all 0.2s ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.outline = '3px solid rgba(255,255,255,0.5)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.outline = 'none';
              }}
            >
              {tab === 'motivate' ? '💪 Motivér meg' : '🎯 Spør coachen'}
            </button>
          ))}
        </nav>

        {/* ── MOTIVATE TAB ── */}
        {activeTab === 'motivate' && (
          <section
            id="motivate-panel"
            role="tabpanel"
            aria-labelledby="motivate-tab"
            style={{
              background: 'rgba(255,255,255,0.09)',
              borderRadius: '16px',
              padding: 'clamp(1.5rem, 5vw, 2rem)',
              border: '1px solid rgba(255,255,255,0.15)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <form onSubmit={handleSubmit}>
              {/* Task input */}
              <div style={{ marginBottom: '1.2rem' }}>
                <label
                  htmlFor="task-input"
                  style={{
                    display: 'block',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    color: 'rgba(255,255,255,0.9)',
                    marginBottom: '0.5rem',
                  }}
                >
                  Hva skal du gjøre?
                </label>
                <input
                  id="task-input"
                  type="text"
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  placeholder="F.eks. 'lese nyheter' eller 'trene'"
                  disabled={loading}
                  maxLength={280}
                  aria-label="Oppgave du skal gjøre"
                  style={{
                    width: '100%',
                    padding: '0.9rem 1rem',
                    fontSize: '1rem',
                    border: '2px solid rgba(255,255,255,0.2)',
                    borderRadius: '10px',
                    boxSizing: 'border-box',
                    background: 'rgba(255,255,255,0.95)',
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'white';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                  }}
                />
              </div>

              {/* Personality selector */}
              <fieldset style={{
                border: 'none',
                padding: 0,
                margin: '0 0 1.2rem 0',
              }}>
                <legend style={{
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  color: 'rgba(255,255,255,0.9)',
                  marginBottom: '0.6rem',
                  display: 'block',
                }}>
                  Velg tone:
                </legend>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                  gap: '0.5rem',
                }}>
                  {PERSONALITIES.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setPersonality(value)}
                      aria-pressed={personality === value}
                      style={{
                        padding: '0.7rem 1rem',
                        fontSize: '0.95rem',
                        border: personality === value ? '3px solid white' : '2px solid rgba(255,255,255,0.3)',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        background: personality === value ? 'white' : 'rgba(255,255,255,0.12)',
                        color: personality === value ? '#764ba2' : 'rgba(255,255,255,0.9)',
                        fontWeight: personality === value ? 'bold' : '600',
                        transition: 'all 0.15s ease',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.outline = '3px solid rgba(255,255,255,0.5)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.outline = 'none';
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </fieldset>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading || !task.trim()}
                aria-busy={loading}
                style={{
                  width: '100%',
                  padding: '0.95rem 1.5rem',
                  fontSize: 'clamp(1rem, 2vw, 1.1rem)',
                  fontWeight: 'bold',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: loading || !task.trim() ? 'not-allowed' : 'pointer',
                  background: loading || !task.trim() ? 'rgba(255,255,255,0.4)' : 'white',
                  color: '#764ba2',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  transition: 'all 0.2s ease',
                  opacity: loading || !task.trim() ? 0.6 : 1,
                }}
                onFocus={(e) => {
                  if (!loading && task.trim()) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
                  }
                }}
                onBlur={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }}
              >
                {loading ? '⏳ Tenker...' : 'Gi meg motivasjon! 💪'}
              </button>
            </form>

            {/* Error message with ARIA live region */}
            {error && (
              <div
                role="alert"
                style={{
                  marginTop: '1rem',
                  background: 'rgba(254,226,226,0.2)',
                  border: '2px solid rgba(252,165,165,0.4)',
                  color: '#fecaca',
                  padding: '1rem',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                }}
              >
                <strong>❌ Feil:</strong> {error}
              </div>
            )}

            {/* Result cards */}
            {result && (
              <div
                role="region"
                aria-label="Motivasjonssvar"
                style={{
                  marginTop: '1.5rem',
                  background: 'rgba(0,0,0,0.25)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <div style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '1rem' }}>
                  {result.emoji}
                </div>
                <ResultBlock icon="💬" label="Sitat">
                  <p style={{ fontSize: '1rem', fontStyle: 'italic', margin: 0, color: 'rgba(255,255,255,0.95)' }}>
                    "{result.quote}"
                  </p>
                </ResultBlock>
                <ResultBlock icon="📚" label="Fakta">
                  <p style={{ margin: 0, color: 'rgba(255,255,255,0.85)', fontSize: '0.95rem' }}>{result.fact}</p>
                </ResultBlock>
                <ResultBlock icon="💡" label="Tips">
                  <p style={{ margin: 0, color: 'rgba(255,255,255,0.85)', fontSize: '0.95rem' }}>{result.tip}</p>
                </ResultBlock>
                {result.gifUrl && (
                  <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <img
                      src={result.gifUrl}
                      alt="Illustrasjon for motivasjon"
                      style={{ maxWidth: '100%', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Bonus: Cowsay + Stats under results */}
            {task && (
              <div style={{ marginTop: '1.5rem' }}>
                <CowsayBubble inputText={task} />
                <div style={{ marginTop: '1rem' }}>
                  <IrrelevantStats inputText={task} />
                </div>
              </div>
            )}
          </section>
        )}

        {/* ── ASK TAB ── */}
        {activeTab === 'ask' && (
          <section
            id="ask-panel"
            role="tabpanel"
            aria-labelledby="ask-tab"
          >
            <AskPanel />
          </section>
        )}

      </div>
    </div>
  );
}

function ResultBlock({ icon, label, children }: { icon: string; label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '1.2rem' }}>
      <h3 style={{
        color: '#c4b5fd',
        margin: '0 0 0.4rem 0',
        fontSize: '0.85rem',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }}>
        {icon} {label}
      </h3>
      <div style={{ color: 'rgba(255,255,255,0.9)' }}>
        {children}
      </div>
    </div>
  );
}

export default App;
