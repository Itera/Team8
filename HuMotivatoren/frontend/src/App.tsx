import { useState } from 'react';
import type { MotivationRequest, MotivationResponse } from './types';
import { CowsayBubble } from './components/CowsayBubble';
import { IrrelevantStats } from './components/IrrelevantStats';

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
