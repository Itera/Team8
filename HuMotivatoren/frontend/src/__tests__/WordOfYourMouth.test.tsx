import { act, render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import WordOfYourMouth from '../views/WordOfYourMouth';
import { getWordOfYourMouthSignal } from '../services/api';

vi.mock('../services/api', () => ({
  getWordOfYourMouthSignal: vi.fn(),
}));

describe('WordOfYourMouth', () => {
  type RafCallback = (timestamp: number) => void;
  const rafCallbacks: RafCallback[] = [];

  async function flushAnimationFrame(timestamp: number): Promise<void> {
    const callback = rafCallbacks.shift();
    if (callback) {
      await callback(timestamp);
    }
  }

  beforeEach(() => {
    vi.restoreAllMocks();
    rafCallbacks.length = 0;

    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback: FrameRequestCallback) => {
      rafCallbacks.push(callback as RafCallback);
      return rafCallbacks.length;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});

    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);

    Object.defineProperty(HTMLMediaElement.prototype, 'readyState', {
      configurable: true,
      get: () => HTMLMediaElement.HAVE_CURRENT_DATA,
    });
    Object.defineProperty(HTMLVideoElement.prototype, 'videoWidth', {
      configurable: true,
      get: () => 320,
    });
    Object.defineProperty(HTMLVideoElement.prototype, 'videoHeight', {
      configurable: true,
      get: () => 180,
    });

    vi.stubGlobal('navigator', {
      mediaDevices: {
        getUserMedia: vi.fn(),
      },
    });
  });
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

    expect(screen.getByText(/joke feed/i)).toBeInTheDocument();
    expect(screen.getByText(/word_of_your_mouth/i)).toBeInTheDocument();
  });

  it('renders transmission as subtitle text when signal response arrives', async () => {
    const fakeTrack = { stop: vi.fn() };
    const fakeStream = {
      getTracks: () => [fakeTrack],
    } as unknown as MediaStream;

    vi.stubGlobal('navigator', {
      mediaDevices: {
        getUserMedia: vi.fn().mockResolvedValue(fakeStream),
      },
    });

    let mouthSampleReadCount = 0;
    const analysisContext = {
      drawImage: vi.fn(),
      getImageData: vi.fn((x: number, y: number, width: number, height: number) => {
        const safeWidth = Math.max(1, Math.floor(width));
        const safeHeight = Math.max(1, Math.floor(height));
        const pixelCount = safeWidth * safeHeight;
        const data = new Uint8ClampedArray(pixelCount * 4);
        const isMouthRegionSample = safeWidth < 200 && safeHeight < 120;
        let luminance = 30;

        if (isMouthRegionSample) {
          mouthSampleReadCount += 1;
          luminance = mouthSampleReadCount === 1 ? 25 : 245;
        }

        for (let index = 0; index < pixelCount; index += 1) {
          const offset = index * 4;
          data[offset] = luminance;
          data[offset + 1] = luminance;
          data[offset + 2] = luminance;
          data[offset + 3] = 255;
        }

        return { data, width: safeWidth, height: safeHeight } as ImageData;
      }),
    } as unknown as CanvasRenderingContext2D;

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation((
      contextId: string,
      options?: CanvasRenderingContext2DSettings,
    ) => {
      if (contextId === '2d' && options?.willReadFrequently) {
        return analysisContext;
      }

      return null;
    });

    vi.mocked(getWordOfYourMouthSignal).mockResolvedValue({
      transmission: 'Matrix line received. Keep smiling, operator.',
      insight: 'High-confidence mouth motion produced a strong matrix transmission.',
      source: 'llm',
      receivedAt: '2026-04-16T12:00:00.000Z',
    });

    render(
      <MemoryRouter>
        <WordOfYourMouth />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(rafCallbacks.length).toBeGreaterThan(0);
    });

    await act(async () => {
      await flushAnimationFrame(300);
      await flushAnimationFrame(620);
      await flushAnimationFrame(940);
      await flushAnimationFrame(1260);
    });

    await waitFor(() => {
      expect(getWordOfYourMouthSignal).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(screen.getByLabelText(/real-time joke subtitle/i)).toHaveTextContent(
        'Matrix line received. Keep smiling, operator.',
      );
    });
  });
});