// ============================
// Sound Effects Hook: Web Audio API synth-based TV game show sounds
// ============================
import { useCallback, useRef } from 'react';

export function useSoundEffects() {
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return ctxRef.current;
  }, []);

  // Simple tone helper
  const playTone = useCallback((freq: number, duration: number, type: OscillatorType = 'sine', gain = 0.15) => {
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      g.gain.setValueAtTime(gain, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch {}
  }, [getCtx]);

  // Hex select - digital blip
  const playHexSelect = useCallback(() => {
    playTone(880, 0.12, 'sine', 0.1);
    setTimeout(() => playTone(1100, 0.08, 'sine', 0.08), 60);
  }, [playTone]);

  // Question reveal - suspenseful rising chime
  const playQuestionReveal = useCallback(() => {
    playTone(440, 0.3, 'sine', 0.12);
    setTimeout(() => playTone(554, 0.3, 'sine', 0.12), 150);
    setTimeout(() => playTone(659, 0.4, 'sine', 0.15), 300);
    setTimeout(() => playTone(880, 0.5, 'triangle', 0.1), 500);
  }, [playTone]);

  // Correct answer - rewarding ascending arpeggio
  const playCorrect = useCallback(() => {
    playTone(523, 0.15, 'sine', 0.12);
    setTimeout(() => playTone(659, 0.15, 'sine', 0.12), 100);
    setTimeout(() => playTone(784, 0.15, 'sine', 0.12), 200);
    setTimeout(() => playTone(1047, 0.4, 'triangle', 0.15), 300);
  }, [playTone]);

  // Wrong answer - descending
  const playWrong = useCallback(() => {
    playTone(400, 0.2, 'sawtooth', 0.08);
    setTimeout(() => playTone(300, 0.3, 'sawtooth', 0.06), 150);
  }, [playTone]);

  // Golden question - sparkle
  const playGolden = useCallback(() => {
    playTone(1047, 0.15, 'sine', 0.12);
    setTimeout(() => playTone(1319, 0.15, 'sine', 0.12), 100);
    setTimeout(() => playTone(1568, 0.15, 'sine', 0.12), 200);
    setTimeout(() => playTone(2093, 0.3, 'sine', 0.15), 300);
    setTimeout(() => playTone(1568, 0.2, 'sine', 0.1), 500);
    setTimeout(() => playTone(2093, 0.4, 'sine', 0.12), 600);
  }, [playTone]);

  // Win fanfare
  const playWin = useCallback(() => {
    [523, 659, 784, 1047].forEach((f, i) => {
      setTimeout(() => playTone(f, 0.3, 'sine', 0.15), i * 200);
    });
    setTimeout(() => playTone(1047, 0.8, 'triangle', 0.2), 800);
  }, [playTone]);

  return { playHexSelect, playQuestionReveal, playCorrect, playWrong, playGolden, playWin };
}
