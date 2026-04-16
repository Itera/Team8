import { fireEvent, render, screen } from '@testing-library/react';
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

function renderApp(initialEntries: string[] = ['/']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <App />
    </MemoryRouter>,
  );
}

function mockRandomSequence(values: number[]) {
  const sequence = [...values];

  vi.spyOn(Math, 'random').mockImplementation(() => sequence.shift() ?? 0.9);
}

describe('App', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders the Snake demo and score', () => {
    mockRandomSequence([0.9, 0.9]);

    renderApp();

    expect(screen.getByText(/Nyan Snake/i)).toBeInTheDocument();
    expect(screen.getByTestId('snake-board')).toHaveAttribute('data-score', '0');
    expect(screen.getByTestId('snake-board')).toHaveAttribute('data-direction', 'right');
  });

  it('prevents reversing directly into itself', () => {
    mockRandomSequence([0.9, 0.9]);

    renderApp();

    const board = screen.getByTestId('snake-board');

    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(board).toHaveAttribute('data-direction', 'right');

    fireEvent.keyDown(window, { key: 'ArrowUp' });
    expect(board).toHaveAttribute('data-direction', 'up');
  });

  it('grows when eating food', async () => {
    mockRandomSequence([0.5, 0.5, 0.8, 0.8]);

    renderApp();

    const board = screen.getByTestId('snake-board');

    expect(board).toHaveAttribute('data-length', '3');

    await act(async () => {
      await vi.advanceTimersByTimeAsync(150);
    });

    expect(board).toHaveAttribute('data-score', '1');
    expect(board).toHaveAttribute('data-length', '4');
  });

  it('shows game over after a collision and can restart', async () => {
    mockRandomSequence([0.9, 0.1]);

    renderApp();

    const board = screen.getByTestId('snake-board');

    fireEvent.keyDown(window, { key: 'ArrowUp' });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(150 * 8);
    });

    expect(board).toHaveAttribute('data-status', 'gameover');
    expect(screen.getByText(/game over/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /restart game/i }));

    expect(board).toHaveAttribute('data-status', 'playing');
    expect(board).toHaveAttribute('data-score', '0');
  });

  it("auto-triggers motivation when selecting a category", async () => {
    renderApp();
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "lese nyheter" } });
    fireEvent.click(screen.getByRole("button", { name: "Sport Full energi" }));

    await waitFor(() => {
      expect(vi.mocked(fetch)).toHaveBeenCalledWith(
        "/api/motivate",
        expect.objectContaining({
          method: "POST",
        }),
      );
    });
  });
});
