import React, { useState, useEffect, useRef } from 'react';
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
} from 'lucide-react';

interface VoiceAssistantPanelProps {
  onSendMessage: (text: string) => void;
  isThinking: boolean;
  isSpeaking: boolean;
  onStopSpeaking: () => void;
  statusText?: string;
  autoSpeak: boolean;
  setAutoSpeak: (val: boolean) => void;
}

export const VoiceAssistantPanel: React.FC<VoiceAssistantPanelProps> = ({
  onSendMessage,
  isThinking,
  isSpeaking,
  onStopSpeaking,
  statusText,
  autoSpeak,
  setAutoSpeak,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [liveStreamActive, setLiveStreamActive] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Initialize SpeechRecognition if supported
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const text = event.results[current][0].transcript;
        setTranscript(text);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      if (transcript.trim()) {
        onSendMessage(transcript.trim());
        setTranscript('');
      }
    } else {
      if (isSpeaking) {
        onStopSpeaking();
      }
      setTranscript('');
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (err) {
          console.warn('Speech start error:', err);
        }
      } else {
        alert('Speech recognition is not natively supported in this browser. Please use keyboard input or enable microphone permissions.');
      }
    }
  };

  const handleQuickCommand = (cmd: string) => {
    if (isSpeaking) onStopSpeaking();
    onSendMessage(cmd);
  };

  return (
    <div className="relative p-6 rounded-3xl bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-slate-950 border border-cyan-800/40 shadow-2xl overflow-hidden text-center">
      {/* Background Matrix Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#00e5ff_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      {/* Holographic Arc Reactor Orb */}
      <ArcReactorOrb
        isListening={isListening}
        isThinking={isThinking}
        isSpeaking={isSpeaking}
        onClick={toggleListening}
        statusText={
          isListening
            ? transcript || 'Listening to your voice...'
            : isSpeaking
            ? 'ARONE Spoken Feedback Active'
            : isThinking
            ? 'Synthesizing Neural Directives...'
            : statusText
        }
      />

      {/* Primary Voice Actions */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={toggleListening}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-mono font-bold tracking-wider transition-all duration-300 cursor-pointer shadow-lg ${
            isListening
              ? 'bg-rose-500 text-slate-950 shadow-rose-500/50 scale-105 animate-pulse'
              : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-cyan-500/30 hover:scale-105'
          }`}
        >
          {isListening ? (
            <>
              <MicOff className="w-4 h-4" />
              <span>TERMINATE LISTENING</span>
            </>
          ) : (
            <>
              <Mic className="w-4 h-4" />
              <span>SPEAK TO ARONE</span>
            </>
          )}
        </button>

        <button
          onClick={() => setAutoSpeak(!autoSpeak)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-mono border transition-all ${
            autoSpeak
              ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300'
              : 'bg-slate-900 border-slate-800 text-slate-500'
          }`}
          title="Auto-speak response via gemini-3.8-flash-tts"
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

      {/* Quick Voice Directives */}
      <div className="mt-6 pt-5 border-t border-slate-800/80">
        <div className="flex items-center justify-center gap-1.5 text-xs font-mono text-slate-400 mb-3">
          <Command className="w-3.5 h-3.5 text-cyan-400" />
          <span>EXECUTIVE VOICE DIRECTIVES</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {[
            'Turn on living room lights',
            'Set temperature to 72 degrees',
            'Schedule meeting with Board tomorrow at 2 PM',
            'Add task to review security architecture',
            'Draft email to team regarding Q4 results',
            'Find coffee shops near me',
            'What is the latest quantum computing news?',
          ].map((cmd) => (
            <button
              key={cmd}
              onClick={() => handleQuickCommand(cmd)}
              className="px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800/80 hover:border-cyan-500/50 hover:bg-slate-800/80 text-[11px] font-mono text-slate-300 hover:text-cyan-200 transition-all cursor-pointer"
            >
              "{cmd}"
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
