import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from '../App';

vi.mock('../services/api', () => ({
  getMotivation: vi.fn().mockResolvedValue({
    quote: 'Du klarer det! 💪',
    fact: 'Visste du at 90% av alle statistikker er oppdiktet?',
    tip: 'Ta en kopp kaffe og gå for det',
    emoji: '🚀',
    personality: 'silly',
  }),
}));

describe('App', () => {
  it('renders HuMotivatoren heading', () => {
    render(<App />);
    expect(screen.getByText(/HuMotivatoren/i)).toBeInTheDocument();
  });

  it('renders the task input field', () => {
    render(<App />);
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
  });

  it('renders the submit button', () => {
    render(<App />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders personality selector', () => {
    render(<App />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('shows motivation result after valid submission', async () => {
    render(<App />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'lese nyheter' } });
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByText(/Du klarer det/i)).toBeInTheDocument();
    });
  });

  it('does not crash on empty submit', () => {
    render(<App />);
    expect(() => {
      fireEvent.click(screen.getByRole('button'));
    }).not.toThrow();
  });

  it('displays the emoji from response', async () => {
    render(<App />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'hackathon' } });
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByText('🚀')).toBeInTheDocument();
    });
  });
});
