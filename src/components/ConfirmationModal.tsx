import React from 'react';
import { AlertTriangle, Check, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  actionLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  details?: Record<string, string | number | undefined>;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  description,
  actionLabel = 'Confirm Action',
  isDestructive = false,
  onConfirm,
  onCancel,
  isLoading = false,
  details,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md p-6 rounded-2xl bg-slate-900 border border-cyan-800/60 shadow-2xl shadow-cyan-950/80 text-left">
        {/* Glow accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />

        <div className="flex items-start gap-4">
          <div
            className={`p-3 rounded-xl border ${
              isDestructive
                ? 'bg-red-950/60 border-red-800/60 text-red-400'
                : 'bg-cyan-950/60 border-cyan-800/60 text-cyan-400'
            }`}
          >
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div className="flex-1">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              {title}
            </h3>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {/* Structured details if available */}
        {details && (
          <div className="mt-4 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs font-mono space-y-1.5">
            {Object.entries(details).map(([key, val]) => {
              if (val === undefined || val === '') return null;
              return (
                <div key={key} className="flex justify-between items-center text-slate-400">
                  <span className="capitalize text-slate-500">{key}:</span>
                  <span className="text-cyan-300 font-medium text-right truncate max-w-[200px]">
                    {String(val)}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Cancel</span>
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold shadow-md transition-all ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/50'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-cyan-900/40 font-bold'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>{isLoading ? 'Executing...' : actionLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
