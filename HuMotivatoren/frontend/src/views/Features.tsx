import { Link } from 'react-router-dom';
import '../bladerunner.css';

interface Feature {
  emoji: string;
  name: string;
  description: string;
  access?: string;
  color: 'cyan' | 'pink' | 'purple' | 'amber' | 'green';
}

const FEATURES: Feature[] = [
  {
    emoji: '🤖',
    name: 'Motivasjonsgenerator',
    description: 'Skriv inn en oppgave og få AI-generert motivasjon med sitat, fakta og inspirasjon.',
    access: 'Skriv inn en oppgave på forsiden og trykk "Start mission".',
    color: 'cyan',
  },
  {
    emoji: '🎭',
    name: 'Personlighetstyper',
    description: 'Velg mellom Useriøs, Seriøs, Sport og Nerd for å tilpasse tonen på motivasjonen.',
    access: 'Bruk personlighetsknappene rett under oppgavefeltet.',
    color: 'purple',
  },
  {
    emoji: '🐱',
    name: 'Katte-easter egg',
    description: 'Skriv noe med "katt" eller "cat" for å aktivere kattebilde og kattfakta i bakgrunnen.',
    access: 'Inkluder "katt" eller "cat" i oppgavefeltet.',
    color: 'pink',
  },
  {
    emoji: '🐕',
    name: 'Rottweiler-easter egg',
    description: 'Skriv "rottweiler" for å aktivere bilde og fakta om rottweiler.',
    access: 'Inkluder "rottweiler" i oppgavefeltet.',
    color: 'amber',
  },
  {
    emoji: '👄',
    name: 'Word of Your Mouth',
    description: 'Sanntids undertekster og stemme-til-tekst-visning — snakk, og se ordene dine materialisere seg.',
    access: 'Naviger til /word_of_your_mouth via navigasjonsmenyen.',
    color: 'pink',
  },
  {
    emoji: '🌪',
    name: 'Chaos Dashboard',
    description: 'Oversikt med vær, statistikk og kaotisk inspirasjon — alt du trenger og mer.',
    access: 'Trykk "Chaos Dashboard" i navigasjonsmenyen.',
    color: 'cyan',
  },
  {
    emoji: '📊',
    name: 'Utviklingshistorikk',
    description: 'Se en logg over alle endringer i appen med commit-detaljer og tidsstempler.',
    access: 'Trykk "Development History" i navigasjonsmenyen.',
    color: 'green',
  },
  {
    emoji: '📈',
    name: 'Irrelevant Stats',
    description: 'Viser absurde og irrelevante statistikker mens du skriver — for å underholde og distrahere.',
    access: 'Vises automatisk under oppgavefeltet på forsiden.',
    color: 'purple',
  },
  {
    emoji: '🐄',
    name: 'CowSay-boble',
    description: 'Klassisk ASCII-ku med visdommer og kommentarer tilpasset det du skriver.',
    access: 'Vises automatisk over knappene på forsiden mens du skriver.',
    color: 'amber',
  },
  {
    emoji: '🎬',
    name: 'Blade Runner UI',
    description: 'Distinkt mørk sci-fi-estetikk med scanlines, neon-farger og Orbitron-font.',
    access: 'Er alltid aktiv — du ser det nå.',
    color: 'cyan',
  },
  {
    emoji: '🌤',
    name: 'Værmelding',
    description: 'Backend-integrasjon som henter gjeldende vær basert på din lokasjon.',
    access: 'Aktiveres i Chaos Dashboard via "Hent vær"-knappen.',
    color: 'green',
  },
];

const COLOR_STYLES: Record<Feature['color'], { border: string; bg: string; text: string; dot: string }> = {
  cyan:   { border: 'var(--br-cyan)',   bg: 'rgba(0,217,255,0.07)',    text: 'var(--br-cyan)',   dot: 'var(--br-cyan)' },
  pink:   { border: 'var(--br-pink)',   bg: 'rgba(255,0,110,0.07)',    text: 'var(--br-pink)',   dot: 'var(--br-pink)' },
  purple: { border: 'var(--br-purple)', bg: 'rgba(181,55,242,0.07)',   text: 'var(--br-purple)', dot: 'var(--br-purple)' },
  amber:  { border: 'var(--br-amber)',  bg: 'rgba(255,214,10,0.06)',   text: 'var(--br-amber)',  dot: 'var(--br-amber)' },
  green:  { border: 'var(--br-green)',  bg: 'rgba(0,255,65,0.05)',     text: 'var(--br-green)',  dot: 'var(--br-green)' },
};

export default function Features() {
  return (
    <div className="bladerunner-page">
      <div className="bladerunner-scanline" />

      <header className="bladerunner-header" style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ color: 'var(--br-green)', textTransform: 'uppercase', letterSpacing: '0.18em', fontSize: '0.72rem', marginBottom: '0.75rem' }}>
          SYSTEM MANIFEST
        </div>
        <h1 className="bladerunner-title">Features</h1>
        <p className="bladerunner-subtitle">⚡ All Systems Operational ⚡</p>
        <nav className="bladerunner-nav">
          <Link to="/" className="bladerunner-back">← Hjem</Link>
          <Link to="/chaos" className="bladerunner-nav-link">🌪 Chaos Dashboard</Link>
          <Link to="/development_history" className="bladerunner-nav-link">📊 Development History</Link>
          <Link to="/word_of_your_mouth" className="bladerunner-nav-link">👄 Word of Your Mouth</Link>
        </nav>
      </header>

      <main
        className="bladerunner-container"
        style={{ maxWidth: 1100, margin: '0 auto' }}
        id="main-content"
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.25rem',
            paddingTop: '0.5rem',
          }}
        >
          {FEATURES.map((f) => {
            const s = COLOR_STYLES[f.color];
            return (
              <article
                key={f.name}
                style={{
                  border: `1px solid ${s.border}`,
                  background: s.bg,
                  boxShadow: `0 0 18px ${s.bg}, inset 0 0 12px ${s.bg}`,
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 0 32px ${s.border}55`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 0 18px ${s.bg}, inset 0 0 12px ${s.bg}`;
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '2rem', lineHeight: 1 }}>{f.emoji}</span>
                  <strong
                    style={{
                      fontFamily: '"Orbitron", sans-serif',
                      textTransform: 'uppercase',
                      letterSpacing: '0.07em',
                      color: s.text,
                      fontSize: '0.95rem',
                    }}
                  >
                    {f.name}
                  </strong>
                </div>

                <p style={{ margin: 0, lineHeight: 1.6, color: 'var(--br-text)', fontSize: '0.9rem' }}>
                  {f.description}
                </p>

                {f.access && (
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.78rem',
                      color: s.text,
                      opacity: 0.75,
                      fontStyle: 'italic',
                      borderTop: `1px solid ${s.border}44`,
                      paddingTop: '0.5rem',
                    }}
                  >
                    ▶ {f.access}
                  </p>
                )}
              </article>
            );
          })}
        </div>

        <footer style={{ marginTop: '2.5rem', textAlign: 'center', opacity: 0.45, fontSize: '0.75rem', letterSpacing: '0.1em', paddingBottom: '2rem' }}>
          {FEATURES.length} FEATURES ACTIVE — HUMOTIVATOREN v1.0
        </footer>
      </main>
    </div>
  );
}
