import { useState } from 'react';
import type { AskResponse } from '../types';

const JOKE_PREFIXES = [
  '🎱 Magisk ku sier:',
  '📡 Kosmisk mottak:',
  '🔮 Spåkua avslører:',
  '🧠 Ekspertanalyse™:',
  '📜 Gammel ku-visdom:',
];

const CONFIDENCE_LEVELS = [
  '99.7% sikker (± en ku)',
  '110% sikker, vi rundet opp',
  'Svært sikker, nesten litt for sikker',
  'Bekreftet av tre kuer og en geit',
  'Vitenskapelig bevist*  (*av oss)',
];

export function AskPanel() {
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState<AskResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prefixIdx] = useState(() => Math.floor(Math.random() * JOKE_PREFIXES.length));
  const [confIdx] = useState(() => Math.floor(Math.random() * CONFIDENCE_LEVELS.length));

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim() }),
      });
      if (!res.ok) throw new Error(`Serveren svarte med ${res.status}`);
      const data: AskResponse = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Noe gikk galt!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={{
      background: 'rgba(255,255,255,0.08)',
      borderRadius: '20px',
      padding: '2rem',
      border: '1px solid rgba(255,255,255,0.2)',
      backdropFilter: 'blur(6px)',
    }}>
      <h2 style={{
        color: 'white',
        margin: '0 0 0.4rem 0',
        fontSize: '1.6rem',
        textAlign: 'center',
      }}>
        🤔 Spør Kua
      </h2>
      <p style={{
        color: 'rgba(255,255,255,0.6)',
        fontSize: '0.9rem',
        textAlign: 'center',
        margin: '0 0 1.5rem 0',
        fontStyle: 'italic',
      }}>
        Still et spørsmål. Få et (u)seriøst motiverende svar.
      </p>

      <form onSubmit={handleAsk} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Hva lurer du på? (f.eks. 'Hva er meningen med livet?')"
          disabled={loading}
          maxLength={280}
          style={{
            flex: '1 1 280px',
            padding: '0.85rem 1.2rem',
            fontSize: '1rem',
            border: 'none',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.15)',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          style={{
            padding: '0.85rem 1.8rem',
            fontSize: '1rem',
            border: 'none',
            borderRadius: '12px',
            cursor: loading || !question.trim() ? 'not-allowed' : 'pointer',
            background: loading || !question.trim()
              ? 'rgba(255,255,255,0.35)'
              : 'white',
            color: '#764ba2',
            fontWeight: 'bold',
            boxShadow: '0 4px 6px rgba(0,0,0,0.15)',
            whiteSpace: 'nowrap',
          }}
        >
          {loading ? '⏳ Spør...' : 'Spør! 🐄'}
        </button>
      </form>

      {error && (
        <p style={{
          color: '#fca5a5',
          marginTop: '1rem',
          textAlign: 'center',
          fontSize: '0.9rem',
        }}>
          😅 {error}
        </p>
      )}

      {result && (
        <div style={{
          marginTop: '1.5rem',
          background: 'rgba(0,0,0,0.35)',
          borderRadius: '16px',
          padding: '1.5rem',
          border: '1px solid rgba(255,255,255,0.12)',
          textAlign: 'left',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Decorative emoji watermark */}
          <div style={{
            position: 'absolute',
            top: '-10px',
            right: '10px',
            fontSize: '6rem',
            opacity: 0.06,
            userSelect: 'none',
            pointerEvents: 'none',
          }}>
            {result.emoji}
          </div>

          {/* Joke label */}
          <div style={{
            display: 'inline-block',
            background: 'rgba(167,139,250,0.25)',
            color: '#c4b5fd',
            fontSize: '0.72rem',
            fontWeight: 'bold',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            padding: '0.25rem 0.6rem',
            borderRadius: '6px',
            marginBottom: '0.85rem',
          }}>
            {JOKE_PREFIXES[prefixIdx]}
          </div>

          {/* Main answer */}
          <p style={{
            color: 'white',
            fontSize: '1.15rem',
            margin: '0 0 1rem 0',
            lineHeight: 1.6,
            fontWeight: 500,
          }}>
            {result.answer}
          </p>

          {/* Encouragement pill */}
          <div style={{
            background: 'rgba(52,211,153,0.15)',
            border: '1px solid rgba(52,211,153,0.3)',
            borderRadius: '10px',
            padding: '0.7rem 1rem',
            marginBottom: '0.85rem',
          }}>
            <span style={{ color: '#6ee7b7', fontWeight: 'bold', fontSize: '0.8rem', marginRight: '0.4rem' }}>
              💚 OPPMUNTRING:
            </span>
            <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem' }}>
              {result.encouragement}
            </span>
          </div>

          {/* Irrelevant fact */}
          <div style={{
            background: 'rgba(251,191,36,0.1)',
            border: '1px solid rgba(251,191,36,0.2)',
            borderRadius: '10px',
            padding: '0.7rem 1rem',
            marginBottom: '0.85rem',
          }}>
            <span style={{ color: '#fcd34d', fontWeight: 'bold', fontSize: '0.8rem', marginRight: '0.4rem' }}>
              🎲 IRRELEVANT FAKTA:
            </span>
            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
              {result.irrelevantFact}
            </span>
          </div>

          {/* Confidence badge */}
          <p style={{
            color: 'rgba(255,255,255,0.3)',
            fontSize: '0.65rem',
            textAlign: 'right',
            margin: 0,
            fontStyle: 'italic',
          }}>
            {CONFIDENCE_LEVELS[confIdx]}
          </p>
        </div>
      )}
    </section>
  );
}
