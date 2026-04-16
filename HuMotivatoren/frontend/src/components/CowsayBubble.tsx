import { useEffect, useState, useRef } from 'react';

interface CowsayBubbleProps {
  inputText: string;
}

export function CowsayBubble({ inputText }: CowsayBubbleProps) {
  const [art, setArt] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!inputText.trim()) {
      setArt(null);
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
