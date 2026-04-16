import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getWordOfYourMouthSignal } from '../services/api';
import type { WordOfYourMouthSignal } from '../types';
import '../bladerunner.css';
import '../matrix.css';

type DetectorMode = 'face-landmarks' | 'face-box' | 'frame-fallback';

interface MotionRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

const ANALYSIS_INTERVAL_MS = 220;
const MATRIX_RENDER_INTERVAL_MS = 90;
const FETCH_COOLDOWN_MS = 600;
const SUBTITLE_DISPLAY_MS = 4000;
const MATRIX_GLYPHS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz@#%&*+=-:;<>[]{}()/\\|';

function getJokeSubtitleFromTransmission(transmission: string): string {
  const firstLine =
    transmission
      .split(/\r?\n/u)
      .map((line) => line.trim())
      .find((line) => line.length > 0)
    ?? transmission.trim();

  const normalized = firstLine
    .replace(/^transmission\s*[:\-]\s*/iu, '')
    .replace(/^joke\s*[:\-]\s*/iu, '')
    .trim();

  return normalized || firstLine;
}

function clampRegion(region: MotionRegion, width: number, height: number): MotionRegion {
  const x = Math.max(0, Math.min(region.x, width - 1));
  const y = Math.max(0, Math.min(region.y, height - 1));
  const safeWidth = Math.max(24, Math.min(region.width, width - x));
  const safeHeight = Math.max(18, Math.min(region.height, height - y));

  return { x, y, width: safeWidth, height: safeHeight };
}

function buildMotionSignature(imageData: ImageData): Float32Array {
  const columns = 6;
  const rows = 4;
  const signature = new Float32Array(columns * rows);
  const counts = new Uint16Array(columns * rows);
  const { data, width, height } = imageData;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const pixelOffset = (y * width + x) * 4;
      const luminance =
        data[pixelOffset] * 0.2126 +
        data[pixelOffset + 1] * 0.7152 +
        data[pixelOffset + 2] * 0.0722;
      const column = Math.min(columns - 1, Math.floor((x / width) * columns));
      const row = Math.min(rows - 1, Math.floor((y / height) * rows));
      const bucket = row * columns + column;

      signature[bucket] += luminance;
      counts[bucket] += 1;
    }
  }

  for (let index = 0; index < signature.length; index += 1) {
    signature[index] = counts[index] === 0 ? 0 : signature[index] / counts[index];
  }

  return signature;
}

function getMotionDelta(previous: Float32Array | null, next: Float32Array): number {
  if (!previous || previous.length !== next.length) {
    return 0;
  }

  let total = 0;

  for (let index = 0; index < next.length; index += 1) {
    total += Math.abs(next[index] - previous[index]);
  }

  return total / next.length;
}

function pickMouthRegionFromFace(face: DetectedFace): { mode: DetectorMode; region: MotionRegion } {
  const { boundingBox } = face;
  const mouthLandmark = face.landmarks?.find((landmark) => landmark.type.includes('mouth'));

  if (mouthLandmark && mouthLandmark.locations.length > 0) {
    const point = mouthLandmark.locations[0];
    return {
      mode: 'face-landmarks',
      region: {
        x: point.x - boundingBox.width * 0.18,
        y: point.y - boundingBox.height * 0.08,
        width: boundingBox.width * 0.36,
        height: boundingBox.height * 0.18,
      },
    };
  }

  return {
    mode: 'face-box',
    region: {
      x: boundingBox.x + boundingBox.width * 0.28,
      y: boundingBox.y + boundingBox.height * 0.62,
      width: boundingBox.width * 0.44,
      height: boundingBox.height * 0.18,
    },
  };
}

function getFallbackRegion(videoWidth: number, videoHeight: number): MotionRegion {
  return {
    x: videoWidth * 0.32,
    y: videoHeight * 0.58,
    width: videoWidth * 0.36,
    height: videoHeight * 0.16,
  };
}

function renderMatrixFrame(
  context: CanvasRenderingContext2D,
  frame: ImageData,
  mouthRegion: MotionRegion | null,
  mouthMoving: boolean,
): void {
  const { width, height, data } = frame;
  const cellSize = Math.max(6, Math.floor(width / 80));
  const rows = Math.ceil(height / cellSize);
  const columns = Math.ceil(width / cellSize);

  context.fillStyle = '#000000';
  context.fillRect(0, 0, width, height);
  context.font = `${cellSize}px "Share Tech Mono", monospace`;
  context.textBaseline = 'top';

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const x = column * cellSize;
      const y = row * cellSize;
      const sampleX = Math.max(0, Math.min(width - 1, width - x - Math.ceil(cellSize / 2)));
      const sampleY = Math.max(0, Math.min(height - 1, y + Math.ceil(cellSize / 2)));
      const pixelOffset = (sampleY * width + sampleX) * 4;
      const luminance =
        data[pixelOffset] * 0.2126 +
        data[pixelOffset + 1] * 0.7152 +
        data[pixelOffset + 2] * 0.0722;
      const glyphIndex = Math.min(
        MATRIX_GLYPHS.length - 1,
        Math.floor((luminance / 255) * (MATRIX_GLYPHS.length - 1)),
      );
      const glyph = MATRIX_GLYPHS[glyphIndex];
      const alpha = Math.max(0.12, luminance / 255);
      const isInMouthRegion =
        mouthRegion
        && x >= mouthRegion.x
        && x <= mouthRegion.x + mouthRegion.width
        && y >= mouthRegion.y
        && y <= mouthRegion.y + mouthRegion.height;

      if (luminance < 16 && !isInMouthRegion) {
        continue;
      }

      if (isInMouthRegion && mouthMoving) {
        context.fillStyle = `rgba(198, 255, 198, ${Math.min(1, alpha + 0.2)})`;
      } else if (luminance > 160) {
        context.fillStyle = `rgba(126, 255, 151, ${Math.min(1, alpha + 0.08)})`;
      } else {
        context.fillStyle = `rgba(0, 255, 65, ${alpha})`;
      }

      context.fillText(glyph, x, y);
    }
  }

  if (mouthRegion) {
    context.strokeStyle = mouthMoving ? 'rgba(198, 255, 198, 0.85)' : 'rgba(0, 255, 65, 0.45)';
    context.lineWidth = 1;
    context.strokeRect(mouthRegion.x, mouthRegion.y, mouthRegion.width, mouthRegion.height);
  }
}

export default function WordOfYourMouth() {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const analysisCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const previousSignatureRef = useRef<Float32Array | null>(null);
  const lastMotionStateRef = useRef(false);
  const lastFetchAtRef = useRef(0);
  const lastAnalysisAtRef = useRef(0);
  const lastMatrixRenderAtRef = useRef(0);
  const fetchInFlightRef = useRef(false);
  const detectorRef = useRef<FaceDetector | null>(null);
  const mouthRegionRef = useRef<{ mode: DetectorMode; region: MotionRegion } | null>(null);
  const subtitleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [signalError, setSignalError] = useState<string | null>(null);
  const [mouthMoving, setMouthMoving] = useState(false);
  const [detectorMode, setDetectorMode] = useState<DetectorMode>('frame-fallback');
  const [motionScore, setMotionScore] = useState(0);
  const [signal, setSignal] = useState<WordOfYourMouthSignal | null>(null);
  const [signalLoading, setSignalLoading] = useState(false);
  const [currentSubtitle, setCurrentSubtitle] = useState<string | null>(null);
  const [subtitleFading, setSubtitleFading] = useState(false);
  const [fullscreenSupported, setFullscreenSupported] = useState(false);
  const [isStageFullscreen, setIsStageFullscreen] = useState(false);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const hasRequestFullscreen =
      typeof Element !== 'undefined' && typeof Element.prototype.requestFullscreen === 'function';
    const hasExitFullscreen = typeof document.exitFullscreen === 'function';
    const canUseFullscreen = Boolean(document.fullscreenEnabled) && hasRequestFullscreen && hasExitFullscreen;
    setFullscreenSupported(canUseFullscreen);

    const syncFullscreenState = () => {
      setIsStageFullscreen(document.fullscreenElement === stageRef.current);
    };

    document.addEventListener('fullscreenchange', syncFullscreenState);
    syncFullscreenState();

    return () => {
      document.removeEventListener('fullscreenchange', syncFullscreenState);
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function bootCamera() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError('Camera API er ikke tilgjengelig i denne nettleseren. Prøv en moderne Chromium-basert nettleser eller Safari med kameratilgang slått på.');
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });

        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        const video = videoRef.current;

        if (!video) {
          setCameraError('Klarte ikke å montere videovisningen.');
          return;
        }

        video.srcObject = stream;
        await video.play();
        setCameraReady(true);
      } catch (error) {
        const message =
          error instanceof DOMException && error.name === 'NotAllowedError'
            ? 'Kameratilgang ble blokkert. Tillat kamera for denne siden for å bruke Word of Your Mouth.'
            : 'Kunne ikke starte kameraet. Sjekk enhet, tillatelser og om et annet program bruker kameraet.';
        setCameraError(message);
      }
    }

    if (typeof window !== 'undefined' && window.FaceDetector) {
      detectorRef.current = new window.FaceDetector({
        fastMode: true,
        maxDetectedFaces: 1,
      });
    }

    bootCamera();

    return () => {
      active = false;

      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      if (subtitleTimeoutRef.current) {
        clearTimeout(subtitleTimeoutRef.current);
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!cameraReady || cameraError) {
      return;
    }

    let stopped = false;

    const drawFrame = async (timestamp: number) => {
      if (stopped) {
        return;
      }

      const video = videoRef.current;
      const overlayCanvas = overlayCanvasRef.current;
      const analysisCanvas = analysisCanvasRef.current;

      if (!video || !overlayCanvas || !analysisCanvas || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
        animationFrameRef.current = requestAnimationFrame(drawFrame);
        return;
      }

      if (overlayCanvas.width !== video.videoWidth || overlayCanvas.height !== video.videoHeight) {
        overlayCanvas.width = video.videoWidth;
        overlayCanvas.height = video.videoHeight;
      }

      const overlayContext = overlayCanvas.getContext('2d');
      const analysisContext = analysisCanvas.getContext('2d', { willReadFrequently: true });

      if (analysisContext) {
        analysisCanvas.width = video.videoWidth;
        analysisCanvas.height = video.videoHeight;
        analysisContext.drawImage(video, 0, 0, analysisCanvas.width, analysisCanvas.height);

        const shouldAnalyze = timestamp - lastAnalysisAtRef.current >= ANALYSIS_INTERVAL_MS;
        const shouldRender = timestamp - lastMatrixRenderAtRef.current >= MATRIX_RENDER_INTERVAL_MS;

        if (shouldAnalyze) {
          lastAnalysisAtRef.current = timestamp;

          let activeRegion = mouthRegionRef.current;

          if (detectorRef.current) {
            try {
              const faces = await detectorRef.current.detect(video);

              if (faces.length > 0) {
                activeRegion = pickMouthRegionFromFace(faces[0]);
                mouthRegionRef.current = activeRegion;
                setDetectorMode(activeRegion.mode);
              }
            } catch {
              detectorRef.current = null;
            }
          }

          if (!activeRegion) {
            activeRegion = {
              mode: 'frame-fallback',
              region: getFallbackRegion(video.videoWidth, video.videoHeight),
            };
            mouthRegionRef.current = activeRegion;
            setDetectorMode('frame-fallback');
          }

          const clampedRegion = clampRegion(activeRegion.region, video.videoWidth, video.videoHeight);
          const imageData = analysisContext.getImageData(
            clampedRegion.x,
            clampedRegion.y,
            clampedRegion.width,
            clampedRegion.height,
          );
          const signature = buildMotionSignature(imageData);
          const delta = getMotionDelta(previousSignatureRef.current, signature);
          previousSignatureRef.current = signature;
          setMotionScore(Number(delta.toFixed(1)));

          const threshold = activeRegion.mode === 'face-landmarks' ? 11 : 15;
          const nextMouthMoving = delta >= threshold;
          const normalizedConfidence = Math.max(0, Math.min(1, delta / (threshold * 1.8)));

          if (nextMouthMoving !== lastMotionStateRef.current) {
            lastMotionStateRef.current = nextMouthMoving;
            setMouthMoving(nextMouthMoving);
          }

          if (
            nextMouthMoving &&
            Date.now() - lastFetchAtRef.current >= FETCH_COOLDOWN_MS &&
            !fetchInFlightRef.current
          ) {
            fetchInFlightRef.current = true;
            lastFetchAtRef.current = Date.now();
            setSignalLoading(true);
            setSignalError(null);

            getWordOfYourMouthSignal({
              mouthMoving: nextMouthMoving,
              confidence: Number(normalizedConfidence.toFixed(2)),
            })
              .then((response) => {
                setSignal(response);
                setCurrentSubtitle(getJokeSubtitleFromTransmission(response.transmission));
                setSubtitleFading(false);

                if (subtitleTimeoutRef.current) {
                  clearTimeout(subtitleTimeoutRef.current);
                }

                subtitleTimeoutRef.current = setTimeout(() => {
                  setSubtitleFading(true);
                  setTimeout(() => {
                    setCurrentSubtitle(null);
                    setSubtitleFading(false);
                  }, 300);
                }, SUBTITLE_DISPLAY_MS);
              })
              .catch((error: unknown) => {
                setSignalError(
                  error instanceof Error
                    ? error.message
                    : 'Matrix-signalet kunne ikke hentes akkurat nå.',
                );
              })
              .finally(() => {
                fetchInFlightRef.current = false;
                setSignalLoading(false);
              });
          }
        }

        if (shouldRender && overlayContext) {
          lastMatrixRenderAtRef.current = timestamp;
          const frame = analysisContext.getImageData(0, 0, analysisCanvas.width, analysisCanvas.height);
          renderMatrixFrame(
            overlayContext,
            frame,
            mouthRegionRef.current?.region ?? null,
            lastMotionStateRef.current,
          );
        }
      }

      animationFrameRef.current = requestAnimationFrame(drawFrame);
    };

    animationFrameRef.current = requestAnimationFrame(drawFrame);

    return () => {
      stopped = true;

      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [cameraError, cameraReady]);

  const detectorLabel =
    detectorMode === 'face-landmarks'
      ? 'Face landmarks'
      : detectorMode === 'face-box'
        ? 'Face box fallback'
        : 'Frame-region fallback';

  const fullscreenButtonLabel = !fullscreenSupported
    ? 'Fullscreen unavailable'
    : isStageFullscreen
      ? 'Exit stage fullscreen'
      : 'Enter stage fullscreen';

  const toggleStageFullscreen = async () => {
    const stage = stageRef.current;

    if (!stage || !fullscreenSupported) {
      return;
    }

    if (document.fullscreenElement === stage) {
      await document.exitFullscreen();
      return;
    }

    await stage.requestFullscreen();
  };

  return (
    <div className="bladerunner-page matrix-mouth-page">
      <div className="bladerunner-scanline" />

      <header className="bladerunner-header matrix-mouth-header">
        <h1 className="bladerunner-title">word_of_your_mouth</h1>
        <p className="bladerunner-subtitle">
          ⚡ Mouth motion triggers live joke subtitles ⚡
        </p>
        <nav className="bladerunner-nav">
          <Link to="/" className="bladerunner-nav-link">
            🏠 Return to Home
          </Link>
          <Link to="/development_history" className="bladerunner-nav-link">
            📊 Development History
          </Link>
        </nav>
      </header>

      <div className="bladerunner-container matrix-mouth-layout">
        <section className="matrix-mouth-panel matrix-mouth-visual-panel">
          <div className="matrix-mouth-stage-controls">
            <button
              type="button"
              className="matrix-mouth-fullscreen-toggle"
              onClick={() => {
                void toggleStageFullscreen();
              }}
              disabled={!fullscreenSupported}
              aria-pressed={isStageFullscreen}
              aria-label={fullscreenButtonLabel}
            >
              {fullscreenButtonLabel}
            </button>
            {!fullscreenSupported && (
              <span className="matrix-mouth-fullscreen-note" role="status">
                Fullscreen is not available in this browser.
              </span>
            )}
          </div>

          <div className="matrix-mouth-stage" ref={stageRef} aria-label="Video capture stage">
            <video
              ref={videoRef}
              className="matrix-mouth-video"
              autoPlay
              muted
              playsInline
            />
            <canvas ref={overlayCanvasRef} className="matrix-mouth-overlay" aria-hidden="true" />
            <div className="matrix-mouth-vignette" aria-hidden="true" />
            <div
              className={`matrix-mouth-subtitle ${subtitleFading ? 'fading' : ''}`}
              role="status"
              aria-live="assertive"
              aria-label="Real-time joke subtitle"
            >
              {currentSubtitle}
            </div>
            <div className="matrix-mouth-hud">
              <span>Detector: {detectorLabel}</span>
              <span>Motion score: {motionScore}</span>
              <span>Status: {mouthMoving ? 'Joke trigger detected' : 'Listening for joke trigger'}</span>
            </div>
          </div>

          <canvas ref={analysisCanvasRef} className="matrix-mouth-analysis-canvas" aria-hidden="true" />

          {cameraError ? (
            <div className="bladerunner-error matrix-mouth-alert" role="alert">
              {cameraError}
            </div>
          ) : (
            <div className="matrix-mouth-readout">
              <p>
                Kamerasignalet blir tegnet om som ekte matrix-bokstaver, ikke som et grønt videofilter med tegn oppå.
              </p>
              <p>
                Når munnen beveger seg, sender siden levende bevegelsesdata til backend og henter en ny vitselinje fra transmisjonen.
              </p>
              <p>
                Fallback uten face landmarks bruker et nedre sentrumsområde i videobildet og kan trigges av annen bevegelse nær ansiktet.
              </p>
            </div>
          )}
        </section>

        <section className="matrix-mouth-panel matrix-mouth-signal-panel" aria-live="polite">
          <div className="matrix-mouth-output-header">
            <h2>Joke Feed</h2>
            <span>{signalLoading ? 'Receiving...' : 'Standby'}</span>
          </div>

          {signalError && (
            <div className="bladerunner-error matrix-mouth-alert" role="alert">
              {signalError}
            </div>
          )}

          {signal ? (
            <article className="matrix-mouth-signal-card">
              <p className="matrix-mouth-signal-label">Joke line</p>
              <h3>{signal.transmission}</h3>
              <p className="matrix-mouth-signal-copy">{signal.insight}</p>
              <div className="matrix-mouth-signal-meta">
                <span>Source: {signal.source}</span>
                <span>Received: {signal.receivedAt}</span>
              </div>
            </article>
          ) : (
            <div className="matrix-mouth-empty-state">
              <p>Open your mouth or speak silently to trigger the first joke intercept.</p>
              <p>The page waits for visible motion before calling the backend endpoint.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}