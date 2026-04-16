import { useEffect, useState, useRef } from 'react';

interface CowsayBubbleProps {
  inputText: string;
}

let _audioCtx: AudioContext | null = null;
function getAudioContext(): AudioContext {
  if (!_audioCtx || _audioCtx.state === 'closed') {
    _audioCtx = new AudioContext();
  }
  return _audioCtx;
}

function playMoo() {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') { ctx.resume(); }
    const now = ctx.currentTime;

    // --- Hoveddel: to oscillatorer blandet (sawtooth + square) for ku-klang ---
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const oscGain1 = ctx.createGain();
    const oscGain2 = ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'square';

    // Frekvenskurve: starter lavt, stiger raskt, holder, synker ned igjen
    [osc1, osc2].forEach((osc) => {
      osc.frequency.setValueAtTime(130, now);
      osc.frequency.linearRampToValueAtTime(190, now + 0.12);
      osc.frequency.linearRampToValueAtTime(210, now + 0.35);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.85);
      osc.frequency.exponentialRampToValueAtTime(110, now + 1.3);
    });

    oscGain1.gain.value = 0.35;
    oscGain2.gain.value = 0.12;

    // --- Pustete lyd (hvit støy filtrert) ---
    const bufferSize = ctx.sampleRate * 1.4;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 180;
    noiseFilter.Q.value = 1.5;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.04;

    // --- Resonansfilter som former lyd til ku-klang ---
    const formantFilter = ctx.createBiquadFilter();
    formantFilter.type = 'peaking';
    formantFilter.frequency.value = 350;
    formantFilter.Q.value = 3;
    formantFilter.gain.value = 10;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(900, now);
    lowpass.frequency.linearRampToValueAtTime(400, now + 0.5);
    lowpass.frequency.linearRampToValueAtTime(250, now + 1.3);
    lowpass.Q.value = 2;

    // --- Hoved-konvolutt (amplitude) ---
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, now);
    masterGain.gain.linearRampToValueAtTime(0.7, now + 0.08);
    masterGain.gain.setValueAtTime(0.7, now + 0.9);
    masterGain.gain.linearRampToValueAtTime(0, now + 1.4);

    // --- Koble alt sammen ---
    osc1.connect(oscGain1);
    osc2.connect(oscGain2);
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);

    [oscGain1, oscGain2, noiseGain].forEach((g) => g.connect(formantFilter));
    formantFilter.connect(lowpass);
    lowpass.connect(masterGain);
    masterGain.connect(ctx.destination);

    osc1.start(now); osc1.stop(now + 1.45);
    osc2.start(now); osc2.stop(now + 1.45);
    noise.start(now); noise.stop(now + 1.45);

  } catch (e) {
    console.warn('CowsayBubble: Web Audio API unavailable', e);
  }
}

export function CowsayBubble({ inputText }: CowsayBubbleProps) {
  const [art, setArt] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const prevArtRef = useRef<string | null>(null);

  useEffect(() => {
    if (!inputText.trim()) {
      setArt(null);
      prevArtRef.current = null;
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      if (inputText.trim().length > 280) return;

      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      try {
        const res = await fetch('/api/cowsay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: inputText }),
          signal: abortRef.current.signal,
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
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') return;
        console.warn('CowsayBubble: fetch failed', e);
      }
    }, 600);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      abortRef.current?.abort();
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
