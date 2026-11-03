/**
 * Wake Word Detection & Voice Command Extraction Engine for ARONE
 * Provides flexible wake-word detection, command isolation, and audio chime feedback.
 */

export const DEFAULT_WAKE_WORD = 'ARONE';
export const PRESET_WAKE_WORDS = ['ARONE', 'JARVIS', 'FRIDAY', 'COMPUTER'] as const;

export interface WakeWordResult {
  detected: boolean;
  command: string;
  wakeWordMatch: string;
  rawTranscript: string;
}

export interface WakeWordConfig {
  wakeWord: string;
  handsFreeEnabled: boolean;
  soundFeedback: boolean;
  autoExecute: boolean;
}

/**
 * Normalizes and sanitizes a custom wake-word.
 */
export function sanitizeWakeWord(input: string): string {
  if (!input) return DEFAULT_WAKE_WORD;
  const cleaned = input
    .trim()
    .replace(/[^a-zA-Z0-9_\-\s]/g, '')
    .toUpperCase();
  if (cleaned.length < 2) return DEFAULT_WAKE_WORD;
  return cleaned.slice(0, 24);
}

/**
 * Escapes regex special characters.
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Detects if a transcript contains the target wake word and extracts the payload command.
 * Supports patterns like:
 * - "ARONE, turn on the lights" -> detected=true, command="turn on the lights"
 * - "Hey ARONE what is the weather?" -> detected=true, command="what is the weather"
 * - "ARONE" -> detected=true, command=""
 * - "status report" (no wake word) -> detected=false, command=""
 */
export function detectWakeWord(transcript: string, targetWakeWord: string): WakeWordResult {
  const rawTranscript = transcript.trim();
  if (!rawTranscript) {
    return { detected: false, command: '', wakeWordMatch: '', rawTranscript };
  }

  const cleanTarget = sanitizeWakeWord(targetWakeWord).toLowerCase();
  const lowerTranscript = rawTranscript.toLowerCase();

  // Pattern: Optional ("hey", "ok", "okay", "hello", "hi") + optional punctuation + targetWakeWord + optional punctuation
  const escapedTarget = escapeRegex(cleanTarget);
  const regex = new RegExp(
    `(?:\\b(?:hey|ok|okay|hello|hi)\\s+)?\\b(${escapedTarget})\\b[,.!?:]*\\s*(.*)`,
    'i'
  );

  const match = lowerTranscript.match(regex);

  if (match) {
    const wakeWordMatch = match[1];
    let command = match[2] ? match[2].trim() : '';

    // Clean up trailing/leading punctuation on command
    command = command.replace(/^[,.!?:\s]+|[,.!?:\s]+$/g, '').trim();

    return {
      detected: true,
      command,
      wakeWordMatch,
      rawTranscript,
    };
  }

  // Also handle embedded wake word where speech engine transcribed wake word in the middle:
  // e.g. "could you please arone turn off the lights"
  const middleRegex = new RegExp(`\\b${escapedTarget}\\b[,.!?:]*\\s*(.*)`, 'i');
  const middleMatch = lowerTranscript.match(middleRegex);
  if (middleMatch) {
    let command = middleMatch[1] ? middleMatch[1].trim() : '';
    command = command.replace(/^[,.!?:\s]+|[,.!?:\s]+$/g, '').trim();
    return {
      detected: true,
      command,
      wakeWordMatch: cleanTarget,
      rawTranscript,
    };
  }

  return {
    detected: false,
    command: '',
    wakeWordMatch: '',
    rawTranscript,
  };
}

/**
 * Loads wake-word settings from localStorage (safe for SSR/Dev).
 */
export function loadWakeWordSettings(): WakeWordConfig {
  const defaults: WakeWordConfig = {
    wakeWord: DEFAULT_WAKE_WORD,
    handsFreeEnabled: false,
    soundFeedback: true,
    autoExecute: true,
  };

  if (typeof window === 'undefined' || !window.localStorage) {
    return defaults;
  }

  try {
    const saved = localStorage.getItem('arone_wake_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        wakeWord: sanitizeWakeWord(parsed.wakeWord || DEFAULT_WAKE_WORD),
        handsFreeEnabled: Boolean(parsed.handsFreeEnabled),
        soundFeedback: parsed.soundFeedback !== false,
        autoExecute: parsed.autoExecute !== false,
      };
    }
  } catch (err) {
    console.warn('Failed to parse saved wake word config:', err);
  }

  return defaults;
}

/**
 * Saves wake-word settings to localStorage.
 */
export function saveWakeWordSettings(config: Partial<WakeWordConfig>): WakeWordConfig {
  const current = loadWakeWordSettings();
  const updated: WakeWordConfig = {
    ...current,
    ...config,
    wakeWord: config.wakeWord ? sanitizeWakeWord(config.wakeWord) : current.wakeWord,
  };

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem('arone_wake_config', JSON.stringify(updated));
    } catch (err) {
      console.warn('Failed to store wake word config:', err);
    }
  }

  return updated;
}

/**
 * Plays a cybernetic JARVIS/ARONE wake-up audio chirp using Web Audio API.
 * High-tech frequency sweep (880Hz -> 1760Hz).
 */
export function playWakeChirp(): void {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Cyber double-beep tone
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1760, now + 0.08);
    osc.frequency.setValueAtTime(1320, now + 0.1);
    osc.frequency.exponentialRampToValueAtTime(2640, now + 0.22);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  } catch {
    // Audio context might be restricted before user gesture
  }
}
