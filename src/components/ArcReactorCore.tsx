import React, { useState, useEffect } from 'react';
import { Sparkles, Zap, Radio, Volume2, Mic } from 'lucide-react';

interface ArcReactorCoreProps {
  isListening?: boolean;
  isThinking?: boolean;
  isSpeaking?: boolean;
  onClick?: () => void;
  statusText?: string;
  size?: 'sm' | 'md' | 'lg';
  showSurroundArmor?: boolean;
  interactive?: boolean;
}

export const ArcReactorCore: React.FC<ArcReactorCoreProps> = ({
  isListening = false,
  isThinking = false,
  isSpeaking = false,
  onClick,
  statusText,
  size = 'lg',
  showSurroundArmor = true,
  interactive = true,
}) => {
  const [pulseTick, setPulseTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseTick((t) => (t + 1) % 360);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  // 10 Segments (Coil modules at 36-degree intervals: 360 / 10 = 36)
  const coilSegments = Array.from({ length: 10 }, (_, i) => i * 36);

  // 40 fine cooling notches for the inner cog ring
  const innerTeeth = Array.from({ length: 40 }, (_, i) => i * 9);

  // Dimension scaling
  const dimensions = {
    sm: { container: 'w-48 h-48', svgSize: 240, textScale: 'text-[9px]' },
    md: { container: 'w-64 h-64 md:w-72 md:h-72', svgSize: 340, textScale: 'text-[10px]' },
    lg: { container: 'w-80 h-80 sm:w-96 sm:h-96 md:w-[440px] md:h-[440px]', svgSize: 460, textScale: 'text-xs' },
  }[size];

  // Dynamic Glow and Color shifts based on operational state
  const coreGlowColor = isListening
    ? '#ff3366'
    : isThinking
    ? '#ffb300'
    : isSpeaking
    ? '#00ffff'
    : '#00e5ff';

  const secondaryColor = isListening
    ? '#ff1744'
    : isThinking
    ? '#ff9100'
    : isSpeaking
    ? '#2979ff'
    : '#0091ea';

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      {/* Outer Atmospheric Photonic Bloom */}
      <div
        className={`absolute rounded-full transition-all duration-700 pointer-events-none blur-3xl ${
          isSpeaking
            ? 'w-[380px] h-[380px] bg-cyan-400/30 scale-125 animate-pulse'
            : isListening
            ? 'w-[360px] h-[360px] bg-rose-500/30 scale-120 animate-pulse'
            : isThinking
            ? 'w-[360px] h-[360px] bg-amber-500/25 scale-115'
            : 'w-[320px] h-[320px] bg-cyan-500/20 opacity-80'
        }`}
      />

      {/* Main Reactor Body Container */}
      <div
        onClick={interactive ? onClick : undefined}
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        onKeyDown={(e) => {
          if (interactive && onClick && (e.key === 'Enter' || e.key === ' ')) {
            onClick();
          }
        }}
        aria-label="Iron Man Arc Reactor Core"
        className={`relative ${dimensions.container} rounded-full flex items-center justify-center ${
          interactive ? 'cursor-pointer group transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]' : ''
        }`}
      >
        <svg
          viewBox="0 0 500 500"
          className="w-full h-full drop-shadow-[0_0_35px_rgba(0,229,255,0.45)]"
        >
          <defs>
            {/* Dark Crimson Titanium Armor Gradient (Chest Plate) */}
            <radialGradient id="chestArmorGrad" cx="50%" cy="50%" r="50%">
              <stop offset="68%" stopColor="#080c14" stopOpacity="0.95" />
              <stop offset="76%" stopColor="#220b12" stopOpacity="0.95" />
              <stop offset="88%" stopColor="#3d1420" stopOpacity="0.98" />
              <stop offset="96%" stopColor="#1e0a10" stopOpacity="1" />
              <stop offset="100%" stopColor="#0a0306" stopOpacity="1" />
            </radialGradient>

            {/* Brushed Titanium Rim Gradient */}
            <linearGradient id="titaniumRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4a5568" />
              <stop offset="25%" stopColor="#1a202c" />
              <stop offset="50%" stopColor="#718096" />
              <stop offset="75%" stopColor="#2d3748" />
              <stop offset="100%" stopColor="#1a202c" />
            </linearGradient>

            {/* Glowing Cyan Coil Channel Gradient */}
            <radialGradient id="coilTrenchGrad" cx="50%" cy="50%" r="50%">
              <stop offset="60%" stopColor="#031024" />
              <stop offset="75%" stopColor="#003b6f" />
              <stop offset="85%" stopColor={secondaryColor} stopOpacity="0.8" />
              <stop offset="95%" stopColor={coreGlowColor} stopOpacity="0.95" />
              <stop offset="100%" stopColor="#001833" />
            </radialGradient>

            {/* High-intensity Palladium Fusion Core (Blinding White-Hot Center) */}
            <radialGradient id="palladiumCoreGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="20%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="45%" stopColor="#d5f8ff" stopOpacity="0.98" />
              <stop offset="70%" stopColor={coreGlowColor} stopOpacity="0.9" />
              <stop offset="90%" stopColor={secondaryColor} stopOpacity="0.7" />
              <stop offset="100%" stopColor="#001a33" stopOpacity="0.1" />
            </radialGradient>

            {/* Individual Coil Neon Glow */}
            <linearGradient id="neonCoilGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#a5f3fc" />
              <stop offset="35%" stopColor="#ffffff" />
              <stop offset="70%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>

            {/* Glass Lens Sheen Highlight */}
            <linearGradient id="lensSheen" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
              <stop offset="35%" stopColor="#ffffff" stopOpacity="0.08" />
              <stop offset="70%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>

            {/* Copper/Metallic Coil Bracket */}
            <linearGradient id="bracketGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="50%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>

            {/* Drop Shadow Filter for 3D Mechanical Depth */}
            <filter id="metallicBevel" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.8" />
            </filter>
            <filter id="coreGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* LAYER 1: Deep Metallic Crimson / Burgundy Armor Plate Surround (from uploaded photo) */}
          {showSurroundArmor && (
            <g id="armor-plates">
              {/* Outer square/circular chest plate casing */}
              <circle cx="250" cy="250" r="246" fill="url(#chestArmorGrad)" />
              
              {/* Armor Seams / Angular Panel Lines */}
              <path
                d="M 12 120 L 105 180 M 488 120 L 395 180 M 12 380 L 105 320 M 488 380 L 395 320"
                stroke="#4a1525"
                strokeWidth="2.5"
                strokeOpacity="0.7"
              />
              <path
                d="M 250 8 L 250 50 M 250 450 L 250 492"
                stroke="#33101c"
                strokeWidth="3"
                strokeOpacity="0.8"
              />

              {/* Recessed Mounting Screws / Fasteners */}
              <circle cx="95" cy="175" r="4" fill="#1a1c23" stroke="#4a1525" strokeWidth="1.5" />
              <circle cx="405" cy="175" r="4" fill="#1a1c23" stroke="#4a1525" strokeWidth="1.5" />
              <circle cx="95" cy="325" r="4" fill="#1a1c23" stroke="#4a1525" strokeWidth="1.5" />
              <circle cx="405" cy="325" r="4" fill="#1a1c23" stroke="#4a1525" strokeWidth="1.5" />
            </g>
          )}

          {/* LAYER 2: Brushed Titanium Outer Housing Ring with Bevels */}
          <g id="outer-housing" filter="url(#metallicBevel)">
            {/* Outer Dark Ring */}
            <circle cx="250" cy="250" r="202" fill="#0d111a" stroke="#2d3748" strokeWidth="2" />
            {/* Titanium Chamfer Bevel Ring */}
            <circle cx="250" cy="250" r="198" fill="none" stroke="url(#titaniumRimGrad)" strokeWidth="6" />
            <circle cx="250" cy="250" r="192" fill="#060910" stroke="#1a202c" strokeWidth="2" />
            
            {/* Circular recessed trench */}
            <circle cx="250" cy="250" r="186" fill="#030710" />
            
            {/* Radiant cyan energy underlay beneath coils */}
            <circle
              cx="250"
              cy="250"
              r="156"
              fill="none"
              stroke={coreGlowColor}
              strokeWidth="48"
              strokeOpacity={isSpeaking ? 0.35 : 0.22}
              className="transition-opacity duration-300"
            />
          </g>

          {/* LAYER 3: The 10 Segmented Electromagnetic Coils (Identical to reference photo) */}
          <g id="segmented-electromagnetic-coils">
            {coilSegments.map((angle, idx) => (
              <g key={`coil-${idx}`} transform={`rotate(${angle}, 250, 250)`}>
                {/* Radial Divider Bracket between segments (Dark titanium bar) */}
                <rect
                  x="247"
                  y="58"
                  width="6"
                  height="70"
                  fill="url(#bracketGrad)"
                  stroke="#0f172a"
                  strokeWidth="0.8"
                />

                {/* Outer Coil Block Housing (Silver / Titanium Bracket Frame) */}
                <g transform="translate(250, 93)">
                  {/* Segment Background Glow */}
                  <rect
                    x="-24"
                    y="-28"
                    width="48"
                    height="56"
                    rx="3"
                    fill="#041226"
                    stroke="#1e293b"
                    strokeWidth="1.2"
                  />

                  {/* Luminous Dual Induction Rods (The glowing cyan bars from the photo) */}
                  {/* Left luminous bar */}
                  <rect
                    x="-18"
                    y="-22"
                    width="14"
                    height="44"
                    rx="2"
                    fill="url(#neonCoilGrad)"
                    className={isSpeaking ? 'animate-pulse' : ''}
                    style={{
                      filter: `drop-shadow(0 0 ${isSpeaking ? 8 : 4}px ${coreGlowColor})`,
                    }}
                  />
                  {/* Right luminous bar */}
                  <rect
                    x="4"
                    y="-22"
                    width="14"
                    height="44"
                    rx="2"
                    fill="url(#neonCoilGrad)"
                    className={isSpeaking ? 'animate-pulse' : ''}
                    style={{
                      filter: `drop-shadow(0 0 ${isSpeaking ? 8 : 4}px ${coreGlowColor})`,
                    }}
                  />

                  {/* Top Outer Retaining Clamp / Mechanical Clip */}
                  <rect
                    x="-22"
                    y="-27"
                    width="44"
                    height="7"
                    rx="1"
                    fill="#334155"
                    stroke="#64748b"
                    strokeWidth="0.8"
                  />
                  <line x1="-15" y1="-23.5" x2="15" y2="-23.5" stroke="#94a3b8" strokeWidth="0.6" />

                  {/* Middle Central Cross-Brace Bracket */}
                  <rect
                    x="-20"
                    y="-3"
                    width="40"
                    height="6"
                    rx="1"
                    fill="#1e293b"
                    stroke="#475569"
                    strokeWidth="0.8"
                  />

                  {/* Bottom Inner Retaining Clamp */}
                  <rect
                    x="-22"
                    y="20"
                    width="44"
                    height="7"
                    rx="1"
                    fill="#334155"
                    stroke="#64748b"
                    strokeWidth="0.8"
                  />
                  <line x1="-15" y1="23.5" x2="15" y2="23.5" stroke="#94a3b8" strokeWidth="0.6" />
                </g>
              </g>
            ))}
          </g>

          {/* LAYER 4: Inner Mechanical Assembly & Cooling Cog Ring (From reference photo) */}
          <g id="inner-mechanical-assembly">
            {/* Outer boundary of inner hub */}
            <circle cx="250" cy="250" r="126" fill="none" stroke="#0f172a" strokeWidth="3" />
            <circle cx="250" cy="250" r="123" fill="#030814" stroke="#334155" strokeWidth="1.5" />
            
            {/* Luminous Inner Conduit Ring */}
            <circle
              cx="250"
              cy="250"
              r="114"
              fill="none"
              stroke={coreGlowColor}
              strokeWidth="2.5"
              strokeOpacity="0.85"
              style={{ filter: `drop-shadow(0 0 5px ${coreGlowColor})` }}
            />

            {/* Fine Gear/Cog Cooling Ring (~40 radial teeth around r=98) */}
            <g transform={`rotate(${pulseTick * 0.15}, 250, 250)`}>
              {innerTeeth.map((deg, i) => (
                <line
                  key={`tooth-${i}`}
                  x1="250"
                  y1="148"
                  x2="250"
                  y2="159"
                  transform={`rotate(${deg}, 250, 250)`}
                  stroke="#64748b"
                  strokeWidth="2.2"
                />
              ))}
              {/* Backlight shining between cog teeth */}
              <circle
                cx="250"
                cy="250"
                r="97"
                fill="none"
                stroke={coreGlowColor}
                strokeWidth="12"
                strokeOpacity="0.3"
              />
            </g>

            {/* Inner Titanium Beveled Ring */}
            <circle cx="250" cy="250" r="90" fill="#080e1a" stroke="#475569" strokeWidth="2.5" />
            <circle cx="250" cy="250" r="84" fill="#020610" stroke="#00f0ff" strokeWidth="1" strokeOpacity="0.6" />

            {/* Dynamic Energy Gyro Ring (Rotating reverse) */}
            <g transform={`rotate(${-pulseTick * 0.4}, 250, 250)`}>
              <circle
                cx="250"
                cy="250"
                r="78"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.5"
                strokeDasharray="18 10 32 10"
                strokeOpacity="0.75"
              />
              <circle cx="250" cy="172" r="2.5" fill="#ffffff" />
              <circle cx="250" cy="328" r="2.5" fill="#ffffff" />
            </g>
          </g>

          {/* LAYER 5: Central High-Intensity Palladium Fusion Core (Blinding White-Hot Photonic Center) */}
          <g id="fusion-core">
            {/* Outermost Core Energy Halo */}
            <circle
              cx="250"
              cy="250"
              r="70"
              fill={coreGlowColor}
              fillOpacity={isSpeaking ? 0.35 : 0.22}
              className="transition-all duration-300"
            />

            {/* Primary Palladium Fusion Core */}
            <circle
              cx="250"
              cy="250"
              r="58"
              fill="url(#palladiumCoreGrad)"
              filter="url(#coreGlow)"
              className={`transition-transform duration-500 ${
                isSpeaking
                  ? 'scale-110'
                  : isListening
                  ? 'scale-105'
                  : isThinking
                  ? 'scale-108'
                  : ''
              }`}
              style={{ transformOrigin: '250px 250px' }}
            />

            {/* Intense White Center Node */}
            <circle
              cx="250"
              cy="250"
              r="34"
              fill="#ffffff"
              className={isSpeaking ? 'animate-pulse' : ''}
              style={{
                filter: `drop-shadow(0 0 ${isSpeaking ? 22 : 14}px #ffffff)`,
              }}
            />

            {/* Concentric Inner Optical Ring */}
            <circle
              cx="250"
              cy="250"
              r="46"
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.8"
              strokeOpacity="0.9"
            />
            <circle
              cx="250"
              cy="250"
              r="24"
              fill="none"
              stroke={coreGlowColor}
              strokeWidth="1"
              strokeOpacity="0.7"
              strokeDasharray="4 3"
            />

            {/* Center Core Micro-Reticle */}
            <circle cx="250" cy="250" r="8" fill="#ffffff" />
            <line x1="236" y1="250" x2="242" y2="250" stroke="#00e5ff" strokeWidth="1.2" />
            <line x1="258" y1="250" x2="264" y2="250" stroke="#00e5ff" strokeWidth="1.2" />
            <line x1="250" y1="236" x2="250" y2="242" stroke="#00e5ff" strokeWidth="1.2" />
            <line x1="250" y1="258" x2="250" y2="264" stroke="#00e5ff" strokeWidth="1.2" />
          </g>

          {/* LAYER 6: Curved Lens Glass Sheen Highlight (Simulating polished protective crystal lens) */}
          <path
            d="M 125 150 Q 250 80 375 150 A 185 185 0 0 0 125 150 Z"
            fill="url(#lensSheen)"
            pointerEvents="none"
          />

          {/* Audio Pulsing Shockwaves when speaking */}
          {isSpeaking && (
            <>
              <circle
                cx="250"
                cy="250"
                r="64"
                fill="none"
                stroke="#00f0ff"
                strokeWidth="2"
                className="animate-ping"
                style={{ transformOrigin: '250px 250px', animationDuration: '1.2s' }}
                opacity="0.5"
              />
              <circle
                cx="250"
                cy="250"
                r="110"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.5"
                className="animate-ping"
                style={{ transformOrigin: '250px 250px', animationDuration: '1.8s' }}
                opacity="0.3"
              />
            </>
          )}
        </svg>

        {/* Hover Cue when interactive */}
        {interactive && (
          <div className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-cyan-400/50 text-[11px] font-mono tracking-widest text-cyan-300 shadow-lg shadow-cyan-500/30 flex items-center gap-1.5 translate-y-24">
              <Mic className="w-3 h-3 text-cyan-400 animate-pulse" />
              <span>{isListening ? 'LISTENING...' : 'CLICK TO SPEAK'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Telemetry Status Line Beneath Reactor */}
      <div className="mt-3 text-center">
        <div className="flex items-center justify-center gap-2">
          <span
            className={`inline-block w-2 h-2 rounded-full ${
              isSpeaking
                ? 'bg-cyan-400 animate-pulse'
                : isListening
                ? 'bg-rose-500 animate-ping'
                : isThinking
                ? 'bg-amber-400 animate-bounce'
                : 'bg-emerald-400 shadow-[0_0_8px_#10b981]'
            }`}
          />
          <span className={`font-mono ${dimensions.textScale} uppercase tracking-widest text-cyan-300 font-bold`}>
            {statusText ||
              (isSpeaking
                ? 'ARONE Vocalizing // Output: 3.8 GJ/s'
                : isListening
                ? 'Neural Receptor Active // Listening...'
                : isThinking
                ? 'Synthesizing Directives // 4.2 TFLOPs'
                : 'Mark II Arc Reactor // Core Online')}
          </span>
        </div>
        <p className="text-[11px] font-mono text-slate-400 mt-0.5 tracking-wider">
          {isListening
            ? 'State your executive command naturally'
            : 'Palladium Core Nominal • Click Core to Command'}
        </p>
      </div>
    </div>
  );
};
