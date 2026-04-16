import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import WordOfYourMouth from '../views/WordOfYourMouth';

describe('WordOfYourMouth', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('shows a clear error state when camera APIs are unavailable', async () => {
    vi.stubGlobal('navigator', {
      mediaDevices: undefined,
    });

    render(
      <MemoryRouter>
        <WordOfYourMouth />
      </MemoryRouter>,
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(/camera api er ikke tilgjengelig/i);
  });

  it('renders the signal feed shell', () => {
    vi.stubGlobal('navigator', {
      mediaDevices: undefined,
    });

    render(
      <MemoryRouter>
        <WordOfYourMouth />
      </MemoryRouter>,
    );

    expect(screen.getByText(/signal feed/i)).toBeInTheDocument();
    expect(screen.getByText(/word_of_your_mouth/i)).toBeInTheDocument();
  });
});