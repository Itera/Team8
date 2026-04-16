import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

const MOCK_RESPONSE = {
  quote: 'Du klarer det!',
  fact: 'Visste du at 90% av alle statistikker er oppdiktet?',
  tip: 'Ta en kopp kaffe og ga for det',
  emoji: '🚀',
  personality: 'silly',
};

describe('App', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => MOCK_RESPONSE,
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders HuMotivatoren heading', () => {
    render(<MemoryRouter><App /></MemoryRouter>);
    expect(screen.getByText(/HuMotivatoren/i)).toBeInTheDocument();
  });

  it('renders the task input field', () => {
    render(<MemoryRouter><App /></MemoryRouter>);
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
  });

  it('renders the submit button', () => {
    render(<MemoryRouter><App /></MemoryRouter>);
    expect(screen.getByRole('button', { name: /motivasjon/i })).toBeInTheDocument();
  });

  it('renders personality buttons', () => {
    render(<MemoryRouter><App /></MemoryRouter>);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(4);
  });

  it('shows motivation result after valid submission', async () => {
    render(<MemoryRouter><App /></MemoryRouter>);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'lese nyheter' } });
    fireEvent.click(screen.getByRole('button', { name: /motivasjon/i }));

    await waitFor(() => {
      expect(screen.getByText(/Du klarer det/i)).toBeInTheDocument();
    });
  });

  it('does not crash on empty submit', () => {
    render(<MemoryRouter><App /></MemoryRouter>);
    expect(() => {
      fireEvent.click(screen.getByRole('button', { name: /motivasjon/i }));
    }).not.toThrow();
  });

  it('displays the emoji from response', async () => {
    render(<MemoryRouter><App /></MemoryRouter>);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'hackathon' } });
    fireEvent.click(screen.getByRole('button', { name: /motivasjon/i }));

    await waitFor(() => {
      expect(screen.getByText('🚀')).toBeInTheDocument();
    });
  });
});
