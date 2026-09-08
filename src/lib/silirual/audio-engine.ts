/**
 * CiliRual Audio Engine — Lightweight Web Audio API helper for game sound effects.
 * Provides synthesized tones, chimes, and feedback sounds without external audio files.
 */

let audioCtx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || (window as unknown as Record<string, unknown>).webkitAudioContext as typeof AudioContext)();
    } catch {
      return null;
    }
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/** Play a single tone at the given frequency for the given duration. */
export function playTone(frequency: number, duration = 0.2, volume = 0.15) {
  const ctx = getContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(frequency, ctx.currentTime);
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

/** Tile tones for Pattern/Signals games (Simon-style frequencies). */
const TILE_FREQUENCIES = [329.63, 261.63, 392.0, 523.25, 440.0]; // E4, C4, G4, C5, A4

export function playTileTone(tileIndex: number, duration = 0.3) {
  const freq = TILE_FREQUENCIES[tileIndex % TILE_FREQUENCIES.length]!;
  playTone(freq, duration, 0.18);
}

/** Success chime — gentle ascending two-tone. */
export function playSuccess() {
  const ctx = getContext();
  if (!ctx) return;
  playTone(523.25, 0.15, 0.12); // C5
  setTimeout(() => playTone(659.25, 0.25, 0.12), 150); // E5
}

/** Encouragement sound — gentle single warm tone. */
export function playEncouragement() {
  playTone(392.0, 0.3, 0.1); // G4
}

/** Card flip sound — short soft click. */
export function playCardFlip() {
  const ctx = getContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(800, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.05);
  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.06);
}

/** Card match sound — gentle pleasant ding. */
export function playCardMatch() {
  playTone(659.25, 0.2, 0.12); // E5
  setTimeout(() => playTone(783.99, 0.3, 0.1), 100); // G5
}

/** Cup shuffle sound — soft whoosh-like sweep. */
export function playCupShuffle() {
  const ctx = getContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(200, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(400, ctx.currentTime + 0.12);
  osc.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.24);
  gain.gain.setValueAtTime(0.06, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.26);
}

/** Level complete celebration — ascending arpeggio. */
export function playCelebration() {
  const notes = [523.25, 587.33, 659.25, 783.99]; // C5, D5, E5, G5
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.2, 0.1), i * 120);
  });
}
