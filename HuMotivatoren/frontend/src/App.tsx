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
      padding: '2rem 1rem',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        {/* ── Header ── */}
        <header style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{
            fontSize: 'clamp(2.2rem, 6vw, 3.5rem)',
            color: 'white',
            margin: 0,
            textShadow: '2px 2px 8px rgba(0,0,0,0.25)',
          }}>
            HuMotivatoren 🚀
          </h1>
          <p style={{
            fontSize: 'clamp(1rem, 3vw, 1.4rem)',
            color: 'rgba(255,255,255,0.85)',
            margin: '0.5rem 0 0',
          }}>
            Få (u)relevant inspirasjon til det du skal gjøre
          </p>
        </header>

        {/* ── Two-column layout ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '2rem',
          alignItems: 'start',
        }}>

          {/* ══ LEFT: Motivasjon ══ */}
          <section style={{
            background: 'rgba(255,255,255,0.08)',
            borderRadius: '20px',
            padding: '2rem',
            border: '1px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(6px)',
          }}>
            <h2 style={{ color: 'white', margin: '0 0 0.4rem 0', fontSize: '1.6rem', textAlign: 'center' }}>
              💪 Motivér meg
            </h2>
            <p style={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: '0.9rem',
              textAlign: 'center',
              margin: '0 0 1.5rem 0',
              fontStyle: 'italic',
            }}>
              Fortell hva du skal gjøre og få (u)seriøs motivasjon
            </p>

            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="Hva skal du gjøre? (f.eks. 'lese nyheter')"
                disabled={loading}
                maxLength={280}
                style={{
                  width: '100%',
                  padding: '0.85rem 1.2rem',
                  fontSize: '1rem',
                  border: 'none',
                  borderRadius: '12px',
                  marginBottom: '1rem',
                  boxSizing: 'border-box',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.15)',
                  outline: 'none',
                }}
              />

              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '0.4rem',
                marginBottom: '1rem',
                flexWrap: 'wrap',
              }}>
                {PERSONALITIES.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPersonality(value)}
                    style={{
                      padding: '0.55rem 1rem',
                      fontSize: '0.9rem',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      background: personality === value ? 'white' : 'rgba(255,255,255,0.25)',
                      color: personality === value ? '#764ba2' : 'white',
                      fontWeight: personality === value ? 'bold' : 'normal',
                      transition: 'all 0.15s ease',
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
                  width: '100%',
                  padding: '0.9rem',
                  fontSize: '1.1rem',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: loading || !task.trim() ? 'not-allowed' : 'pointer',
                  background: loading || !task.trim() ? 'rgba(255,255,255,0.35)' : 'white',
                  color: '#764ba2',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.15)',
                }}
              >
                {loading ? '⏳ Tenker...' : 'Gi meg motivasjon! 💪'}
              </button>
            </form>

            {error && (
              <div style={{
                background: 'rgba(254,226,226,0.15)',
                color: '#fca5a5',
                padding: '0.85rem 1rem',
                borderRadius: '10px',
                marginTop: '1rem',
                fontSize: '0.9rem',
              }}>
                😅 {error}
              </div>
            )}

            {result && (
              <div style={{
                marginTop: '1.5rem',
                background: 'rgba(0,0,0,0.25)',
                borderRadius: '14px',
                padding: '1.5rem',
                border: '1px solid rgba(255,255,255,0.1)',
              }}>
                <div style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '1rem' }}>
                  {result.emoji}
                </div>
                <ResultBlock icon="💬" label="Sitat">
                  <p style={{ fontSize: '1.05rem', fontStyle: 'italic', margin: 0, color: 'rgba(255,255,255,0.9)' }}>
                    "{result.quote}"
                  </p>
                </ResultBlock>
                <ResultBlock icon="📚" label="Fakta">
                  <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem' }}>{result.fact}</p>
                </ResultBlock>
                <ResultBlock icon="💡" label="Tips">
                  <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem' }}>{result.tip}</p>
                </ResultBlock>
                {result.gifUrl && (
                  <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <img
                      src={result.gifUrl}
                      alt="Motiverende GIF"
                      style={{ maxWidth: '100%', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}
                    />
                  </div>
                )}
              </div>
            )}
          </section>

          {/* ══ RIGHT: Ask + Cowsay + Stats ══ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <AskPanel />
            <CowsayBubble inputText={task} />
            <IrrelevantStats inputText={task} />
          </div>

        </div>
      </div>
    </div>
  );
}

function ResultBlock({ icon, label, children }: { icon: string; label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <h3 style={{
        color: '#c4b5fd',
        margin: '0 0 0.3rem 0',
        fontSize: '0.8rem',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
      }}>
        {icon} {label}
      </h3>
      {children}
    </div>
  );
}

export default App;

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
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto', 
        textAlign: 'center' 
      }}>
        <header style={{ marginBottom: '2rem' }}>
          <h1 style={{ 
            fontSize: '3.5rem', 
            color: 'white', 
            margin: 0,
            textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
          }}>
            HuMotivatoren 🚀
          </h1>
          <p style={{ 
            fontSize: '1.5rem', 
            color: 'rgba(255,255,255,0.9)', 
            marginTop: '0.5rem' 
          }}>
            Få (u)relevant inspirasjon til det du skal gjøre
          </p>
        </header>

        <main>
          <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
            <input
              type="text"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="Hva skal du gjøre? (f.eks. 'lese nyheter')"
              disabled={loading}
              style={{
                width: '100%',
                padding: '1rem 1.5rem',
                fontSize: '1.2rem',
                border: 'none',
                borderRadius: '12px',
                marginBottom: '1rem',
                boxSizing: 'border-box',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
            />

            <CowsayBubble inputText={task} />
            <IrrelevantStats inputText={task} />
            
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
                    padding: '0.75rem 1.25rem',
                    fontSize: '1rem',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: personality === value 
                      ? 'white' 
                      : 'rgba(255,255,255,0.3)',
                    color: personality === value ? '#764ba2' : 'white',
                    fontWeight: personality === value ? 'bold' : 'normal',
                    transition: 'all 0.2s ease'
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
                padding: '1rem 2.5rem',
                fontSize: '1.3rem',
                border: 'none',
                borderRadius: '12px',
                cursor: loading || !task.trim() ? 'not-allowed' : 'pointer',
                background: loading || !task.trim() 
                  ? 'rgba(255,255,255,0.5)' 
                  : 'white',
                color: '#764ba2',
                fontWeight: 'bold',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s ease'
              }}
            >
              {loading ? '⏳ Tenker...' : 'Gi meg motivasjon! 💪'}
            </button>
          </form>

          {error && (
            <div style={{
              background: '#fee2e2',
              color: '#dc2626',
              padding: '1rem',
              borderRadius: '12px',
              marginBottom: '1rem'
            }}>
              <p style={{ margin: 0 }}>😅 {error}</p>
            </div>
          )}

          {result && (
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '2rem',
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
              textAlign: 'left'
            }}>
              <div style={{ 
                fontSize: '4rem', 
                textAlign: 'center', 
                marginBottom: '1rem' 
              }}>
                {result.emoji}
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ 
                  color: '#764ba2', 
                  marginBottom: '0.5rem',
                  fontSize: '1.2rem'
                }}>
                  💬 Sitat
                </h2>
                <p style={{ 
                  fontSize: '1.3rem', 
                  fontStyle: 'italic',
                  margin: 0,
                  color: '#374151'
                }}>
                  "{result.quote}"
                </p>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ 
                  color: '#764ba2', 
                  marginBottom: '0.5rem',
                  fontSize: '1.2rem'
                }}>
                  📚 Fakta
                </h2>
                <p style={{ margin: 0, color: '#374151' }}>{result.fact}</p>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ 
                  color: '#764ba2', 
                  marginBottom: '0.5rem',
                  fontSize: '1.2rem'
                }}>
                  💡 Tips
                </h2>
                <p style={{ margin: 0, color: '#374151' }}>{result.tip}</p>
              </div>

              {result.gifUrl && (
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <img 
                    src={result.gifUrl} 
                    alt="Motiverende GIF" 
                    style={{ 
                      maxWidth: '100%', 
                      borderRadius: '12px',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
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
