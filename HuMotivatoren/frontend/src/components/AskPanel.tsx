import { useState } from 'react';
import type { AskResponse } from '../types';

const QUICK_QUESTIONS = [
  'Hvordan holder jeg motivasjonen oppe?',
  'Hva gjør jeg når jeg er lei?',
  'Hva er hemmeligheten bak produktivitet?',
  'Hvordan starter jeg på en vanskelig oppgave?',
  'Hva gjør jeg når alt føles håpløst?',
];

export function AskPanel() {
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState<AskResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <section
      aria-label="Spør motivasjonscoachen"
      style={{
        background: 'rgba(255,255,255,0.09)',
        borderRadius: '16px',
        padding: 'clamp(1.5rem, 5vw, 2rem)',
        border: '1px solid rgba(255,255,255,0.15)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <h2 style={{ color: 'white', margin: '0 0 0.3rem 0', fontSize: '1.4rem' }}>
        🎯 Spør motivasjonscoachen
      </h2>
      <p style={{
        color: 'rgba(255,255,255,0.7)',
        fontSize: '0.9rem',
        margin: '0 0 1.2rem 0',
      }}>
        Få personlig motivasjonsråd — drevet av AI
      </p>

      {/* Quick-pick suggestions */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {QUICK_QUESTIONS.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => setQuestion(q)}
            aria-label={`Bruk spørsmålet: ${q}`}
            style={{
              fontSize: '0.78rem',
              padding: '0.35rem 0.75rem',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '20px',
              background: 'rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.85)',
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
          >
            {q}
          </button>
        ))}
      </div>

      <form onSubmit={handleAsk}>
        <label
          htmlFor="coach-question"
          style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: 'rgba(255,255,255,0.9)', marginBottom: '0.5rem' }}
        >
          Hva lurer du på?
        </label>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <input
            id="coach-question"
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="F.eks. 'Hvordan holder jeg motivasjonen oppe?'"
            disabled={loading}
            maxLength={280}
            style={{
              flex: '1 1 240px',
              padding: '0.85rem 1rem',
              fontSize: '1rem',
              border: '2px solid rgba(255,255,255,0.2)',
              borderRadius: '10px',
              background: 'rgba(255,255,255,0.95)',
              outline: 'none',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'white'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            aria-busy={loading}
            style={{
              padding: '0.85rem 1.4rem',
              fontSize: '1rem',
              border: 'none',
              borderRadius: '10px',
              cursor: loading || !question.trim() ? 'not-allowed' : 'pointer',
              background: loading || !question.trim() ? 'rgba(255,255,255,0.4)' : 'white',
              color: '#764ba2',
              fontWeight: 'bold',
              opacity: loading || !question.trim() ? 0.6 : 1,
              whiteSpace: 'nowrap',
            }}
          >
            {loading ? '⏳ Tenker...' : 'Spør 🎯'}
          </button>
        </div>
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

          {/* Answer */}
          <p style={{
            color: 'white',
            fontSize: '1.1rem',
            margin: '0 0 1rem 0',
            lineHeight: 1.6,
            fontWeight: 500,
          }}>
            {result.emoji} {result.answer}
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
          }}>
            <span style={{ color: '#fcd34d', fontWeight: 'bold', fontSize: '0.8rem', marginRight: '0.4rem' }}>
              🎲 VISSTE DU AT:
            </span>
            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
              {result.irrelevantFact}
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
