import React, { useState, useRef, useEffect } from 'react';
import {
  ChatMessage,
  AssistantMode,
  generateSpeechTTS,
  playBase64Audio,
  speakWithBrowserSpeech,
  analyzeImageWithGemini,
} from '../services/geminiClient';
import {
  Send,
  Sparkles,
  Zap,
  Globe,
  MapPin,
  Volume2,
  Image,
  Loader2,
  Trash2,
  ExternalLink,
  Bot,
  User as UserIcon,
} from 'lucide-react';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, mode: AssistantMode) => void;
  onClearHistory: () => void;
  isProcessing: boolean;
  activeMode: AssistantMode;
  setActiveMode: (mode: AssistantMode) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  onClearHistory,
  isProcessing,
  activeMode,
  setActiveMode,
}) => {
  const [inputText, setInputText] = useState('');
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>('image/jpeg');
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatScrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatScrollContainerRef.current) {
      chatScrollContainerRef.current.scrollTop = chatScrollContainerRef.current.scrollHeight;
    }
  }, [messages, isProcessing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !imagePreview) return;

    if (imagePreview) {
      handleAnalyzeUploadedImage();
      return;
    }

    onSendMessage(inputText.trim(), activeMode);
    setInputText('');
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageMime(file.type || 'image/jpeg');
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeUploadedImage = async () => {
    if (!imagePreview) return;
    setIsAnalyzingImage(true);
    const prompt = inputText.trim() || 'Provide a detailed executive analysis and intelligence summary of this visual data.';
    setInputText('');

    try {
      // Analyze with gemini-4-argon
      const result = await analyzeImageWithGemini(imagePreview, prompt, imageMime);
      setImagePreview(null);

      // Append assistant message via parent
      onSendMessage(`[Photo Analysis Request]: ${prompt}`, 'high_thinking');
    } catch (err: any) {
      console.error('Image analysis error:', err);
    } finally {
      setIsAnalyzingImage(false);
      setImagePreview(null);
    }
  };

  const handlePlayTTS = async (msg: ChatMessage) => {
    try {
      setPlayingAudioId(msg.id);
      let audioBase64 = msg.audioBase64;
      if (!audioBase64) {
        const ttsResult = await generateSpeechTTS(msg.content);
        if (ttsResult.audioBase64) {
          audioBase64 = ttsResult.audioBase64;
          msg.audioBase64 = audioBase64;
        }
      }
      if (audioBase64) {
        playBase64Audio(audioBase64, () => {
          setPlayingAudioId(null);
        });
      } else {
        speakWithBrowserSpeech(msg.content, () => {
          setPlayingAudioId(null);
        });
      }
    } catch (err) {
      console.warn('TTS playback issue, using browser speech fallback:', err);
      speakWithBrowserSpeech(msg.content, () => {
        setPlayingAudioId(null);
      });
    }
  };

  const modes: Array<{ id: AssistantMode; label: string; icon: any; desc: string }> = [
    { id: 'general', label: 'Standard Core', icon: Bot, desc: 'gemini-3.8-flash: general intelligence' },
    { id: 'high_thinking', label: 'High Reasoning', icon: Sparkles, desc: 'gemini-4-argon: ThinkingLevel.HIGH' },
    { id: 'low_latency', label: 'Turbo / Low-Latency', icon: Zap, desc: 'gemini-3.1-flash-lite: instant responses' },
    { id: 'search_grounding', label: 'Google Search', icon: Globe, desc: 'gemini-3.8-flash + Google Search grounding' },
    { id: 'maps_grounding', label: 'Google Maps', icon: MapPin, desc: 'gemini-3.8-flash + Google Maps grounding' },
  ];

  return (
    <div className="flex flex-col h-[650px] rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden">
      {/* Top Controls Bar */}
      <div className="p-3.5 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {modes.map((m) => {
            const Icon = m.icon;
            const isSelected = activeMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setActiveMode(m.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-bold shadow-sm shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
                title={m.desc}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={onClearHistory}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 text-xs font-mono flex items-center gap-1 transition-colors"
          title="Clear Conversation Thread"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Clear</span>
        </button>
      </div>

      {/* Scrollable Message Thread */}
      <div ref={chatScrollContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isAssistant = msg.role === 'assistant';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}
            >
              {isAssistant && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-400/50 flex items-center justify-center shrink-0 text-cyan-300 shadow-sm shadow-cyan-500/20">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 text-xs leading-relaxed space-y-2 ${
                  isAssistant
                    ? 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-sm'
                    : 'bg-gradient-to-r from-cyan-950 to-blue-950 border border-cyan-700/50 text-slate-100 rounded-tr-sm ml-auto'
                }`}
              >
                <div className="flex items-center justify-between gap-3 text-[10px] font-mono opacity-60">
                  <span>{isAssistant ? 'ARONE' : 'USER'}</span>
                  <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                </div>

                <div className="font-sans whitespace-pre-wrap">{msg.content}</div>

                {/* Grounding Chunks (Web Search or Google Maps links) */}
                {msg.groundingChunks && msg.groundingChunks.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800 space-y-1.5">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold block">
                      GROUNDING CITATIONS & TELEMETRY:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.groundingChunks.map((chunk: any, i: number) => {
                        const web = chunk.web;
                        const maps = chunk.maps;
                        const uri = web?.uri || maps?.uri;
                        const title = web?.title || maps?.title || `Citation [${i + 1}]`;

                        if (!uri) return null;
                        return (
                          <a
                            key={i}
                            href={uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-slate-950/80 border border-cyan-900 text-cyan-300 hover:text-cyan-100 hover:border-cyan-500 transition-colors"
                          >
                            <span>{title}</span>
                            <ExternalLink className="w-3 h-3 text-cyan-400" />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Footer Controls for Assistant Messages */}
                {isAssistant && (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px] font-mono text-slate-400">
                    <span className="text-cyan-400/80">{msg.modelUsed || 'gemini-3.8-flash'}</span>
                    <button
                      onClick={() => handlePlayTTS(msg)}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-800 text-slate-300 hover:text-cyan-300 transition-colors ${
                        playingAudioId === msg.id ? 'text-cyan-300 animate-pulse' : ''
                      }`}
                      title="Speak response via gemini-3.8-flash-tts"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{playingAudioId === msg.id ? 'Speaking...' : 'Play Audio'}</span>
                    </button>
                  </div>
                )}
              </div>

              {!isAssistant && (
                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-slate-300">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isProcessing && (
          <div className="flex items-center gap-3 text-xs text-cyan-400 font-mono">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
            </div>
            <span>ARONE neural processor synthesizing response...</span>
          </div>
        )}

      </div>

      {/* Image Preview if user selected a photo to analyze */}
      {imagePreview && (
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <img
              src={imagePreview}
              alt="Visual Telemetry Upload"
              className="w-12 h-12 rounded-lg object-cover border border-cyan-500/50"
            />
            <div>
              <span className="text-xs font-mono font-bold text-cyan-300 block">
                Visual Telemetry Loaded for gemini-4-argon Analysis
              </span>
              <span className="text-[11px] text-slate-400">
                Press Send to run high-intelligence multimodal understanding
              </span>
            </div>
          </div>

          <button
            onClick={() => setImagePreview(null)}
            className="text-xs text-slate-400 hover:text-red-400 font-mono"
          >
            ✕ Remove
          </button>
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={handleSubmit}
        className="p-3.5 bg-slate-900/95 border-t border-slate-800 flex items-center gap-2"
      >
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-cyan-300 transition-colors"
          title="Upload image for gemini-4-argon analysis"
        >
          <Image className="w-4 h-4" />
        </button>

        <input
          type="text"
          placeholder={
            activeMode === 'high_thinking'
              ? 'Ask ARONE complex architectural or deep analytical questions (gemini-4-argon)...'
              : activeMode === 'maps_grounding'
              ? 'Ask for locations or places nearby (e.g. Best coffee near me)...'
              : activeMode === 'search_grounding'
              ? 'Query live web and current events (e.g. Latest breaking tech developments)...'
              : 'Instruct ARONE: commands, schedule, smart home, tasks, or inquiries...'
          }
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isProcessing || isAnalyzingImage}
          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={isProcessing || isAnalyzingImage || (!inputText.trim() && !imagePreview)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 text-slate-950 font-bold text-xs shadow-md shadow-cyan-900/30 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Dispatch</span>
        </button>
      </form>
    </div>
  );
};
