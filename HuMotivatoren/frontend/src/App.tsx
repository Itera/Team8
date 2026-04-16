import { type FormEvent, useEffect, useReducer, useRef, useState } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import { CowsayBubble } from './components/CowsayBubble';
import { IrrelevantStats } from './components/IrrelevantStats';
import ChangeDetail from './views/ChangeDetail';
import ChaosDashboard from './views/ChaosDashboard';
import DevelopmentHistory from './views/DevelopmentHistory';
import Features from './views/Features';
import WordOfYourMouth from './views/WordOfYourMouth';
import type { MotivationRequest, MotivationResponse } from './types';
import './bladerunner.css';

type Direction = 'up' | 'down' | 'left' | 'right';

type Point = {
  x: number;
  y: number;
};

type GameStatus = 'playing' | 'gameover';

type GameState = {
  snake: Point[];
  direction: Direction;
  food: Point;
  score: number;
  lastScore: number;
  status: GameStatus;
};

type GameAction =
  | { type: 'turn'; direction: Direction }
  | { type: 'tick' }
  | { type: 'reset' };

type PersonalityOption = NonNullable<MotivationRequest['personality']>;

const GRID_WIDTH = 18;
const GRID_HEIGHT = 14;
const TICK_MS = 150;

const INITIAL_SNAKE: Point[] = [
  { x: 8, y: 7 },
  { x: 7, y: 7 },
  { x: 6, y: 7 },
];

const PERSONALITIES: { value: PersonalityOption; label: string; hint: string }[] = [
  { value: 'silly', label: 'Useriøs', hint: 'Litt kaos, mye sjarm' },
  { value: 'serious', label: 'Seriøs', hint: 'Fokus og struktur' },
  { value: 'sports', label: 'Sport', hint: 'Full energi' },
  { value: 'nerdy', label: 'Nerd', hint: 'Presisjon og fakta' },
];

function samePoint(left: Point, right: Point) {
  return left.x === right.x && left.y === right.y;
}

function movePoint(point: Point, direction: Direction): Point {
  switch (direction) {
    case 'up':
      return { x: point.x, y: point.y - 1 };
    case 'down':
      return { x: point.x, y: point.y + 1 };
    case 'left':
      return { x: point.x - 1, y: point.y };
    case 'right':
      return { x: point.x + 1, y: point.y };
  }
}

function isOpposite(next: Direction, current: Direction) {
  return (
    (next === 'up' && current === 'down') ||
    (next === 'down' && current === 'up') ||
    (next === 'left' && current === 'right') ||
    (next === 'right' && current === 'left')
  );
}

function randomFood(snake: Point[]): Point {
  let food: Point;

  do {
    food = {
      x: Math.floor(Math.random() * GRID_WIDTH),
      y: Math.floor(Math.random() * GRID_HEIGHT),
    };
  } while (snake.some((segment) => samePoint(segment, food)));

  return food;
}

function createGameState(): GameState {
  return {
    snake: INITIAL_SNAKE,
    direction: 'right',
    food: randomFood(INITIAL_SNAKE),
    score: 0,
    lastScore: 0,
    status: 'playing',
  };
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return target.matches('input, textarea, select, button, [contenteditable="true"]');
}

function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'turn':
      if (state.status !== 'playing' || isOpposite(action.direction, state.direction)) {
        return state;
      }

      return {
        ...state,
        direction: action.direction,
      };
    case 'tick': {
      if (state.status !== 'playing') {
        return state;
      }

      const nextHead = movePoint(state.snake[0], state.direction);
      const hitsWall =
        nextHead.x < 0 ||
        nextHead.x >= GRID_WIDTH ||
        nextHead.y < 0 ||
        nextHead.y >= GRID_HEIGHT;
      const hitsSelf = state.snake.some((segment, index) => index > 0 && samePoint(segment, nextHead));

      if (hitsWall || hitsSelf) {
        const freshStart = createGameState();

        return {
          ...freshStart,
          status: 'gameover',
          lastScore: state.score,
        };
      }

      const ateFood = samePoint(nextHead, state.food);
      const nextSnake = [nextHead, ...(ateFood ? state.snake : state.snake.slice(0, -1))];

      return {
        ...state,
        snake: nextSnake,
        score: ateFood ? state.score + 1 : state.score,
        food: ateFood ? randomFood(nextSnake) : state.food,
      };
    }
    case 'reset':
      return createGameState();
    default:
      return state;
  }
}

function App() {
  const [task, setTask] = useState('');
  const [latestTask, setLatestTask] = useState(() => localStorage.getItem('humotivatoren.latestTask') ?? '');
  const [personality, setPersonality] = useState<PersonalityOption>('silly');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MotivationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [catImageUrl, setCatImageUrl] = useState<string | null>(null);
  const [catFact, setCatFact] = useState<string | null>(null);
  const [catBreed, setCatBreed] = useState<{ name: string; temperament: string; description: string } | null>(null);
  const [rottweilerImageUrl, setRottweilerImageUrl] = useState<string | null>(null);
  const [rottweilerFact, setRottweilerFact] = useState<string | null>(null);
  const lastFetchedFor = useRef<string | null>(null);
  const lastFetchedRottweilerFor = useRef<string | null>(null);

  useEffect(() => {
    localStorage.setItem('humotivatoren.latestTask', latestTask);
  }, [latestTask]);

  useEffect(() => {
    const hasCat = /\b(cat|cats|kitten|kittens|kitty|kitties|katt|katten|katter|kattene|kattunge|kattungen|kattunger|kattungene|gato|gatos|gatito|gatitos|chat|chats|chaton|chatons|katze|katzen|kätzchen|gatto|gatti|gattino|kat|katte|killing|killingen|poes|poesje|kot|koty|kotek|kissa|kissoja|猫|貓|ねこ|قطة)\b/i.test(task);

    if (hasCat && lastFetchedFor.current !== task) {
      lastFetchedFor.current = task;

      fetch('https://api.thecatapi.com/v1/images/search?has_breeds=1')
        .then((response) => response.json())
        .then((data: { url: string; breeds?: { name: string; temperament: string; description: string }[] }[]) => {
          if (data?.[0]?.url) {
            setCatImageUrl(data[0].url);
          }

          const breed = data?.[0]?.breeds?.[0];
          if (breed) {
            setCatBreed({ name: breed.name, temperament: breed.temperament, description: breed.description });
          }
        })
        .catch(() => {});

      fetch('https://catfact.ninja/fact')
        .then((response) => response.json())
        .then((data: { fact: string }) => {
          if (data?.fact) {
            setCatFact(data.fact);
          }
        })
        .catch(() => {});
    } else if (!hasCat) {
      setCatImageUrl(null);
      setCatFact(null);
      setCatBreed(null);
      lastFetchedFor.current = null;
    }
  }, [task]);

  useEffect(() => {
    const hasRottweiler = /\b(rottweiler|rottweilers|rotty|rottie|rotties|rottvakt|rottvakter)\b/i.test(task);

    if (hasRottweiler && lastFetchedRottweilerFor.current !== task) {
      lastFetchedRottweilerFor.current = task;

      fetch('https://dog.ceo/api/breed/rottweiler/images/random')
        .then((response) => response.json())
        .then((data: { message: string; status: string }) => {
          if (data?.message) {
            setRottweilerImageUrl(data.message);
          }
        })
        .catch(() => {});

      fetch('https://dogapi.dog/api/v2/facts?limit=1')
        .then((response) => response.json())
        .then((data: { data: { id: string; type: string; attributes: { body: string } }[] }) => {
          if (data?.data?.[0]?.attributes?.body) {
            setRottweilerFact(data.data[0].attributes.body);
          }
        })
        .catch(() => {});
    } else if (!hasRottweiler) {
      setRottweilerImageUrl(null);
      setRottweilerFact(null);
      lastFetchedRottweilerFor.current = null;
    }
  }, [task]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!task.trim()) {
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const request: MotivationRequest = { task: task.trim(), personality };
      setLatestTask(task.trim());

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
    <Routes>
      <Route path="/development_history/:hash" element={<ChangeDetail />} />
      <Route path="/development_history" element={<DevelopmentHistory />} />
      <Route path="/word_of_your_mouth" element={<WordOfYourMouth />} />
      <Route path="/features" element={<Features />} />
      <Route path="/chaos" element={<ChaosDashboard latestTask={latestTask} />} />
      <Route
        path="*"
        element={
          <Home
            task={task}
            setTask={setTask}
            personality={personality}
            setPersonality={setPersonality}
            loading={loading}
            result={result}
            error={error}
            handleSubmit={handleSubmit}
            catImageUrl={catImageUrl}
            catFact={catFact}
            catBreed={catBreed}
            rottweilerImageUrl={rottweilerImageUrl}
            rottweilerFact={rottweilerFact}
          />
        }
      />
    </Routes>
  );
}

interface HomeProps {
  task: string;
  setTask: (value: string) => void;
  personality: PersonalityOption;
  setPersonality: (value: PersonalityOption) => void;
  loading: boolean;
  result: MotivationResponse | null;
  error: string | null;
  handleSubmit: (event: FormEvent) => void;
  catImageUrl: string | null;
  catFact: string | null;
  catBreed: { name: string; temperament: string; description: string } | null;
  rottweilerImageUrl: string | null;
  rottweilerFact: string | null;
}

function SnakeAmbient() {
  const [state, dispatch] = useReducer(reducer, undefined, createGameState);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) {
        return;
      }

      const directionMap: Record<string, Direction | undefined> = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
      };

      const requestedDirection = directionMap[event.key];

      if (requestedDirection) {
        event.preventDefault();
        dispatch({ type: 'turn', direction: requestedDirection });
        return;
      }

      if ((event.key === 'r' || event.key === 'R' || event.key === 'Enter' || event.key === ' ') && state.status === 'gameover') {
        event.preventDefault();
        dispatch({ type: 'reset' });
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => window.removeEventListener('keydown', onKeyDown);
  }, [state.status]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      dispatch({ type: 'tick' });
    }, TICK_MS);

    return () => window.clearInterval(interval);
  }, []);

  const head = state.snake[0];
  const snakeMap = new Map(state.snake.map((segment, index) => [`${segment.x}:${segment.y}`, index]));

  return (
    <div className="snake-ambient" aria-hidden="true" data-testid="snake-ambience">
      <div className="snake-stage" />
      <div className="snake-ambient-board-shell">
        <div className="snake-ambient-label">Snake ambience</div>
        <div
          className="snake-board snake-ambient-board"
          role="img"
          aria-label="Ambient Snake game board"
          data-testid="snake-board"
          data-direction={state.direction}
          data-score={state.score}
          data-length={state.snake.length}
          data-status={state.status}
          data-head={`${head.x}:${head.y}`}
        >
          {Array.from({ length: GRID_WIDTH * GRID_HEIGHT }, (_, index) => {
            const x = index % GRID_WIDTH;
            const y = Math.floor(index / GRID_WIDTH);
            const pointKey = `${x}:${y}`;
            const snakeIndex = snakeMap.get(pointKey);
            const isFood = samePoint({ x, y }, state.food);

            let cellClass = 'snake-cell';

            if (isFood) {
              cellClass += ' snake-cell-food';
            }

            if (snakeIndex !== undefined) {
              cellClass += snakeIndex === 0 ? ' snake-cell-head' : ' snake-cell-body';
            }

            return <span key={pointKey} className={cellClass} aria-hidden="true" />;
          })}
        </div>

        {state.status === 'gameover' && (
          <div className="snake-overlay snake-ambient-overlay" role="status" aria-live="polite">
            <p>Crash landed.</p>
            <strong>Press R to reset.</strong>
          </div>
        )}
      </div>
    </div>
  );
}

function Home({
  task,
  setTask,
  personality,
  setPersonality,
  loading,
  result,
  error,
  handleSubmit,
  catImageUrl,
  catFact,
  catBreed,
  rottweilerImageUrl,
  rottweilerFact,
}: HomeProps) {
  return (
    <div className="bladerunner-page home-page">
      <div className="bladerunner-scanline" />

      <SnakeAmbient />

      {catImageUrl && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: `url(${catImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.18,
            pointerEvents: 'none',
            zIndex: 0,
          }}
          aria-hidden="true"
        />
      )}

      {rottweilerImageUrl && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: `url(${rottweilerImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.12,
            pointerEvents: 'none',
            zIndex: 0,
          }}
          aria-hidden="true"
        />
      )}

      <header className="bladerunner-header home-header">
        <div className="home-kicker">MISSION CONTROL</div>
        <h1 className="bladerunner-title">HuMotivatoren</h1>
        <p className="bladerunner-subtitle">⚡ Unreasonably Relevant Motivation Engine ⚡</p>

        <nav className="bladerunner-nav home-nav">
          <Link to="/chaos" className="bladerunner-nav-link">🌪 Chaos Dashboard</Link>
          <Link to="/development_history" className="bladerunner-nav-link">📊 Development History</Link>
          <Link to="/word_of_your_mouth" className="bladerunner-nav-link">👄 Word of Your Mouth</Link>
          <Link to="/features" className="bladerunner-nav-link">✨ Features</Link>
        </nav>
      </header>

      <div className="bladerunner-container home-layout">
        <section className="home-panel home-intro">
          <div className="home-section-label">Briefing</div>
          <h2>Tell oss hva du skal gjøre</h2>
          <p>
            Vi pakker oppgaven din inn i en liten motivasjonsrakett med humor, fakta og akkurat nok kaos til at den føles mindre tung.
          </p>

          <div className="home-badges">
            <span>Motivasjon</span>
            <span>Humor</span>
            <span>Fakta</span>
            <span>GIF</span>
          </div>
        </section>

        <section className="home-panel home-form-panel">
          <form onSubmit={handleSubmit} className="bladerunner-form home-form">
            <label className="home-section-label" htmlFor="task-input">Oppdrag</label>
            <input
              id="task-input"
              type="text"
              value={task}
              onChange={(event) => setTask(event.target.value)}
              placeholder="Hva skal du gjøre? (f.eks. 'lese nyheter')"
              disabled={loading}
              className="bladerunner-input"
            />

            <CowsayBubble inputText={task} />

            {catImageUrl && (
              <div
                role="region"
                aria-label="Katteinformasjon"
                style={{
                  background: 'rgba(0,255,255,0.07)',
                  border: '1px solid var(--br-cyan)',
                  borderRadius: '4px',
                  padding: '1rem 1.25rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'flex-start',
                }}
              >
                <img
                  src={catImageUrl}
                  alt={catBreed ? `${catBreed.name} katt` : 'Søt katt'}
                  style={{ width: '110px', height: '110px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0, border: '1px solid var(--br-cyan)' }}
                />
                <div>
                  {catBreed && (
                    <>
                      <p style={{ margin: '0 0 0.2rem', fontWeight: 'bold', color: 'var(--br-cyan)', fontSize: '1rem' }}>🐱 {catBreed.name}</p>
                      <p style={{ margin: '0 0 0.3rem', color: 'var(--br-orange)', fontSize: '0.85rem' }}>🎭 {catBreed.temperament}</p>
                      <p style={{ margin: '0 0 0.5rem', color: 'var(--br-text)', fontSize: '0.88rem' }}>{catBreed.description}</p>
                    </>
                  )}
                  {catFact && <p style={{ margin: 0, color: 'var(--br-text)', fontSize: '0.88rem', fontStyle: 'italic' }}>💡 {catFact}</p>}
                </div>
              </div>
            )}

            {rottweilerImageUrl && (
              <div
                role="region"
                aria-label="Rottweilerinformasjon"
                style={{
                  background: 'rgba(255,140,0,0.07)',
                  border: '1px solid var(--br-orange)',
                  borderRadius: '4px',
                  padding: '1rem 1.25rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'flex-start',
                }}
              >
                <img
                  src={rottweilerImageUrl}
                  alt="Rottweiler"
                  style={{ width: '110px', height: '110px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0, border: '1px solid var(--br-orange)' }}
                />
                <div>
                  <p style={{ margin: '0 0 0.2rem', fontWeight: 'bold', color: 'var(--br-orange)', fontSize: '1rem' }}>🐕 Rottweiler</p>
                  <p style={{ margin: '0 0 0.3rem', color: 'var(--br-cyan)', fontSize: '0.85rem' }}>🎭 Lojal, selvsikker, modig</p>
                  {rottweilerFact && <p style={{ margin: 0, color: 'var(--br-text)', fontSize: '0.88rem', fontStyle: 'italic' }}>💡 {rottweilerFact}</p>}
                </div>
              </div>
            )}

            <div className="home-personality-grid">
              {PERSONALITIES.map(({ value, label, hint }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPersonality(value)}
                  className={`home-personality ${personality === value ? 'active' : ''}`}
                >
                  <strong>{label}</strong>
                  <span>{hint}</span>
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || !task.trim()}
              className="bladerunner-button bladerunner-submit-btn home-submit"
            >
              {loading ? '⏳ Tenker...' : 'Start mission'}
            </button>

            <IrrelevantStats inputText={task} />
          </form>

          {error && (
            <div className="bladerunner-error">
              <p style={{ margin: 0 }}>😅 {error}</p>
            </div>
          )}
        </section>

        {result && (
          <section className="home-panel home-result">
            <div className="home-section-label">Signal received</div>
            <div className="home-result-emoji">{result.emoji}</div>

            <div className="home-result-grid">
              <article>
                <h3>Quote</h3>
                <p>“{result.quote}”</p>
              </article>
              <article>
                <h3>Fakta</h3>
                <p>{result.fact}</p>
              </article>
              <article>
                <h3>Tips</h3>
                <p>{result.tip}</p>
              </article>
            </div>

            {(result.gifUrl || catImageUrl || rottweilerImageUrl) && (
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem', flexWrap: 'wrap' }}>
                {result.gifUrl && (
                  <img
                    src={result.gifUrl}
                    alt="Motiverende GIF"
                    style={{ flex: '1 1 45%', maxWidth: '48%', minWidth: '140px', border: '2px solid var(--br-cyan)', objectFit: 'cover' }}
                  />
                )}
                {catImageUrl && (
                  <img
                    src={catImageUrl}
                    alt={catBreed?.name ?? 'Søt katt'}
                    style={{ flex: '1 1 45%', maxWidth: '48%', minWidth: '140px', border: '2px solid var(--br-cyan)', objectFit: 'cover' }}
                  />
                )}
                {rottweilerImageUrl && (
                  <img
                    src={rottweilerImageUrl}
                    alt="Rottweiler"
                    style={{ flex: '1 1 45%', maxWidth: '48%', minWidth: '140px', border: '2px solid var(--br-orange)', objectFit: 'cover' }}
                  />
                )}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

export default App;
