import { useEffect, useState, useRef } from 'react';

interface CowsayBubbleProps {
  inputText: string;
}

function playMoo() {
  try {
    const ctx = new AudioContext();

    const playTone = (
      startTime: number,
      duration: number,
      startFreq: number,
      endFreq: number,
      gainPeak: number,
    ) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(startFreq, startTime);
      osc.frequency.exponentialRampToValueAtTime(endFreq, startTime + duration);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, startTime);
      filter.frequency.linearRampToValueAtTime(300, startTime + duration);
      filter.Q.value = 8;

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(gainPeak, startTime + 0.05);
      gain.gain.setValueAtTime(gainPeak, startTime + duration - 0.1);
      gain.gain.linearRampToValueAtTime(0, startTime + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    // "M" — kort attack
    playTone(now, 0.18, 180, 220, 0.22);
    // "OOO" — lang glid ned (hoveddelen av MOO)
    playTone(now + 0.15, 0.7, 220, 130, 0.28);

    // Litt vibrato-effekt via en LFO på gain
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 5.5;
    lfoGain.gain.value = 0.04;
    lfo.connect(lfoGain);
    lfo.start(now + 0.15);
    lfo.stop(now + 0.85);

    setTimeout(() => ctx.close(), 1200);
  } catch {
    // Nettleser støtter ikke Web Audio API
  }
}

export function CowsayBubble({ inputText }: CowsayBubbleProps) {
  const [art, setArt] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevArtRef = useRef<string | null>(null);

  useEffect(() => {
    if (!inputText.trim()) {
      setArt(null);
      prevArtRef.current = null;
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch('/api/cowsay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: inputText }),
        });
        if (res.ok) {
          const data = await res.json();
          // Spill moo kun når kua dukker opp for første gang eller teksten endrer seg
          if (data.art !== prevArtRef.current) {
            playMoo();
            prevArtRef.current = data.art;
          }
          setArt(data.art);
        }
      } catch {
        // Ignorer feil stille
      }
    }, 600);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [inputText]);

  if (!art) return null;

  return (
    <div
      style={{
        margin: '1.5rem 0',
        background: 'rgba(0,0,0,0.75)',
        borderRadius: '12px',
        padding: '1.25rem 1.5rem',
        textAlign: 'left',
        boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
        border: '2px solid rgba(255,255,255,0.15)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{
        position: 'absolute',
        top: '8px',
        right: '12px',
        fontSize: '0.7rem',
        color: 'rgba(255,255,255,0.4)',
        fontFamily: 'monospace',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
      }}>
        🐄 KU-KOMMENTATOR
      </div>
      <pre
        style={{
          color: '#a3e635',
          fontFamily: '"Courier New", Courier, monospace',
          fontSize: '0.85rem',
          lineHeight: '1.4',
          margin: 0,
          whiteSpace: 'pre',
          overflowX: 'auto',
        }}
      >
        {art}
      </pre>
    </div>
  );
}
