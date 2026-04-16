import { useEffect, useReducer } from 'react';

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

export const SNAKE_GRID_WIDTH = 18;
export const SNAKE_GRID_HEIGHT = 14;
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
      x: Math.floor(Math.random() * SNAKE_GRID_WIDTH),
      y: Math.floor(Math.random() * SNAKE_GRID_HEIGHT),
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
        nextHead.x >= SNAKE_GRID_WIDTH ||
        nextHead.y < 0 ||
        nextHead.y >= SNAKE_GRID_HEIGHT;
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

export default function SnakeAmbient() {
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
  const statusText = state.status === 'gameover' ? `Game over. Last score: ${state.lastScore}.` : `Playing. Score: ${state.score}.`;

  return (
    <section className="snake-board-panel" aria-labelledby="snake-board-heading">
      <div className="snake-board-header">
        <h2 id="snake-board-heading">Snake board</h2>
        <button
          type="button"
          className="bladerunner-button snake-restart"
          onClick={() => dispatch({ type: 'reset' })}
        >
          Restart
        </button>
      </div>
      <div className="snake-board-shell">
        <div
          className="snake-board"
          role="grid"
          aria-label={`Snake board ${SNAKE_GRID_WIDTH} by ${SNAKE_GRID_HEIGHT}`}
          data-testid="snake-board"
          data-direction={state.direction}
          data-score={state.score}
          data-length={state.snake.length}
          data-status={state.status}
          data-head={`${head.x}:${head.y}`}
        >
          {Array.from({ length: SNAKE_GRID_WIDTH * SNAKE_GRID_HEIGHT }, (_, index) => {
            const x = index % SNAKE_GRID_WIDTH;
            const y = Math.floor(index / SNAKE_GRID_WIDTH);
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

            let cellLabel = `Row ${y + 1}, column ${x + 1}: empty`;

            if (isFood) {
              cellLabel = `Row ${y + 1}, column ${x + 1}: food`;
            }

            if (snakeIndex !== undefined) {
              cellLabel = snakeIndex === 0
                ? `Row ${y + 1}, column ${x + 1}: snake head`
                : `Row ${y + 1}, column ${x + 1}: snake body`;
            }

            return <span key={pointKey} className={cellClass} role="gridcell" aria-label={cellLabel} />;
          })}
        </div>

        {state.status === 'gameover' && (
          <div className="snake-overlay" role="status" aria-live="polite">
            <p>Crash landed.</p>
            <strong>Press R to reset.</strong>
          </div>
        )}
      </div>
      <div id="snake-game-status" className={`snake-status ${state.status === 'gameover' ? 'snake-status-alert' : ''}`} role="status" aria-live="polite">
        <p style={{ margin: 0 }}><strong>Status:</strong> {statusText}</p>
      </div>
    </section>
  );
}
