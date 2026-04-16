import { Link } from 'react-router-dom';
import SnakeAmbient, { SNAKE_GRID_HEIGHT, SNAKE_GRID_WIDTH } from '../components/SnakeAmbient';

export default function SnakeFeature() {
  return (
    <div className="bladerunner-page snake-page">
      <div className="bladerunner-scanline" />
      <div className="snake-stage" aria-hidden="true" />

      <header className="bladerunner-header" style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div className="home-kicker">ARCADE MODULE</div>
        <h1 className="bladerunner-title">Snake Ambient</h1>
        <p className="bladerunner-subtitle">⚡ Keyboard-Controlled Neon Snake ⚡</p>

        <nav className="bladerunner-nav">
          <Link to="/" className="bladerunner-back">← Hjem</Link>
          <Link to="/features" className="bladerunner-nav-link">✨ Features</Link>
          <Link to="/chaos" className="bladerunner-nav-link">🌪 Chaos Dashboard</Link>
          <Link to="/development_history" className="bladerunner-nav-link">📊 Development History</Link>
        </nav>
      </header>

      <main className="bladerunner-container snake-layout" style={{ maxWidth: 1100, margin: '0 auto' }} id="main-content">
        <section className="snake-panel snake-intro-panel" aria-labelledby="snake-feature-heading">
          <div className="home-section-label">Operator Brief</div>
          <h2 id="snake-feature-heading">Play Snake</h2>
          <p>
            This mode is fully keyboard-first. Keep the snake alive, collect food, and avoid walls and your own tail.
          </p>

          <div id="snake-keyboard-help" className="snake-controls" aria-label="Keyboard instructions">
            <div><strong>Arrow keys</strong> to steer the snake.</div>
            <div><strong>R, Enter or Space</strong> to restart after game over.</div>
            <div><strong>Restart button</strong> is also available next to the board heading.</div>
          </div>

          <div className="snake-score-card">
            <span>Board size</span>
            <strong>{SNAKE_GRID_WIDTH}x{SNAKE_GRID_HEIGHT}</strong>
          </div>
        </section>

        <section className="snake-panel" aria-describedby="snake-keyboard-help snake-game-status">
          <SnakeAmbient />
        </section>
      </main>
    </div>
  );
}
