import { useState, useEffect, useRef, useCallback } from 'react';
import {
  DEFAULT_WAKE_WORD,
  detectWakeWord,
  sanitizeWakeWord,
  loadWakeWordSettings,
  saveWakeWordSettings,
  playWakeChirp,
  WakeWordConfig,
} from '../utils/wakeWordDetector';

export interface UseVoiceListenerOptions {
  onCommand: (command: string) => void;
  isSpeaking: boolean;
  onStopSpeaking?: () => void;
}

export function useVoiceListener({
  onCommand,
  isSpeaking,
  onStopSpeaking,
}: UseVoiceListenerOptions) {
  const [config, setConfig] = useState<WakeWordConfig>(() => loadWakeWordSettings());
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [wakeWordDetected, setWakeWordDetected] = useState(false);
  const [activeListeningWindow, setActiveListeningWindow] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const isSpeakingRef = useRef(isSpeaking);
  const configRef = useRef(config);
  const onCommandRef = useRef(onCommand);
  const activeListeningTimeoutRef = useRef<any>(null);
  const manualListeningRef = useRef(false);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  useEffect(() => {
    onCommandRef.current = onCommand;
  }, [onCommand]);

  const startRecognition = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.start();
    } catch (e: any) {
      if (e.name !== 'InvalidStateError') {
        console.warn('SpeechRecognition start notice:', e);
      }
    }
  }, []);

  const stopRecognition = useCallback(() => {
    manualListeningRef.current = false;
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch {}
  }, []);

  // Initialize SpeechRecognition
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage('Speech recognition is not natively supported in this browser environment.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setErrorMessage(null);
    };

    recognition.onresult = (event: any) => {
      // Don't listen to ARONE's own synthesized speech
      if (isSpeakingRef.current) return;

      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      const activeText = (final || interim).trim();
      if (!activeText) return;

      setTranscript(activeText);

      // Check for wake-word if hands-free is enabled
      if (configRef.current.handsFreeEnabled) {
        const detection = detectWakeWord(activeText, configRef.current.wakeWord);

        if (detection.detected) {
          setWakeWordDetected(true);
          if (configRef.current.soundFeedback) {
            playWakeChirp();
          }

          if (detection.command) {
            const cmd = detection.command;
            setTranscript(`Directing: "${cmd}"`);
            onCommandRef.current(cmd);
            setActiveListeningWindow(false);

            setTimeout(() => {
              setWakeWordDetected(false);
              setTranscript('');
            }, 3000);
          } else {
            // Wake word invoked alone (e.g. "ARONE")
            setActiveListeningWindow(true);
            setTranscript(`Wake word verified. Listening for command...`);

            if (activeListeningTimeoutRef.current) {
              clearTimeout(activeListeningTimeoutRef.current);
            }
            activeListeningTimeoutRef.current = setTimeout(() => {
              setActiveListeningWindow(false);
              setWakeWordDetected(false);
              setTranscript('');
            }, 8000);
          }
        } else if (activeListeningWindow && final.trim()) {
          const cmd = final.trim();
          setTranscript(`Directing: "${cmd}"`);
          onCommandRef.current(cmd);
          setActiveListeningWindow(false);
          setWakeWordDetected(false);
          setTimeout(() => setTranscript(''), 2500);
        }
      } else if (manualListeningRef.current && final.trim()) {
        // Push-to-talk mode: send when final transcript is ready
        const cmd = final.trim();
        setTranscript('');
        manualListeningRef.current = false;
        recognition.stop();
        onCommandRef.current(cmd);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('SpeechRecognition event:', event.error);
      if (event.error === 'not-allowed') {
        setErrorMessage('Microphone access blocked. Please grant microphone permissions.');
        setIsListening(false);
        manualListeningRef.current = false;
      } else if (event.error === 'no-speech') {
        // Normal silence timeout
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      // Auto-restart if hands-free is active or user requested manual listening
      if (configRef.current.handsFreeEnabled || manualListeningRef.current) {
        setTimeout(() => {
          if (configRef.current.handsFreeEnabled || manualListeningRef.current) {
            startRecognition();
          }
        }, 300);
      }
    };

    recognitionRef.current = recognition;

    if (config.handsFreeEnabled) {
      startRecognition();
    }

    return () => {
      if (activeListeningTimeoutRef.current) {
        clearTimeout(activeListeningTimeoutRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, [config.handsFreeEnabled, startRecognition]);

  // Push-to-talk toggle
  const toggleListening = useCallback(() => {
    if (isListening) {
      manualListeningRef.current = false;
      stopRecognition();
      setIsListening(false);
      if (transcript.trim() && !configRef.current.handsFreeEnabled) {
        onCommandRef.current(transcript.trim());
        setTranscript('');
      }
    } else {
      if (isSpeakingRef.current && onStopSpeaking) {
        onStopSpeaking();
      }
      setTranscript('');
      setErrorMessage(null);
      manualListeningRef.current = true;
      startRecognition();
    }
  }, [isListening, onStopSpeaking, startRecognition, stopRecognition, transcript]);

  // Set custom wake word
  const updateWakeWord = useCallback((newWord: string) => {
    const sanitized = sanitizeWakeWord(newWord);
    const updated = saveWakeWordSettings({ wakeWord: sanitized });
    setConfig(updated);
    if (updated.soundFeedback) playWakeChirp();
    return sanitized;
  }, []);

  // Set hands-free mode
  const setHandsFree = useCallback((enabled: boolean) => {
    const updated = saveWakeWordSettings({ handsFreeEnabled: enabled });
    setConfig(updated);
    if (enabled) {
      setErrorMessage(null);
      startRecognition();
      if (updated.soundFeedback) playWakeChirp();
    } else {
      manualListeningRef.current = false;
      stopRecognition();
      setIsListening(false);
      setWakeWordDetected(false);
    }
  }, [startRecognition, stopRecognition]);

  // Set audio chirp feedback
  const setSoundFeedback = useCallback((enabled: boolean) => {
    const updated = saveWakeWordSettings({ soundFeedback: enabled });
    setConfig(updated);
    if (enabled) playWakeChirp();
  }, []);

  // Simulate wake-word trigger for testing
  const simulateWakeWord = useCallback((command = 'What is the reactor status?') => {
    if (isSpeakingRef.current && onStopSpeaking) onStopSpeaking();
    setWakeWordDetected(true);
    if (configRef.current.soundFeedback) playWakeChirp();

    setTranscript(`[Triggered] "${configRef.current.wakeWord}, ${command}"`);
    setTimeout(() => {
      onCommandRef.current(command);
      setTimeout(() => {
        setWakeWordDetected(false);
        setTranscript('');
      }, 3000);
    }, 600);
  }, [onStopSpeaking]);

  return {
    config,
    isListening,
    transcript,
    wakeWordDetected,
    errorMessage,
    startListening: () => {
      manualListeningRef.current = true;
      startRecognition();
    },
    stopListening: () => {
      manualListeningRef.current = false;
      stopRecognition();
    },
    toggleListening,
    updateWakeWord,
    setHandsFree,
    setSoundFeedback,
    simulateWakeWord,
  };
}
