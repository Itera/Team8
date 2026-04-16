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
    <div className="cowsay-wrap">
      <pre className="cowsay-pre">{art}</pre>
    </div>
  );
}
