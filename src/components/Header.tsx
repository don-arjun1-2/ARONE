import React from 'react';
import { User } from 'firebase/auth';
import {
  ShieldCheck,
  ShieldAlert,
  Volume2,
  VolumeX,
  Sparkles,
  Lock,
  Unlock,
  Radio,
  Cpu,
} from 'lucide-react';

interface HeaderProps {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  isLoggingIn: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  vaultUnlocked: boolean;
  onToggleVaultLock: () => void;
  autoSpeak: boolean;
  setAutoSpeak: (val: boolean) => void;
  isSpeaking: boolean;
  tasksTokenAvailable: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onLogin,
  onLogout,
  isLoggingIn,
  activeTab,
  setActiveTab,
  vaultUnlocked,
  onToggleVaultLock,
  autoSpeak,
  setAutoSpeak,
  isSpeaking,
  tasksTokenAvailable,
}) => {
  return (
    <header className="border-b border-cyan-950/60 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Logo and System Status */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-400/40 shadow-sm shadow-cyan-500/20">
              <Cpu className={`w-5 h-5 text-cyan-400 ${isSpeaking ? 'animate-pulse' : ''}`} />
              <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-blue-400 text-lg">
                  ARONE
                </span>
                <span className="text-[10px] font-mono tracking-wider px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/40 text-cyan-300">
                  MARK-VII
                </span>
              </div>
              <p className="text-[11px] font-mono text-cyan-400/70 tracking-tight">
                AUTONOMOUS REAL-TIME OPERATIONS NETWORK ENGINE
              </p>
            </div>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setAutoSpeak(!autoSpeak)}
              className={`p-1.5 rounded-md border text-xs ${
                autoSpeak
                  ? 'border-cyan-500/50 bg-cyan-950/50 text-cyan-300'
                  : 'border-slate-800 bg-slate-900 text-slate-500'
              }`}
              title={autoSpeak ? 'Audio Voice On' : 'Audio Voice Muted'}
            >
              {autoSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Navigation tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto w-full md:w-auto py-1 px-1 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
          {[
            { id: 'assistant', label: 'Command Core', icon: Sparkles },
            { id: 'home', label: 'Smart Home', icon: Radio },
            { id: 'tasks', label: 'Google Tasks', icon: ShieldCheck, badge: tasksTokenAvailable ? 'SYNC' : 'AUTH' },
            { id: 'meetings', label: 'Meetings', icon: Cpu },
            { id: 'emails', label: 'Executive Mail', icon: ShieldCheck },
            { id: 'vault', label: 'Encrypted Vault', icon: vaultUnlocked ? Unlock : Lock },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-600/30 to-blue-600/30 border border-cyan-500/50 text-cyan-200 shadow-sm shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[9px] px-1 rounded font-mono font-bold ${
                      tasksTokenAvailable
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50'
                        : 'bg-amber-950/80 text-amber-400 border border-amber-800/50'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Controls & Auth */}
        <div className="flex items-center gap-2.5">
          {/* Voice Output Toggle */}
          <button
            onClick={() => setAutoSpeak(!autoSpeak)}
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all ${
              autoSpeak
                ? 'border-cyan-500/40 bg-cyan-950/40 text-cyan-300 shadow-sm shadow-cyan-500/10'
                : 'border-slate-800 bg-slate-900/60 text-slate-500'
            }`}
            title="Auto-speak AI responses using gemini-3.8-flash-tts"
          >
            {autoSpeak ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>VOICE ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                <span>VOICE MUTED</span>
              </>
            )}
          </button>

          {/* Encrypted Vault Lock Status */}
          <button
            onClick={onToggleVaultLock}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all ${
              vaultUnlocked
                ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300'
                : 'border-slate-800 bg-slate-900/60 text-slate-400'
            }`}
            title={vaultUnlocked ? 'Vault Unlocked - Click to lock' : 'Vault Locked - Click to unlock'}
          >
            {vaultUnlocked ? (
              <>
                <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">VAULT SECURE</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">VAULT LOCKED</span>
              </>
            )}
          </button>

          {/* Google Sign In / User Profile */}
          {user ? (
            <div className="flex items-center gap-2 pl-1 border-l border-slate-800">
              <div className="flex items-center gap-2">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-7 h-7 rounded-full border border-cyan-500/40"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-cyan-900/50 border border-cyan-500/40 flex items-center justify-center text-xs font-bold text-cyan-300">
                    {user.displayName?.[0] || 'U'}
                  </div>
                )}
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-medium text-slate-200 leading-tight">
                    {user.displayName || 'Executive'}
                  </p>
                  <p className="text-[10px] text-cyan-400/80 font-mono leading-none">
                    ONLINE
                  </p>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="text-xs font-mono text-slate-400 hover:text-slate-200 hover:bg-slate-800 px-2 py-1 rounded transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={onLogin}
              disabled={isLoggingIn}
              className="gsi-material-button text-xs"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                backgroundColor: '#131314',
                color: '#e3e3e3',
                border: '1px solid #3c4043',
                borderRadius: '8px',
                padding: '6px 12px',
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: 'system-ui, sans-serif',
              }}
            >
              <div style={{ marginRight: '8px', display: 'flex', alignItems: 'center' }}>
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ width: '16px', height: '16px', display: 'block' }}>
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
              </div>
              <span>{isLoggingIn ? 'Connecting...' : 'Sign in with Google'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
