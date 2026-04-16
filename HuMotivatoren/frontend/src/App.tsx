import { useEffect, useReducer } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import ChangeDetail from './views/ChangeDetail';
import ChaosDashboard from './views/ChaosDashboard';
import DevelopmentHistory from './views/DevelopmentHistory';
import Features from './views/Features';
import WordOfYourMouth from './views/WordOfYourMouth';
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

const GRID_WIDTH = 18;
const GRID_HEIGHT = 14;
const TICK_MS = 150;

const INITIAL_SNAKE: Point[] = [
  { x: 8, y: 7 },
  { x: 7, y: 7 },
  { x: 6, y: 7 },
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
  return (
    <Routes>
      <Route path="/development_history/:hash" element={<ChangeDetail />} />
      <Route path="/development_history" element={<DevelopmentHistory />} />
      <Route path="/word_of_your_mouth" element={<WordOfYourMouth />} />
      <Route path="/features" element={<Features />} />
      <Route path="/chaos" element={<ChaosDashboard latestTask="" />} />
      <Route path="*" element={<SnakeHome />} />
    </Routes>
  );
}

function SnakeHome() {
  const [state, dispatch] = useReducer(reducer, undefined, createGameState);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
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
    <div className="snake-page bladerunner-page">
      <div className="snake-stage" aria-hidden="true">
        <div className="snake-stars" />
        <div className="snake-rainbow" />
        <div className="snake-cat">
          <span className="snake-cat-body" />
          <span className="snake-cat-face" />
          <span className="snake-cat-tail" />
        </div>
      </div>

      <header className="bladerunner-header snake-header">
        <div className="home-kicker">PROJECT DEMO</div>
        <h1 className="bladerunner-title">Nyan Snake</h1>
        <p className="bladerunner-subtitle">Arrow keys only. Eat the dots. Try not to crash into yourself.</p>

        <nav className="bladerunner-nav snake-nav">
          <Link to="/chaos" className="bladerunner-nav-link">🌪 Chaos Dashboard</Link>
          <Link to="/development_history" className="bladerunner-nav-link">📊 Development History</Link>
          <Link to="/word_of_your_mouth" className="bladerunner-nav-link">👄 Word of Your Mouth</Link>
          <Link to="/features" className="bladerunner-nav-link">✨ Features</Link>
        </nav>
      </header>

      <main className="bladerunner-container snake-layout">
        <section className="snake-panel snake-intro-panel">
          <div className="home-section-label">Controls</div>
          <h2>Simple, loud, and playable</h2>
          <p>
            Use the arrow keys to steer. The snake grows when it eats food, and crashes reset the board so you can jump back in fast.
          </p>

          <div className="snake-controls">
            <div><strong>Move:</strong> Arrow keys</div>
            <div><strong>Restart:</strong> Button or R</div>
            <div><strong>Goal:</strong> Beat your score</div>
          </div>

          <div className="snake-score-card">
            <span>Score</span>
            <strong>{state.score}</strong>
          </div>

          {state.status === 'gameover' && (
            <div className="snake-status snake-status-alert" aria-live="polite">
              <strong>Game over.</strong>
              <span>Last score: {state.lastScore}.</span>
            </div>
          )}
        </section>

        <section className="snake-panel snake-board-panel">
          <div className="snake-board-header">
            <div>
              <div className="home-section-label">Playfield</div>
              <h2>Keep the nyan trail alive</h2>
            </div>

            <button type="button" className="bladerunner-button snake-restart" onClick={() => dispatch({ type: 'reset' })}>
              Restart game
            </button>
          </div>

          <div className="snake-board-shell">
            <div
              className="snake-board"
              role="img"
              aria-label="Snake game board"
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
              <div className="snake-overlay" role="status" aria-live="polite">
                <p>Crash landed.</p>
                <strong>Press restart or R to try again.</strong>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
