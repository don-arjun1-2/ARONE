import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Sparkles, Volume2, Radio, Shield, Terminal, Zap } from 'lucide-react';
import { ArcReactorCore } from './ArcReactorCore';

interface JarvisHoloGlobeProps {
  isSpeaking: boolean;
  isProcessing: boolean;
  onSendMessage: (text: string) => void;
  onStartListening?: () => void;
  onStopListening?: () => void;
  isListening?: boolean;
  activeScene?: string;
  onOpenModule?: (moduleId: string) => void;
}

export const JarvisHoloGlobe: React.FC<JarvisHoloGlobeProps> = ({
  isSpeaking,
  isProcessing,
  onSendMessage,
  onStartListening,
  onStopListening,
  isListening = false,
  activeScene = 'Home Protocol',
  onOpenModule,
}) => {
  const [inputText, setInputText] = useState('');
  const [centerView, setCenterView] = useState<'reactor' | 'globe'>('reactor');
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => (t + 1) % 360);
    }, 50);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const quickPrompts = [
    { label: 'Turn on office lights', module: 'home' },
    { label: 'Schedule board meeting tomorrow 10am', module: 'meetings' },
    { label: 'Draft executive update email', module: 'emails' },
    { label: 'Sync executive Google Tasks', module: 'tasks' },
  ];

  return (
    <div className="relative w-full flex flex-col items-center justify-center py-2 px-2 select-none overflow-hidden">
      {/* Background Cyber Ambient Radiance */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[420px] h-[420px] rounded-full bg-cyan-500/10 blur-3xl animate-pulse-glow" />
        <div className="w-[260px] h-[260px] rounded-full bg-blue-600/15 blur-2xl" />
      </div>

      {/* Center Hologram HUD Selector Tabs */}
      <div className="flex items-center gap-2 mb-2 z-20">
        <button
          type="button"
          onClick={() => setCenterView('reactor')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider transition-all border ${
            centerView === 'reactor'
              ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.4)]'
              : 'bg-slate-950/60 text-slate-400 border-slate-700/60 hover:text-cyan-300 hover:border-cyan-500/50'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span>Arc Reactor Core</span>
        </button>
        <button
          type="button"
          onClick={() => setCenterView('globe')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider transition-all border ${
            centerView === 'globe'
              ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.4)]'
              : 'bg-slate-950/60 text-slate-400 border-slate-700/60 hover:text-cyan-300 hover:border-cyan-500/50'
          }`}
        >
          <Radio className="w-3.5 h-3.5 text-cyan-400" />
          <span>Planetary Globe</span>
        </button>
      </div>

      {/* Main Hologram / Reactor Stage */}
      {centerView === 'reactor' ? (
        <div className="relative w-full max-w-[540px] flex items-center justify-center py-4">
          <ArcReactorCore
            isListening={isListening}
            isThinking={isProcessing}
            isSpeaking={isSpeaking}
            onClick={() => {
              if (onStartListening && !isListening) {
                onStartListening();
              } else if (onOpenModule) {
                onOpenModule('assistant');
              }
            }}
            size="lg"
            showSurroundArmor={true}
            interactive={true}
            statusText={
              isSpeaking
                ? 'ARONE Vocalizing // Power Output: 3.8 GJ/s'
                : isProcessing
                ? 'Synthesizing Directives // 4.2 TFLOPs'
                : isListening
                ? 'Microphone Active // Listening...'
                : 'Mark II Arc Reactor // Core Online'
            }
          />
        </div>
      ) : (
        /* Hologram Stage Container with 3D Globe */
        <div className="relative w-full max-w-[540px] aspect-square flex items-center justify-center">
          {/* SVG Hologram Artwork */}
          <svg
            viewBox="0 0 500 500"
            className="w-full h-full drop-shadow-[0_0_25px_rgba(0,240,255,0.4)]"
          >
          <defs>
            {/* Hologram gradients */}
            <radialGradient id="globeAtmosphere" cx="50%" cy="50%" r="50%">
              <stop offset="60%" stopColor="#020e26" stopOpacity="0.2" />
              <stop offset="85%" stopColor="#0052a3" stopOpacity="0.6" />
              <stop offset="97%" stopColor="#00f0ff" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#00f0ff" stopOpacity="1" />
            </radialGradient>

            <linearGradient id="beamGrad" x1="50%" y1="100%" x2="50%" y2="0%">
              <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.8" />
              <stop offset="40%" stopColor="#0088ff" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#00f0ff" stopOpacity="0.02" />
            </linearGradient>

            <linearGradient id="scanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#00f0ff" stopOpacity="0" />
            </linearGradient>

            <pattern id="gridPattern" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#00f0ff" strokeWidth="0.5" strokeOpacity="0.15" />
            </pattern>
          </defs>

          {/* Hologram Projection Pedestal Beam (Bottom upward cone) */}
          <polygon
            points="180,480 320,480 380,310 120,310"
            fill="url(#beamGrad)"
            className="animate-beam"
          />

          {/* Projection Pedestal Rings (Base platform) */}
          <g transform="translate(250, 470)">
            <ellipse cx="0" cy="0" rx="140" ry="24" fill="#020d20" stroke="#00f0ff" strokeWidth="1.5" strokeOpacity="0.7" />
            <ellipse cx="0" cy="0" rx="115" ry="18" fill="none" stroke="#0088ff" strokeWidth="1" strokeDasharray="6 4" strokeOpacity="0.8" />
            <ellipse cx="0" cy="0" rx="85" ry="12" fill="#003366" fillOpacity="0.4" stroke="#00f0ff" strokeWidth="2" />
            <ellipse cx="0" cy="0" rx="40" ry="6" fill="#00f0ff" fillOpacity="0.8" className="animate-pulse" />
            
            {/* Red Accent LEDs on Pedestal */}
            <circle cx="-120" cy="0" r="3" fill="#ff2a4b" className="drop-shadow-[0_0_6px_#ff2a4b]" />
            <circle cx="120" cy="0" r="3" fill="#ff2a4b" className="drop-shadow-[0_0_6px_#ff2a4b]" />
            <circle cx="-70" cy="8" r="2" fill="#00f0ff" />
            <circle cx="70" cy="8" r="2" fill="#00f0ff" />
          </g>

          {/* Concentric Outer Telemetry HUD Ring 1 (Tick Marks) */}
          <g transform={`rotate(${tick * 0.2}, 250, 230)`}>
            <circle
              cx="250"
              cy="230"
              r="195"
              fill="none"
              stroke="#00f0ff"
              strokeWidth="1"
              strokeOpacity="0.3"
              strokeDasharray="4 8"
            />
          </g>

          {/* Segmented Ring 2 with Solid Arches and Cyan Accent Points */}
          <g transform={`rotate(${-tick * 0.4}, 250, 230)`}>
            <circle
              cx="250"
              cy="230"
              r="180"
              fill="none"
              stroke="#0088ff"
              strokeWidth="2.5"
              strokeDasharray="30 25 70 25 15 25"
              strokeOpacity="0.85"
            />
            <circle
              cx="250"
              cy="230"
              r="170"
              fill="none"
              stroke="#00f0ff"
              strokeWidth="0.8"
              strokeDasharray="2 6"
              strokeOpacity="0.6"
            />
            {/* HUD Segment Markers */}
            <rect x="248" y="45" width="4" height="12" fill="#00f0ff" />
            <rect x="248" y="403" width="4" height="12" fill="#00f0ff" />
            <rect x="65" y="228" width="12" height="4" fill="#00f0ff" />
            <rect x="423" y="228" width="12" height="4" fill="#00f0ff" />
          </g>

          {/* Telemetry Numbers & Labels around Outer Ring */}
          <g fill="#00f0ff" fontSize="7" fontFamily="monospace" opacity="0.65" textAnchor="middle">
            <text x="250" y="38">00° N</text>
            <text x="445" y="233">90° E</text>
            <text x="250" y="435">180° S</text>
            <text x="55" y="233">270° W</text>
          </g>

          {/* Tilted 3D Orbital Rings (Iron Man Gyro Rings) */}
          <g transform="translate(250, 230)">
            {/* Tilted Ring 1 */}
            <ellipse
              cx="0"
              cy="0"
              rx="185"
              ry="55"
              transform="rotate(-28)"
              fill="none"
              stroke="#00f0ff"
              strokeWidth="1.8"
              strokeOpacity="0.9"
              strokeDasharray="140 30 80 40"
              className="drop-shadow-[0_0_8px_#00f0ff]"
            />
            {/* Satellite Node on Ring 1 */}
            <g transform={`rotate(${-28})`}>
              <circle
                cx={Math.cos((tick * Math.PI) / 60) * 185}
                cy={Math.sin((tick * Math.PI) / 60) * 55}
                r="3.5"
                fill="#ffffff"
                stroke="#00f0ff"
                strokeWidth="2"
                className="drop-shadow-[0_0_8px_#00f0ff]"
              />
            </g>

            {/* Tilted Ring 2 (Opposite Angle) */}
            <ellipse
              cx="0"
              cy="0"
              rx="175"
              ry="50"
              transform="rotate(32)"
              fill="none"
              stroke="#00a2ff"
              strokeWidth="1.4"
              strokeOpacity="0.8"
              strokeDasharray="90 35 120 20"
            />
            {/* Satellite Node on Ring 2 */}
            <g transform={`rotate(32)`}>
              <circle
                cx={Math.cos(((tick + 90) * Math.PI) / 70) * 175}
                cy={Math.sin(((tick + 90) * Math.PI) / 70) * 50}
                r="3"
                fill="#00f0ff"
                className="drop-shadow-[0_0_6px_#00f0ff]"
              />
            </g>

            {/* Horizontal Equator Ring */}
            <ellipse
              cx="0"
              cy="0"
              rx="160"
              ry="38"
              fill="none"
              stroke="#00f0ff"
              strokeWidth="1"
              strokeOpacity="0.5"
              strokeDasharray="4 8"
            />
          </g>

          {/* EARTH GLOBE CORE (120px radius sphere) */}
          <g transform="translate(250, 230)">
            {/* Dark Deep Space Core for high contrast */}
            <circle cx="0" cy="0" r="120" fill="#020b1e" stroke="#00f0ff" strokeWidth="2" className="drop-shadow-[0_0_20px_#00f0ff]" />

            {/* Atmosphere Halo */}
            <circle cx="0" cy="0" r="120" fill="url(#globeAtmosphere)" />

            {/* Earth Wireframe Latitude Lines */}
            <ellipse cx="0" cy="0" rx="120" ry="120" fill="none" stroke="#00f0ff" strokeWidth="1.5" strokeOpacity="0.8" />
            <ellipse cx="0" cy="-60" rx="104" ry="24" fill="none" stroke="#0088ff" strokeWidth="0.8" strokeOpacity="0.5" />
            <ellipse cx="0" cy="-30" rx="116" ry="28" fill="none" stroke="#0088ff" strokeWidth="0.8" strokeOpacity="0.5" />
            <ellipse cx="0" cy="0" rx="120" ry="32" fill="none" stroke="#00f0ff" strokeWidth="1" strokeOpacity="0.6" strokeDasharray="3 3" />
            <ellipse cx="0" cy="30" rx="116" ry="28" fill="none" stroke="#0088ff" strokeWidth="0.8" strokeOpacity="0.5" />
            <ellipse cx="0" cy="60" rx="104" ry="24" fill="none" stroke="#0088ff" strokeWidth="0.8" strokeOpacity="0.5" />

            {/* Earth Wireframe Longitude Lines */}
            <ellipse cx="0" cy="0" rx="40" ry="120" fill="none" stroke="#0088ff" strokeWidth="0.8" strokeOpacity="0.5" />
            <ellipse cx="0" cy="0" rx="80" ry="120" fill="none" stroke="#0088ff" strokeWidth="0.8" strokeOpacity="0.5" />
            <line x1="0" y1="-120" x2="0" y2="120" stroke="#00f0ff" strokeWidth="1" strokeOpacity="0.7" strokeDasharray="4 4" />

            {/* Continents & City Lights Silhouette (Holographic Map) */}
            <g opacity="0.9" fill="#00d8ff" fillOpacity="0.25" stroke="#00f0ff" strokeWidth="1">
              {/* Eurasia / India / Asia */}
              <path d="M -15,-45 Q 10,-55 35,-40 Q 55,-35 65,-10 Q 50,5 30,-5 Q 15,15 0,25 Q -10,35 -20,20 Q -10,5 -25,-10 Z" />
              {/* Africa */}
              <path d="M -45,-15 Q -25,-10 -20,10 Q -25,45 -45,55 Q -60,35 -65,10 Q -60,-15 -45,-15 Z" />
              {/* Europe */}
              <path d="M -40,-50 Q -20,-60 -5,-50 Q -15,-30 -35,-35 Z" />
              {/* Americas silhouette */}
              <path d="M -95,-60 Q -80,-40 -85,-10 Q -90,20 -75,45 Q -85,55 -95,30 Q -105,-10 -95,-60 Z" />
              {/* Australia */}
              <path d="M 60,35 Q 85,30 90,50 Q 75,65 60,55 Z" />
            </g>

            {/* City Night Lights Constellation Glow (Glowing gold & cyan dots) */}
            <g fill="#ffea79" className="drop-shadow-[0_0_4px_#ffea79]">
              <circle cx="2" cy="18" r="1.5" />
              <circle cx="10" cy="12" r="1.5" />
              <circle cx="-12" cy="-35" r="1.5" />
              <circle cx="-30" cy="-38" r="1.5" />
              <circle cx="45" cy="-20" r="1.5" />
              <circle cx="55" cy="-15" r="1.5" />
              <circle cx="-85" cy="-40" r="1.5" />
              <circle cx="-80" cy="-25" r="1.5" />
            </g>

            {/* Radar Scanning Line */}
            <g transform={`rotate(${tick * 1.5})`}>
              <line x1="0" y1="0" x2="0" y2="-120" stroke="#00f0ff" strokeWidth="1.8" strokeOpacity="0.9" />
              <polygon points="0,0 -20,-115 0,-120" fill="url(#scanGrad)" />
            </g>

            {/* Center Core Target Reticle */}
            <circle cx="0" cy="0" r="16" fill="none" stroke="#00f0ff" strokeWidth="1.5" />
            <circle cx="0" cy="0" r="5" fill="#00f0ff" className={isSpeaking ? 'animate-ping' : ''} />
            <line x1="-24" y1="0" x2="-8" y2="0" stroke="#00f0ff" strokeWidth="1.5" />
            <line x1="8" y1="0" x2="24" y2="0" stroke="#00f0ff" strokeWidth="1.5" />
            <line x1="0" y1="-24" x2="0" y2="-8" stroke="#00f0ff" strokeWidth="1.5" />
            <line x1="0" y1="8" x2="0" y2="24" stroke="#00f0ff" strokeWidth="1.5" />
          </g>

          {/* Futuristic HUD Chevron brackets */}
          <g fill="#00f0ff" opacity="0.75">
            <path d="M 330 355 L 340 355 L 345 360 L 340 365 L 330 365 L 335 360 Z" />
            <path d="M 345 355 L 355 355 L 360 360 L 355 365 L 345 365 L 350 360 Z" />
            <path d="M 360 355 L 370 355 L 375 360 L 370 365 L 360 365 L 365 360 Z" />
          </g>

          {/* Crosshairs & Alignment Marks */}
          <line x1="250" y1="10" x2="250" y2="30" stroke="#00f0ff" strokeWidth="2" />
          <line x1="250" y1="450" x2="250" y2="470" stroke="#00f0ff" strokeWidth="2" />
          <line x1="10" y1="230" x2="30" y2="230" stroke="#00f0ff" strokeWidth="2" />
          <line x1="470" y1="230" x2="490" y2="230" stroke="#00f0ff" strokeWidth="2" />
        </svg>

        {/* Live Audio / Speaking Waveform Indicator over Globe Core */}
        {isSpeaking && (
          <div className="absolute top-[42%] flex items-center gap-1 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-400 shadow-[0_0_15px_#00f0ff] backdrop-blur-sm z-10 animate-pulse">
            <Volume2 className="w-4 h-4 text-cyan-300 animate-bounce" />
            <span className="text-[10px] font-mono tracking-widest text-cyan-200 uppercase font-bold">
              ARONE VOCALIZING
            </span>
          </div>
        )}

        {isProcessing && (
          <div className="absolute top-[42%] flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/80 border border-cyan-400 shadow-[0_0_15px_#00f0ff] backdrop-blur-sm z-10">
            <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-spin" />
            <span className="text-[10px] font-mono tracking-widest text-cyan-200 uppercase font-bold">
              NEURAL PROCESSING...
            </span>
          </div>
        )}
      </div>
      )}

      {/* Hologram Base Interactive Control Deck */}
      <div className="w-full max-w-lg mt-[-10px] z-20 space-y-3">
        {/* Voice Directive & Command Input Bar */}
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <div className="relative flex-1 flex items-center bg-slate-950/80 border border-cyan-500/50 rounded-xl px-3 py-1.5 backdrop-blur-md shadow-[0_0_15px_rgba(0,240,255,0.2)] focus-within:border-cyan-400 focus-within:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all">
            <Terminal className="w-4 h-4 text-cyan-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Speak or transmit command to ARONE..."
              className="w-full bg-transparent text-sm text-cyan-100 placeholder-cyan-500/50 focus:outline-none font-mono"
            />
            {inputText.trim() && (
              <button
                type="submit"
                className="p-1 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/40 hover:text-cyan-100 transition-all ml-1"
                title="Send Command"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Dedicated Mic Trigger */}
          {onStartListening && (
            <button
              type="button"
              onClick={isListening ? onStopListening : onStartListening}
              className={`ml-2 p-2.5 rounded-xl border flex items-center justify-center transition-all ${
                isListening
                  ? 'bg-red-950/70 border-red-500 text-red-400 shadow-[0_0_15px_#ff2a4b] animate-pulse'
                  : 'bg-slate-950/80 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
              }`}
              title={isListening ? 'Stop Listening' : 'Push-to-Talk with ARONE'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}
        </form>

        {/* Quick Directive Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                onSendMessage(p.label);
                if (onOpenModule) onOpenModule(p.module);
              }}
              className="text-[11px] font-mono px-3 py-1.5 rounded-lg bg-[#03132e]/90 border border-cyan-500/50 text-cyan-200 hover:bg-cyan-900/80 hover:border-cyan-300 hover:text-white transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,240,255,0.2)]"
            >
              <span className="text-cyan-400 font-bold">›</span>
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
