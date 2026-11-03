import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArcReactorOrb } from './ArcReactorOrb';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  Sparkles,
  Command,
  Zap,
  Settings,
  Check,
  RotateCcw,
  Volume1,
  Waves,
  ShieldAlert,
  Play,
} from 'lucide-react';
import {
  DEFAULT_WAKE_WORD,
  PRESET_WAKE_WORDS,
  detectWakeWord,
  sanitizeWakeWord,
  loadWakeWordSettings,
  saveWakeWordSettings,
  playWakeChirp,
  WakeWordConfig,
} from '../utils/wakeWordDetector';

interface VoiceAssistantPanelProps {
  onSendMessage: (text: string) => void;
  isThinking: boolean;
  isSpeaking: boolean;
  onStopSpeaking: () => void;
  statusText?: string;
  autoSpeak: boolean;
  setAutoSpeak: (val: boolean) => void;
  initialWakeWord?: string;
  onWakeWordUpdated?: (wakeWord: string) => void;
  // Optional shared voice listener props from App.tsx
  isListening?: boolean;
  transcript?: string;
  wakeWordDetected?: boolean;
  onToggleListening?: () => void;
  wakeConfig?: WakeWordConfig;
  onUpdateWakeWord?: (word: string) => string;
  onSetHandsFree?: (enabled: boolean) => void;
  onSetSoundFeedback?: (enabled: boolean) => void;
  onSimulateWakeWord?: (cmd?: string) => void;
}

export const VoiceAssistantPanel: React.FC<VoiceAssistantPanelProps> = ({
  onSendMessage,
  isThinking,
  isSpeaking,
  onStopSpeaking,
  statusText,
  autoSpeak,
  setAutoSpeak,
  initialWakeWord,
  onWakeWordUpdated,
  isListening: sharedIsListening,
  transcript: sharedTranscript,
  wakeWordDetected: sharedWakeDetected,
  onToggleListening: sharedToggleListening,
  wakeConfig: sharedConfig,
  onUpdateWakeWord: sharedUpdateWakeWord,
  onSetHandsFree: sharedSetHandsFree,
  onSetSoundFeedback: sharedSetSoundFeedback,
  onSimulateWakeWord: sharedSimulateWakeWord,
}) => {
  // Local Wake-word configuration fallback
  const [localConfig, setLocalConfig] = useState<WakeWordConfig>(() => {
    const loaded = loadWakeWordSettings();
    if (initialWakeWord) {
      loaded.wakeWord = sanitizeWakeWord(initialWakeWord);
    }
    return loaded;
  });

  const config = sharedConfig || localConfig;

  const [customInput, setCustomInput] = useState(config.wakeWord);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showConfig, setShowConfig] = useState(true);

  // Voice listening states
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [wakeWordDetected, setWakeWordDetected] = useState(false);
  const [recentDirective, setRecentDirective] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeListeningWindow, setActiveListeningWindow] = useState(false);

  const recognitionRef = useRef<any>(null);
  const isSpeakingRef = useRef(isSpeaking);
  const configRef = useRef(config);
  const activeListeningTimeoutRef = useRef<any>(null);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  // Keep custom input synced if config changed
  useEffect(() => {
    setCustomInput(config.wakeWord);
  }, [config.wakeWord]);

  // Start or restart speech recognition
  const startRecognition = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.start();
    } catch (e: any) {
      // If already started, ignore error
      if (e.name !== 'InvalidStateError') {
        console.warn('Speech recognition start notice:', e);
      }
    }
  }, []);

  const stopRecognition = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch {}
  }, []);

  // Initialize SpeechRecognition if not provided externally
  useEffect(() => {
    if (sharedIsListening !== undefined) return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
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

      if (configRef.current.handsFreeEnabled) {
        const detection = detectWakeWord(activeText, configRef.current.wakeWord);

        if (detection.detected) {
          setWakeWordDetected(true);
          if (configRef.current.soundFeedback) {
            playWakeChirp();
          }

          if (detection.command) {
            const cmd = detection.command;
            setRecentDirective(cmd);
            setTranscript(`Directing: "${cmd}"`);
            onSendMessage(cmd);
            setActiveListeningWindow(false);

            setTimeout(() => {
              setWakeWordDetected(false);
              setTranscript('');
            }, 3000);
          } else {
            setActiveListeningWindow(true);
            setTranscript(`Wake word [${configRef.current.wakeWord}] verified. Listening for command...`);

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
          setRecentDirective(cmd);
          setTranscript(`Directing: "${cmd}"`);
          onSendMessage(cmd);
          setActiveListeningWindow(false);
          setWakeWordDetected(false);
          setTimeout(() => setTranscript(''), 2500);
        }
      } else {
        if (final.trim()) {
          onSendMessage(final.trim());
          setTranscript('');
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error event:', event.error);
      if (event.error === 'not-allowed') {
        setErrorMessage('Microphone access blocked. Please enable microphone permissions in your browser.');
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      if (configRef.current.handsFreeEnabled) {
        setTimeout(() => {
          if (configRef.current.handsFreeEnabled) {
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
  }, [config.handsFreeEnabled, onSendMessage, sharedIsListening, startRecognition]);

  // Handle manual push-to-talk toggle
  const toggleListening = () => {
    if (sharedToggleListening) {
      sharedToggleListening();
      return;
    }
    if (isListening) {
      stopRecognition();
      setIsListening(false);
      if (transcript.trim() && !config.handsFreeEnabled) {
        onSendMessage(transcript.trim());
        setTranscript('');
      }
    } else {
      if (isSpeaking) {
        onStopSpeaking();
      }
      setTranscript('');
      setErrorMessage(null);
      startRecognition();
    }
  };

  // Effective values
  const effectiveIsListening = sharedIsListening !== undefined ? sharedIsListening : isListening;
  const effectiveTranscript = sharedTranscript !== undefined ? sharedTranscript : transcript;
  const effectiveWakeDetected = sharedWakeDetected !== undefined ? sharedWakeDetected : wakeWordDetected;

  // Save custom wake-word
  const handleSaveWakeWord = (newWord: string) => {
    let sanitized = sanitizeWakeWord(newWord);
    if (sharedUpdateWakeWord) {
      sanitized = sharedUpdateWakeWord(sanitized);
    } else {
      const updated = saveWakeWordSettings({ wakeWord: sanitized });
      setLocalConfig(updated);
      if (updated.soundFeedback) playWakeChirp();
    }
    setCustomInput(sanitized);
    setSaveSuccess(true);
    if (onWakeWordUpdated) {
      onWakeWordUpdated(sanitized);
    }
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Toggle hands-free listening
  const handleToggleHandsFree = (enabled: boolean) => {
    if (sharedSetHandsFree) {
      sharedSetHandsFree(enabled);
      return;
    }
    const updated = saveWakeWordSettings({ handsFreeEnabled: enabled });
    setLocalConfig(updated);
    if (enabled) {
      setErrorMessage(null);
      startRecognition();
      if (updated.soundFeedback) playWakeChirp();
    } else {
      stopRecognition();
      setIsListening(false);
      setWakeWordDetected(false);
    }
  };

  // Toggle audio chime feedback
  const handleToggleSoundFeedback = (enabled: boolean) => {
    if (sharedSetSoundFeedback) {
      sharedSetSoundFeedback(enabled);
      return;
    }
    const updated = saveWakeWordSettings({ soundFeedback: enabled });
    setLocalConfig(updated);
    if (enabled) playWakeChirp();
  };

  // Test wake word trigger
  const handleSimulateWakeWord = (testCommand = 'What is the reactor status?') => {
    if (sharedSimulateWakeWord) {
      sharedSimulateWakeWord(testCommand);
      return;
    }
    if (isSpeaking) onStopSpeaking();
    setWakeWordDetected(true);
    if (config.soundFeedback) playWakeChirp();

    setTranscript(`[Simulated] "${config.wakeWord}, ${testCommand}"`);
    setTimeout(() => {
      setRecentDirective(testCommand);
      onSendMessage(testCommand);
      setTimeout(() => {
        setWakeWordDetected(false);
        setTranscript('');
      }, 3000);
    }, 600);
  };

  const handleQuickCommand = (cmd: string) => {
    if (isSpeaking) onStopSpeaking();
    onSendMessage(cmd);
  };

  return (
    <div className="relative p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-slate-900/95 via-slate-950/98 to-slate-950 border border-cyan-800/40 shadow-2xl overflow-hidden text-center backdrop-blur-md">
      {/* Background Matrix Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#00e5ff_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      {/* Holographic Arc Reactor Orb with Dynamic Visual States */}
      <div className="relative z-10 flex flex-col items-center">
        <ArcReactorOrb
          isListening={effectiveIsListening || effectiveWakeDetected}
          isThinking={isThinking}
          isSpeaking={isSpeaking}
          onClick={toggleListening}
          statusText={
            effectiveWakeDetected
              ? `WAKE-WORD "${config.wakeWord}" RECOGNIZED`
              : effectiveIsListening
              ? config.handsFreeEnabled
                ? effectiveTranscript || `Listening for wake-word "${config.wakeWord}"...`
                : effectiveTranscript || 'Listening to your voice...'
              : isSpeaking
              ? 'ARONE Spoken Feedback Active'
              : isThinking
              ? 'Synthesizing Neural Directives...'
              : statusText || 'Neural Core Standby'
          }
        />

        {/* Wake-Word Recognition Status Ribbon */}
        <div className="mt-2 flex items-center justify-center gap-2">
          {effectiveWakeDetected ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/90 border border-cyan-400 text-cyan-200 text-xs font-mono font-bold animate-pulse shadow-[0_0_12px_#00f0ff]">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-spin" />
              <span>WAKE-WORD RECOGNIZED // DIRECTIVE DISPATCHED</span>
            </div>
          ) : config.handsFreeEnabled ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>AUDIO RADAR ARMED // SAY "{config.wakeWord}"</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-slate-400 text-xs font-mono">
              <Radio className="w-3 h-3 text-cyan-400" />
              <span>PUSH-TO-TALK MODE</span>
            </div>
          )}
        </div>

        {/* Browser warning if mic error or unsupported */}
        {errorMessage && (
          <div className="mt-2 p-2 rounded-lg bg-red-950/80 border border-red-800 text-red-200 text-xs font-mono flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Primary Voice Action Buttons */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5 z-10 relative">
        <button
          onClick={toggleListening}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-mono font-bold tracking-wider transition-all duration-300 cursor-pointer shadow-lg ${
            effectiveIsListening
              ? 'bg-rose-500 text-slate-950 shadow-rose-500/50 scale-105 animate-pulse'
              : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-cyan-500/30 hover:scale-105'
          }`}
        >
          {effectiveIsListening ? (
            <>
              <MicOff className="w-4 h-4" />
              <span>TERMINATE LISTENING</span>
            </>
          ) : (
            <>
              <Mic className="w-4 h-4" />
              <span>{config.handsFreeEnabled ? 'VOICE RADAR ACTIVE' : 'SPEAK TO ARONE'}</span>
            </>
          )}
        </button>

        <button
          onClick={() => setAutoSpeak(!autoSpeak)}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-full text-xs font-mono border transition-all ${
            autoSpeak
              ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300 shadow-[0_0_8px_rgba(0,240,255,0.2)]'
              : 'bg-slate-900 border-slate-800 text-slate-500'
          }`}
          title="Toggle TTS audio feedback"
        >
          {autoSpeak ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
          <span>{autoSpeak ? 'TTS ON' : 'TTS MUTED'}</span>
        </button>

        {isSpeaking && (
          <button
            onClick={onStopSpeaking}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-mono bg-red-950/80 border border-red-800 text-red-300 hover:bg-red-900 transition-colors"
          >
            Stop Audio
          </button>
        )}
      </div>

      {/* ============================================================== */}
      {/* WAKE-WORD CONFIGURATION SETTINGS PANEL (User Request)          */}
      {/* ============================================================== */}
      <div className="mt-5 pt-4 border-t border-cyan-900/40 text-left relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono font-bold text-cyan-200 tracking-wider">
              VOICE ACTIVATION & WAKE-WORD CONFIGURATION
            </span>
          </div>
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="text-[11px] font-mono text-cyan-400/80 hover:text-cyan-300 underline"
          >
            {showConfig ? 'Collapse Settings' : 'Expand Settings'}
          </button>
        </div>

        {showConfig && (
          <div className="space-y-4 p-4 rounded-2xl bg-slate-950/90 border border-cyan-800/50 shadow-inner">
            {/* Active Wake Word Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-700/40">
              <div>
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                  Current Trigger Wake-Word
                </div>
                <div className="text-sm font-mono font-bold text-cyan-300 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-400 text-cyan-100 shadow-[0_0_8px_rgba(0,240,255,0.4)]">
                    "{config.wakeWord}"
                  </span>
                  <span className="text-[11px] text-cyan-400/70 font-normal">
                    (Case-insensitive, supports "Hey {config.wakeWord}")
                  </span>
                </div>
              </div>

              {/* Hands-Free Toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleHandsFree(!config.handsFreeEnabled)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border ${
                    config.handsFreeEnabled
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.3)]'
                      : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <Waves className="w-3.5 h-3.5" />
                  <span>{config.handsFreeEnabled ? 'HANDS-FREE ON' : 'HANDS-FREE OFF'}</span>
                </button>
              </div>
            </div>

            {/* Custom Wake Word Input */}
            <div>
              <label className="block text-[11px] font-mono text-slate-300 mb-1.5">
                Set Custom Wake-Word Directive:
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value.toUpperCase())}
                    placeholder="e.g. ARONE, JARVIS, TITAN..."
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-cyan-700/60 text-cyan-100 font-mono text-xs focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_12px_rgba(0,240,255,0.3)] tracking-wider"
                    maxLength={20}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleSaveWakeWord(customInput)}
                  className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold tracking-wider flex items-center gap-1 transition-all shadow-[0_0_10px_rgba(0,240,255,0.4)]"
                >
                  {saveSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>SAVED</span>
                    </>
                  ) : (
                    <span>APPLY</span>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Presets Selection */}
            <div>
              <div className="text-[10px] font-mono text-slate-400 mb-1.5">
                Quick Preset Directives:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_WAKE_WORDS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleSaveWakeWord(preset)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all border ${
                      config.wakeWord === preset
                        ? 'bg-cyan-500/30 text-cyan-200 border-cyan-400 font-bold shadow-[0_0_8px_rgba(0,240,255,0.3)]'
                        : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:border-cyan-600 hover:text-cyan-300'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Audio Chirp & Simulation Tools */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => handleToggleSoundFeedback(!config.soundFeedback)}
                className={`flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-lg border transition-all ${
                  config.soundFeedback
                    ? 'bg-cyan-950/40 border-cyan-600 text-cyan-300'
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
              >
                <Volume1 className="w-3 h-3" />
                <span>Wake Sound: {config.soundFeedback ? 'Chirp Enabled' : 'Muted'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleSimulateWakeWord('What is the reactor status?')}
                className="flex items-center gap-1.5 text-[11px] font-mono px-3 py-1 rounded-lg bg-blue-950/70 border border-blue-600 text-blue-200 hover:bg-blue-900 hover:text-white transition-all shadow-sm"
                title="Test wake-word activation without microphone"
              >
                <Play className="w-3 h-3 text-cyan-300" />
                <span>Test "{config.wakeWord}" Trigger</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Voice Directives */}
      <div className="mt-5 pt-4 border-t border-slate-800/80">
        <div className="flex items-center justify-center gap-1.5 text-xs font-mono text-slate-400 mb-2.5">
          <Command className="w-3.5 h-3.5 text-cyan-400" />
          <span>EXECUTIVE VOICE DIRECTIVES</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {[
            `${config.wakeWord}, turn on living room lights`,
            `${config.wakeWord}, set temperature to 72 degrees`,
            `${config.wakeWord}, schedule meeting with Board tomorrow at 2 PM`,
            `${config.wakeWord}, add task to review security architecture`,
            `${config.wakeWord}, draft email to team regarding Q4 results`,
            `${config.wakeWord}, find coffee shops near me`,
          ].map((cmd) => (
            <button
              key={cmd}
              onClick={() => handleQuickCommand(cmd)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800/80 hover:border-cyan-500/50 hover:bg-slate-800/80 text-[11px] font-mono text-slate-300 hover:text-cyan-200 transition-all cursor-pointer"
            >
              "{cmd}"
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
