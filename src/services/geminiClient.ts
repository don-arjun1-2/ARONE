/**
 * Client service to communicate with ARONE full-stack backend
 */

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  modelUsed?: string;
  mode?: string;
  timestamp: string;
  groundingChunks?: any[];
  audioBase64?: string;
  isAction?: boolean;
  actionDetails?: string;
}

export type AssistantMode =
  | 'general'
  | 'high_thinking'
  | 'low_latency'
  | 'search_grounding'
  | 'maps_grounding';

// Send chat message to backend
export async function sendChatMessage(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  mode: AssistantMode = 'general',
  userLocation?: { latitude: number; longitude: number }
): Promise<{ text: string; model: string; mode: string; groundingChunks?: any[] }> {
  const response = await fetch('/api/gemini/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, mode, userLocation }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(errorData.error || `Server responded with ${response.status}`);
  }

  return response.json();
}

// In-memory TTS Cache to avoid repeating requests for common phrases & save quota
const ttsCache = new Map<string, string>();

// Convert text to speech via gemini-3.8-flash-tts with automatic fallback
export async function generateSpeechTTS(
  text: string
): Promise<{ audioBase64: string | null; mimeType?: string; fallback?: boolean }> {
  const cleanKey = text.trim().toLowerCase().slice(0, 200);
  if (ttsCache.has(cleanKey)) {
    return { audioBase64: ttsCache.get(cleanKey)!, mimeType: 'audio/wav' };
  }

  try {
    const response = await fetch('/api/gemini/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || !data || data.fallback || !data.audioBase64) {
      console.warn('TTS API quota reached or unavailable. Fallback to native browser speech.', data?.notice || '');
      return { audioBase64: null, fallback: true };
    }

    if (data.audioBase64) {
      if (ttsCache.size > 80) {
        const firstKey = ttsCache.keys().next().value;
        if (firstKey) ttsCache.delete(firstKey);
      }
      ttsCache.set(cleanKey, data.audioBase64);
    }

    return { audioBase64: data.audioBase64, mimeType: data.mimeType || 'audio/wav' };
  } catch (err) {
    console.warn('TTS request error, using browser speech fallback:', err);
    return { audioBase64: null, fallback: true };
  }
}

// Analyze image with gemini-4-argon
export async function analyzeImageWithGemini(
  imageBase64: string,
  prompt: string,
  mimeType: string = 'image/jpeg'
): Promise<{ text: string; model: string }> {
  const response = await fetch('/api/gemini/vision', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, prompt, mimeType }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Vision request failed' }));
    throw new Error(errorData.error || `Vision Error: ${response.status}`);
  }

  return response.json();
}

// Audio player helper
let currentAudio: HTMLAudioElement | null = null;

export function playBase64Audio(
  base64Audio: string,
  onEnded?: () => void,
  fallbackText?: string
): HTMLAudioElement {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }

  const audio = new Audio(`data:audio/wav;base64,${base64Audio}`);
  currentAudio = audio;

  let endedCalled = false;
  const safeEnded = () => {
    if (!endedCalled) {
      endedCalled = true;
      if (onEnded) onEnded();
    }
  };

  audio.onended = safeEnded;
  audio.onerror = () => {
    console.warn('Audio playback error encountered');
    if (fallbackText) {
      speakWithBrowserSpeech(fallbackText, safeEnded);
    } else {
      safeEnded();
    }
  };

  audio.play().catch((err) => {
    console.warn('Audio autoplay blocked or failed, using speech synthesis:', err);
    if (fallbackText) {
      speakWithBrowserSpeech(fallbackText, safeEnded);
    } else {
      safeEnded();
    }
  });

  return audio;
}

// Browser Web Speech API fallback for seamless vocalization
export function speakWithBrowserSpeech(text: string, onEnded?: () => void): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    if (onEnded) onEnded();
    return;
  }

  // Chromium bug workaround: ensure synthesis is unpaused
  try {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
    window.speechSynthesis.cancel();
  } catch {}

  // Strip markdown, asterisks, brackets, and emojis for clear vocal delivery
  const cleanSpeech = text
    .replace(/[*_#`[\]()]/g, '')
    .replace(/[^\w\s.,!?'"-]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanSpeech) {
    if (onEnded) onEnded();
    return;
  }

  // Small delay after cancel() ensures Chromium queues the new utterance properly
  setTimeout(() => {
    try {
      const utterance = new SpeechSynthesisUtterance(cleanSpeech.slice(0, 500));
      utterance.rate = 1.02;
      utterance.pitch = 0.95;
      utterance.volume = 1.0;

      let voices = window.speechSynthesis.getVoices();
      const pickVoice = () => {
        return (
          voices.find(
            (v) =>
              v.lang.startsWith('en-GB') ||
              v.name.toLowerCase().includes('daniel') ||
              v.name.toLowerCase().includes('george')
          ) ||
          voices.find(
            (v) =>
              v.lang.startsWith('en') &&
              (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Male'))
          ) ||
          voices.find((v) => v.lang.startsWith('en')) ||
          voices[0]
        );
      };

      const selectedVoice = pickVoice();
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      let ended = false;
      const finish = () => {
        if (!ended) {
          ended = true;
          if (onEnded) onEnded();
        }
      };

      utterance.onend = finish;
      utterance.onerror = (e) => {
        console.warn('SpeechSynthesis error:', e);
        finish();
      };

      // Periodic resume heartbeat for Chromium long utterances
      const resumeInterval = setInterval(() => {
        if (!window.speechSynthesis.speaking) {
          clearInterval(resumeInterval);
        } else if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      }, 5000);

      window.speechSynthesis.speak(utterance);
      window.speechSynthesis.resume();
    } catch (err) {
      console.warn('speakWithBrowserSpeech failure:', err);
      if (onEnded) onEnded();
    }
  }, 40);
}

export function stopAudioPlayback(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }
}
