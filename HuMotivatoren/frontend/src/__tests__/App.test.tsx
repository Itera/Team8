import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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

function mockFetch() {
  return vi.fn().mockImplementation(async (input: string | URL | Request) => {
    const url = String(input);

    if (url.includes('/api/motivate')) {
      return {
        ok: true,
        json: async () => ({
          quote: 'Keep going.',
          fact: 'You can do hard things.',
          tip: 'Start with the smallest step.',
          emoji: '✨',
          personality: 'silly',
        }),
      };
    }

    if (url.includes('/api/cowsay')) {
      return {
        ok: true,
        json: async () => ({ art: 'moo' }),
      };
    }

    if (url.includes('/api/weather/chaos')) {
      return {
        ok: true,
        json: async () => ({
          locationName: 'Gran Canaria',
          latitude: 28.1,
          longitude: -15.4,
          temperature: 21,
          windSpeed: 8,
          precipitation: 0,
          weatherCode: 0,
          summary: 'Sunny chaos',
          chaosLevel: 42,
          verdict: 'Looks manageable.',
          recommendedAction: 'Keep moving.',
        }),
      };
    }

    if (url.includes('/api/development-history')) {
      return {
        ok: true,
        json: async () => [],
      };
    }

    if (url.includes('/api/word-of-your-mouth/signal')) {
      return {
        ok: true,
        json: async () => ({
          transmission: 'ok',
          insight: 'ok',
          source: 'fallback',
          receivedAt: new Date().toISOString(),
        }),
      };
    }

    return {
      ok: true,
      json: async () => ({}),
    };
  });
}

describe('App', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('renders the home experience without ambient Snake board', () => {
    renderApp();

    expect(screen.getByRole('heading', { name: /HuMotivatoren/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Oppdrag/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Start mission/i })).toBeDisabled();
    expect(screen.queryByTestId('snake-ambience')).not.toBeInTheDocument();
    expect(screen.queryByTestId('snake-board')).not.toBeInTheDocument();
  });

  it('preserves the main utility routes including snake', async () => {
    const routes = [
      ['/features', /Features/i],
      ['/chaos', /Chaos Dashboard/i],
      ['/development_history', /development_history/i],
      ['/word_of_your_mouth', /word_of_your_mouth/i],
      ['/snake', /snake ambient/i],
    ] as const;

    for (const [path, heading] of routes) {
      const { unmount } = renderApp([path]);
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
      });
      unmount();
    }
  });

  it('submits the motivation form with the selected tone', async () => {
    renderApp();

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'lese nyheter' } });
    fireEvent.click(screen.getByRole('button', { name: /Sport/i }));
    fireEvent.click(screen.getByRole('button', { name: /Start mission/i }));

    await waitFor(() => {
      expect(vi.mocked(fetch)).toHaveBeenCalledWith(
        '/api/motivate',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ task: 'lese nyheter', personality: 'sports' }),
        }),
      );
    });

    expect(await screen.findByText(/keep going/i)).toBeInTheDocument();
  });

  it('includes navigation link to snake feature from home', () => {
    renderApp();

    expect(screen.getByRole('link', { name: /snake/i })).toHaveAttribute('href', '/snake');
  });

  it('renders dedicated snake route with accessible board and instructions', () => {
    renderApp(['/snake']);

    expect(screen.getByRole('heading', { name: /snake ambient/i })).toBeInTheDocument();
    expect(screen.getByRole('grid', { name: /snake board/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/keyboard instructions/i)).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('includes navigation link to snake feature from features page', () => {
    renderApp(['/features']);

    expect(screen.getByRole('link', { name: /snake ambient/i })).toHaveAttribute('href', '/snake');
    expect(screen.getByText(/gå til \/snake/i)).toBeInTheDocument();
  });
});
