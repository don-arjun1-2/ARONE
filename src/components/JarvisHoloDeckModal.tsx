import React from 'react';
import { X, Maximize2, Minimize2, Sparkles } from 'lucide-react';

interface JarvisHoloDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export const JarvisHoloDeckModal: React.FC<JarvisHoloDeckModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
}) => {
  const [isMaximized, setIsMaximized] = React.useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-fade-in">
      <div
        className={`relative w-full ${
          isMaximized ? 'max-w-[96vw] h-[94vh]' : 'max-w-5xl max-h-[90vh]'
        } flex flex-col rounded-2xl border-2 border-cyan-400 bg-[#020917]/95 shadow-[0_0_35px_rgba(0,240,255,0.35)] overflow-hidden transition-all duration-300 hud-grid-bg`}
      >
        {/* Holographic Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-cyan-500/40 bg-gradient-to-r from-cyan-950/80 via-[#03112c]/90 to-blue-950/80">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff] animate-pulse" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm md:text-base font-black font-mono tracking-wider text-cyan-100 uppercase">
                  {title}
                </h2>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-500/50 text-cyan-300">
                  ONLINE
                </span>
              </div>
              <p className="text-[10px] font-mono text-cyan-400/80 tracking-tight">
                {subtitle}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMaximized(!isMaximized)}
              className="p-1.5 rounded-lg border border-cyan-800/60 bg-cyan-950/40 text-cyan-300 hover:border-cyan-400 hover:text-cyan-100 transition-all"
              title={isMaximized ? 'Restore HUD Window' : 'Maximize HUD Window'}
            >
              {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-500/40 bg-red-950/40 text-red-300 hover:bg-red-900/50 hover:border-red-400 hover:text-red-100 transition-all text-xs font-mono"
              title="Close Holographic Deck"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">CLOSE HUD</span>
            </button>
          </div>
        </div>

        {/* Content Body with customized scrollbar */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {children}
        </div>

        {/* Holographic Bottom Accent Strip */}
        <div className="px-4 py-1.5 border-t border-cyan-950 bg-[#010611] flex items-center justify-between text-[9px] font-mono text-cyan-500/70">
          <span>ARONE PROTOCOL 07 // SECURE FEED</span>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
            <span>ENCRYPTED HUD CHANNEL</span>
          </div>
        </div>
      </div>
    </div>
  );
};
