import React, { useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import {
  Activity,
  Wifi,
  Battery,
  BatteryCharging,
  Cpu,
  Shield,
  ShieldCheck,
  Lock,
  Unlock,
  Volume2,
  VolumeX,
  MapPin,
  Sun,
  Clock,
  Radio,
  Calendar,
  Mail,
  CheckSquare,
  FileText,
  Sliders,
  Sparkles,
  Zap,
  Terminal,
  Layers,
  Power,
  BarChart3,
  Flame,
} from 'lucide-react';
import { DailyInsightResult } from '../utils/telemetryInsight';
import { getBatteryStatusMetrics } from '../utils/batteryTelemetry';

// ----------------------------------------------------
// Top Header HUD matching the reference image layout
// ----------------------------------------------------
interface JarvisHeaderHUDProps {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  isLoggingIn: boolean;
  vaultUnlocked: boolean;
  onToggleVaultLock: () => void;
  autoSpeak: boolean;
  setAutoSpeak: (val: boolean) => void;
  isSpeaking: boolean;
  tasksTokenAvailable: boolean;
  onSelectModule: (id: string) => void;
}

export const JarvisHeaderHUD: React.FC<JarvisHeaderHUDProps> = ({
  user,
  onLogin,
  onLogout,
  isLoggingIn,
  vaultUnlocked,
  onToggleVaultLock,
  autoSpeak,
  setAutoSpeak,
  isSpeaking,
  tasksTokenAvailable,
  onSelectModule,
}) => {
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [locationName, setLocationName] = useState('COIMBATORE');
  const [temperature, setTemperature] = useState('32°C');
  const [weatherCondition, setWeatherCondition] = useState('Sunny');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
      setDateStr(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      );
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="w-full flex flex-col md:flex-row items-center justify-between gap-4 py-2 px-3 border-b border-cyan-500/30 bg-[#020713]/90 backdrop-blur-md relative z-30 select-none">
      {/* Top Left: Hexagonal ARONE Arc Reactor Badge & Title */}
      <div className="flex items-center gap-3.5">
        {/* Arc Reactor Badge with concentric spinning rings */}
        <div
          onClick={() => onSelectModule('assistant')}
          className="relative w-14 h-14 cursor-pointer group flex items-center justify-center"
          title="ARONE Core: Click to open Command Terminal"
        >
          {/* Outer rotating segmented ring */}
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-400/60 animate-spin-slow group-hover:border-cyan-300" />
          <div className="absolute inset-1.5 rounded-full border border-cyan-500/40 animate-spin-reverse-slow" />
          
          {/* Inner Hex Core with glowing 'A' */}
          <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-cyan-950 via-slate-900 to-blue-950 border border-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.7)] group-hover:shadow-[0_0_25px_rgba(0,240,255,0.95)] transition-all">
            <svg viewBox="0 0 40 40" className="w-6 h-6">
              {/* Outer triangle */}
              <polygon
                points="20,4 36,34 4,34"
                fill="none"
                stroke="#00f0ff"
                strokeWidth="2.5"
                strokeLinejoin="round"
                className="drop-shadow-[0_0_6px_#00f0ff]"
              />
              {/* Inner glowing triangle */}
              <polygon
                points="20,13 29,30 11,30"
                fill="#00f0ff"
                fillOpacity="0.4"
                stroke="#ffffff"
                strokeWidth="1"
              />
              <circle cx="20" cy="23" r="3" fill="#ffffff" className={isSpeaking ? 'animate-ping' : ''} />
            </svg>
          </div>

          {/* Cyan Glow Ping */}
          <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-400 shadow-[0_0_8px_#00f0ff]"></span>
          </span>
        </div>

        {/* Title & Cyber Subtitle */}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-sky-100 to-cyan-400 font-mono drop-shadow-[0_0_12px_rgba(0,240,255,0.8)]">
              ARONE
            </h1>
            {/* Top Right Three Diagonal Chevrons */}
            <div className="flex items-center gap-1 opacity-80">
              <span className="w-1.5 h-3 bg-cyan-400 transform -skew-x-12 inline-block"></span>
              <span className="w-1.5 h-3 bg-cyan-400 transform -skew-x-12 inline-block"></span>
              <span className="w-1.5 h-3 bg-cyan-400 transform -skew-x-12 inline-block"></span>
            </div>
          </div>
          <p className="text-[10px] font-mono tracking-widest text-cyan-300/80 uppercase">
            Advanced Response & Operations Neural Engine
          </p>
        </div>
      </div>

      {/* Top Right: Clock & Weather Telemetry (matching the reference image) */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Digital Clock Frame */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-cyan-500/50 bg-[#040e24]/80 shadow-[0_0_12px_rgba(0,240,255,0.25)]">
          <Clock className="w-4 h-4 text-cyan-400 animate-pulse" />
          <div className="text-right font-mono">
            <div className="text-sm md:text-base font-extrabold text-cyan-200 tracking-wider">
              {timeStr || '02:37:00 PM'}
            </div>
            <div className="text-[9px] text-cyan-400/80 tracking-widest">
              {dateStr || 'Sat, 25 Oct 2025'}
            </div>
          </div>
        </div>

        {/* Location & Weather Telemetry */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-cyan-500/50 bg-[#040e24]/80 shadow-[0_0_12px_rgba(0,240,255,0.25)] font-mono">
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1 text-[11px] font-bold text-cyan-300 tracking-wider">
              <MapPin className="w-3 h-3 text-cyan-400" />
              <span>{locationName}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-amber-300">
              <Sun className="w-3 h-3 text-amber-400 animate-spin-slow" />
              <span>{temperature}</span>
              <span className="text-cyan-400/70">·</span>
              <span className="text-cyan-300/80">{weatherCondition}</span>
            </div>
          </div>
        </div>

        {/* Audio Voice Toggle */}
        <button
          onClick={() => setAutoSpeak(!autoSpeak)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all ${
            autoSpeak
              ? 'border-cyan-400 bg-cyan-950/60 text-cyan-200 shadow-[0_0_10px_rgba(0,240,255,0.3)]'
              : 'border-slate-800 bg-slate-950/80 text-slate-500'
          }`}
          title="Toggle Gemini TTS Speech Output"
        >
          {autoSpeak ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
          <span className="hidden sm:inline">{autoSpeak ? 'VOICE ON' : 'MUTED'}</span>
        </button>

        {/* Vault Lock Status */}
        <button
          onClick={onToggleVaultLock}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all ${
            vaultUnlocked
              ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300'
              : 'border-amber-500/50 bg-amber-950/40 text-amber-300'
          }`}
          title={vaultUnlocked ? 'Vault Unlocked - Click to Secure' : 'Vault Locked - Click to Authenticate'}
        >
          {vaultUnlocked ? <Unlock className="w-3.5 h-3.5 text-emerald-400" /> : <Lock className="w-3.5 h-3.5 text-amber-400" />}
          <span className="hidden sm:inline">{vaultUnlocked ? 'SECURE' : 'LOCKED'}</span>
        </button>

        {/* User Google Auth */}
        {user ? (
          <div className="flex items-center gap-2 pl-1 border-l border-cyan-800/50">
            {user.photoURL ? (
              <img src={user.photoURL} alt="User" className="w-7 h-7 rounded-full border border-cyan-400" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-cyan-900 border border-cyan-400 flex items-center justify-center text-xs text-cyan-200 font-bold">
                {user.displayName?.[0] || 'U'}
              </div>
            )}
            <button
              onClick={onLogout}
              className="text-xs font-mono text-cyan-400/80 hover:text-cyan-200 hover:bg-cyan-950/50 px-2 py-1 rounded border border-cyan-800/40 transition-colors"
            >
              Sign out
            </button>
          </div>
        ) : (
          <button
            onClick={onLogin}
            disabled={isLoggingIn}
            className="flex items-center gap-1.5 text-xs font-mono px-2.5 py-1.5 rounded-lg bg-slate-900 border border-cyan-500/50 text-cyan-200 hover:bg-cyan-950/80 hover:border-cyan-400 transition-all shadow-[0_0_10px_rgba(0,240,255,0.2)]"
          >
            <span>{isLoggingIn ? 'Connecting...' : 'Sign in'}</span>
          </button>
        )}
      </div>
    </header>
  );
};

// ----------------------------------------------------
// Left Column: SYSTEM STATUS Angled Menu (matches image)
// ----------------------------------------------------
interface SystemStatusMenuProps {
  activeModule: string;
  onSelectModule: (id: string) => void;
  tasksTokenAvailable: boolean;
  vaultUnlocked: boolean;
}

export const SystemStatusMenu: React.FC<SystemStatusMenuProps> = ({
  activeModule,
  onSelectModule,
  tasksTokenAvailable,
  vaultUnlocked,
}) => {
  const menuItems = [
    { id: 'assistant', label: 'ANALYTICS & AI', icon: Sparkles, tag: 'CORE' },
    { id: 'home', label: 'SMART HOME', icon: Radio, tag: 'IOT' },
    { id: 'tasks', label: 'GOOGLE TASKS', icon: CheckSquare, tag: tasksTokenAvailable ? 'SYNC' : 'AUTH' },
    { id: 'meetings', label: 'MEETINGS & COMMS', icon: Calendar, tag: 'CAL' },
    { id: 'emails', label: 'EXECUTIVE MAIL', icon: Mail, tag: 'OUTBOX' },
    { id: 'vault', label: 'SECURITY VAULT', icon: vaultUnlocked ? Unlock : Lock, tag: 'AES-256' },
    { id: 'logs', label: 'SYSTEM TELEMETRY', icon: Layers, tag: 'LOGS' },
  ];

  return (
    <div className="w-full flex flex-col rounded-xl border border-cyan-500/40 bg-[#020713]/85 backdrop-blur-md p-3 relative shadow-[0_0_20px_rgba(0,240,255,0.15)] overflow-hidden">
      {/* Top Header with Cyan Dot & Bracket */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-cyan-500/30">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff] animate-pulse" />
          <h2 className="text-xs font-mono font-bold tracking-widest text-cyan-200 uppercase">
            SYSTEM STATUS
          </h2>
        </div>
        <span className="text-[9px] font-mono text-cyan-400/60 tracking-wider">
          MARK-VII
        </span>
      </div>

      {/* Angled Cyber Menu Buttons matching reference layout */}
      <div className="space-y-1.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectModule(item.id)}
              className={`w-full group relative flex items-center justify-between px-3 py-2 text-xs font-mono transition-all text-left clip-hud-btn border ${
                isActive
                  ? 'border-cyan-400 bg-gradient-to-r from-cyan-950/90 via-blue-950/70 to-cyan-900/50 text-cyan-100 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                  : 'border-cyan-900/50 bg-[#040e22]/60 text-cyan-300/80 hover:border-cyan-400/80 hover:bg-cyan-950/40 hover:text-cyan-100'
              }`}
            >
              <div className="flex items-center gap-2.5 z-10">
                <Icon
                  className={`w-3.5 h-3.5 transition-colors ${
                    isActive ? 'text-cyan-300 drop-shadow-[0_0_6px_#00f0ff]' : 'text-cyan-500 group-hover:text-cyan-300'
                  }`}
                />
                <span className="tracking-wider font-semibold">{item.label}</span>
              </div>

              <div className="flex items-center gap-2 z-10">
                <span
                  className={`text-[8px] px-1.5 py-0.5 rounded font-mono font-bold ${
                    isActive
                      ? 'bg-cyan-400 text-slate-950'
                      : 'bg-cyan-950/80 text-cyan-400/80 border border-cyan-800/40'
                  }`}
                >
                  {item.tag}
                </span>
                <span className={`text-cyan-400 text-xs transition-transform ${isActive ? 'translate-x-0.5' : 'group-hover:translate-x-0.5'}`}>
                  ›
                </span>
              </div>

              {/* Active left indicator bar */}
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ----------------------------------------------------
// Bottom Left: PERFORMANCE OVERVIEW (Waveform + Gauges)
// ----------------------------------------------------
export const PerformanceOverviewHUD: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let animId: number;
    let phase = 0;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw subtle grid
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.12)';
      ctx.lineWidth = 1;
      const step = 20;
      for (let x = 0; x < canvas.width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw glowing sine wave
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 8;
      ctx.beginPath();

      const centerY = canvas.height / 2;
      for (let x = 0; x < canvas.width; x++) {
        const y =
          centerY +
          Math.sin((x * 0.05) + phase) * 16 +
          Math.sin((x * 0.02) + phase * 1.5) * 8;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Draw peak data dots
      for (let x = 20; x < canvas.width; x += 45) {
        const y =
          centerY +
          Math.sin((x * 0.05) + phase) * 16 +
          Math.sin((x * 0.02) + phase * 1.5) * 8;
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      phase += 0.05;
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  const gauges = [
    { label: 'CPU', value: 18, color: '#00f0ff' },
    { label: 'RAM', value: 37, color: '#00a2ff' },
    { label: 'GPU', value: 28, color: '#38bdf8' },
    { label: 'DISK', value: 64, color: '#06b6d4' },
  ];

  return (
    <div className="w-full flex flex-col rounded-xl border border-cyan-500/40 bg-[#020713]/85 backdrop-blur-md p-3 relative shadow-[0_0_20px_rgba(0,240,255,0.15)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-cyan-500/30">
        <h3 className="text-xs font-mono font-bold tracking-widest text-cyan-200 uppercase">
          PERFORMANCE OVERVIEW
        </h3>
        <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_#ff2a4b] animate-ping" />
      </div>

      {/* Waveform Canvas */}
      <div className="w-full h-16 bg-[#010816] rounded-lg border border-cyan-900/60 overflow-hidden relative mb-3">
        <canvas ref={canvasRef} width={280} height={64} className="w-full h-full block" />
        <span className="absolute top-1 left-2 text-[8px] font-mono text-cyan-400/60">
          OSCILLOSCOPE 40Hz
        </span>
      </div>

      {/* 4 Circular HUD Gauges matching reference image */}
      <div className="grid grid-cols-4 gap-2">
        {gauges.map((g) => {
          const radius = 22;
          const circumference = 2 * Math.PI * radius;
          const offset = circumference - (g.value / 100) * circumference;
          return (
            <div key={g.label} className="flex flex-col items-center">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-12 h-12 -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r={radius}
                    fill="none"
                    stroke="#0a1b38"
                    strokeWidth="3.5"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r={radius}
                    fill="none"
                    stroke={g.color}
                    strokeWidth="3.5"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="drop-shadow-[0_0_4px_#00f0ff]"
                  />
                </svg>
                <div className="absolute text-[10px] font-mono font-bold text-cyan-100">
                  {g.value}%
                </div>
              </div>
              <span className="text-[9px] font-mono text-cyan-300/80 mt-1 uppercase font-semibold">
                {g.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ----------------------------------------------------
// Top Right: SYSTEM MONITOR (Meters & Frequencies)
// ----------------------------------------------------
export const SystemMonitorHUD: React.FC = () => {
  const bars = [
    { label: 'CPU Usage', val: 18 },
    { label: 'RAM Usage', val: 37 },
    { label: 'GPU Usage', val: 28 },
    { label: 'Temp', val: 42, unit: '°C' },
  ];

  return (
    <div className="w-full flex flex-col rounded-xl border border-cyan-500/40 bg-[#020713]/85 backdrop-blur-md p-3 relative shadow-[0_0_20px_rgba(0,240,255,0.15)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-cyan-500/30">
        <h3 className="text-xs font-mono font-bold tracking-widest text-cyan-200 uppercase">
          SYSTEM MONITOR
        </h3>
        <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
      </div>

      {/* Frequency Waveform line */}
      <div className="w-full h-8 bg-[#010816] rounded border border-cyan-900/60 relative overflow-hidden mb-3 flex items-center px-2">
        <div className="w-full flex items-end gap-1 h-5">
          {[20, 45, 75, 30, 90, 60, 40, 85, 95, 35, 50, 70, 80, 45, 65, 85, 30].map(
            (h, i) => (
              <div
                key={i}
                className="flex-1 bg-cyan-400 shadow-[0_0_4px_#00f0ff] rounded-t-xs"
                style={{ height: `${h}%` }}
              />
            )
          )}
        </div>
      </div>

      {/* Progress Bars matching reference image */}
      <div className="space-y-2">
        {bars.map((b) => (
          <div key={b.label} className="space-y-0.5">
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-cyan-300/80">{b.label}</span>
              <span className="text-cyan-100 font-bold">
                {b.val}
                {b.unit || '%'}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-cyan-950">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 shadow-[0_0_6px_#00f0ff]"
                style={{ width: `${b.val}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ----------------------------------------------------
// Middle Right: NETWORK & MOBILE GATEWAY BATTERY TELEMETRY
// ----------------------------------------------------
interface NetworkBatteryHUDProps {
  dailyInsight: DailyInsightResult;
}

export const NetworkBatteryHUD: React.FC<NetworkBatteryHUDProps> = ({ dailyInsight }) => {
  const [batteryMetrics, setBatteryMetrics] = useState(() => getBatteryStatusMetrics());

  useEffect(() => {
    const timer = setInterval(() => {
      setBatteryMetrics(getBatteryStatusMetrics());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full flex flex-col rounded-xl border border-cyan-500/40 bg-[#020713]/85 backdrop-blur-md p-3 relative shadow-[0_0_20px_rgba(0,240,255,0.15)] space-y-3">
      {/* Network Status Header */}
      <div>
        <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-cyan-500/30">
          <div className="flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5 text-cyan-400" />
            <h3 className="text-xs font-mono font-bold tracking-widest text-cyan-200 uppercase">
              NETWORK STATUS
            </h3>
          </div>
          <div className="flex items-center gap-1 text-[9px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/50">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Connected</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-cyan-300/80">
          <span>Speed : 120 Mbps</span>
          <span className="text-[10px] text-cyan-400/60">Ping: 14ms</span>
        </div>
      </div>

      {/* Local Mobile Gateway Battery Indicator (Required from turn 6) */}
      <div className="pt-2 border-t border-cyan-900/50">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-200">
            {batteryMetrics.isCharging ? (
              <BatteryCharging className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            ) : (
              <Battery className="w-3.5 h-3.5 text-cyan-400" />
            )}
            <span className="font-semibold text-[11px]">GATEWAY BATTERY</span>
          </div>
          <span className="text-[11px] font-mono font-bold text-cyan-100">
            {batteryMetrics.level}%
          </span>
        </div>

        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-cyan-950 mb-1">
          <div
            className={`h-full ${
              batteryMetrics.level > 20
                ? 'bg-gradient-to-r from-cyan-500 to-emerald-400'
                : 'bg-red-500'
            } shadow-[0_0_8px_#00f0ff]`}
            style={{ width: `${batteryMetrics.level}%` }}
          />
        </div>

        <div className="flex justify-between text-[9px] font-mono text-cyan-400/70">
          <span>{batteryMetrics.statusLabel}</span>
          <span>{batteryMetrics.voltage}</span>
        </div>
      </div>

      {/* Daily Insight Telemetry Card (Required from turns 4 & 5) */}
      <div className="pt-2 border-t border-cyan-900/50">
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-200 font-semibold mb-1">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>DAILY INSIGHT</span>
        </div>
        <div className="p-2 rounded bg-cyan-950/40 border border-cyan-800/40 text-[10px] font-mono text-cyan-300/90 leading-tight">
          <span className="text-cyan-100 font-bold">Top Directive: </span>
          {dailyInsight.mostFrequentCategory} ({dailyInsight.count} events, {dailyInsight.percentage}%)
          <p className="text-[9px] text-cyan-400/70 mt-1 italic">
            "{dailyInsight.summary}"
          </p>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// Bottom Right: QUICK ACCESS (matching reference layout)
// ----------------------------------------------------
interface QuickAccessHUDProps {
  onSelectModule: (id: string) => void;
  onVoiceTrigger: () => void;
  onCycleScene: () => void;
  onLockVault: () => void;
  vaultUnlocked: boolean;
}

export const QuickAccessHUD: React.FC<QuickAccessHUDProps> = ({
  onSelectModule,
  onVoiceTrigger,
  onCycleScene,
  onLockVault,
  vaultUnlocked,
}) => {
  return (
    <div className="w-full flex flex-col rounded-xl border border-cyan-500/40 bg-[#020713]/85 backdrop-blur-md p-3 relative shadow-[0_0_20px_rgba(0,240,255,0.15)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-cyan-500/30">
        <h3 className="text-xs font-mono font-bold tracking-widest text-cyan-200 uppercase">
          QUICK ACCESS
        </h3>
        <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f0ff]" />
      </div>

      {/* 4 Sci-Fi Chamfered HUD Action Buttons */}
      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={() => onSelectModule('assistant')}
          className="group flex flex-col items-center justify-center p-2 rounded-lg border border-cyan-500/40 bg-[#041029]/70 hover:bg-cyan-950/80 hover:border-cyan-300 transition-all shadow-[0_0_10px_rgba(0,240,255,0.15)]"
          title="Open Neural Chat Core"
        >
          <Terminal className="w-4 h-4 text-cyan-400 group-hover:text-cyan-200 transition-colors mb-1" />
          <span className="text-[9px] font-mono text-cyan-300/80 group-hover:text-cyan-100 uppercase">
            Chat
          </span>
        </button>

        <button
          onClick={onVoiceTrigger}
          className="group flex flex-col items-center justify-center p-2 rounded-lg border border-cyan-500/40 bg-[#041029]/70 hover:bg-cyan-950/80 hover:border-cyan-300 transition-all shadow-[0_0_10px_rgba(0,240,255,0.15)]"
          title="Activate ARONE Speech / Voice"
        >
          <Volume2 className="w-4 h-4 text-cyan-400 group-hover:text-cyan-200 transition-colors mb-1" />
          <span className="text-[9px] font-mono text-cyan-300/80 group-hover:text-cyan-100 uppercase">
            Voice
          </span>
        </button>

        <button
          onClick={onCycleScene}
          className="group flex flex-col items-center justify-center p-2 rounded-lg border border-cyan-500/40 bg-[#041029]/70 hover:bg-cyan-950/80 hover:border-cyan-300 transition-all shadow-[0_0_10px_rgba(0,240,255,0.15)]"
          title="Cycle Smart Home Scene Protocol"
        >
          <Sliders className="w-4 h-4 text-cyan-400 group-hover:text-cyan-200 transition-colors mb-1" />
          <span className="text-[9px] font-mono text-cyan-300/80 group-hover:text-cyan-100 uppercase">
            Protocol
          </span>
        </button>

        <button
          onClick={onLockVault}
          className="group flex flex-col items-center justify-center p-2 rounded-lg border border-cyan-500/40 bg-[#041029]/70 hover:bg-cyan-950/80 hover:border-cyan-300 transition-all shadow-[0_0_10px_rgba(0,240,255,0.15)]"
          title={vaultUnlocked ? 'Lock Security Vault' : 'Unlock Security Vault'}
        >
          {vaultUnlocked ? (
            <Unlock className="w-4 h-4 text-emerald-400 group-hover:text-emerald-200 transition-colors mb-1" />
          ) : (
            <Lock className="w-4 h-4 text-amber-400 group-hover:text-amber-200 transition-colors mb-1" />
          )}
          <span className="text-[9px] font-mono text-cyan-300/80 group-hover:text-cyan-100 uppercase">
            {vaultUnlocked ? 'Lock' : 'Unlock'}
          </span>
        </button>
      </div>
    </div>
  );
};
