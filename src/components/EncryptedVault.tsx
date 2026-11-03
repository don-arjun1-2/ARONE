import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  Key,
  ShieldCheck,
  ShieldAlert,
  Search,
  Download,
  Eye,
  Filter,
  CheckCircle,
  FileCode,
  Sparkles,
} from 'lucide-react';

export interface DecryptedLogItem {
  id: string;
  actionType: string;
  summary: string;
  decryptedText: string;
  timestamp: string;
  verified: boolean;
  modelUsed?: string;
  rawCiphertext?: string;
  iv?: string;
  salt?: string;
  hashSignature?: string;
}

interface EncryptedVaultProps {
  isUnlocked: boolean;
  onUnlock: (passphrase: string) => Promise<boolean>;
  onLock: () => void;
  logs: DecryptedLogItem[];
  passphraseInput: string;
  setPassphraseInput: (p: string) => void;
  isDecrypting: boolean;
}

export const EncryptedVault: React.FC<EncryptedVaultProps> = ({
  isUnlocked,
  onUnlock,
  onLock,
  logs,
  passphraseInput,
  setPassphraseInput,
  isDecrypting,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLogForProof, setSelectedLogForProof] = useState<DecryptedLogItem | null>(null);
  const [unlockError, setUnlockError] = useState<string | null>(null);

  const handleUnlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUnlockError(null);
    if (!passphraseInput.trim()) return;

    const success = await onUnlock(passphraseInput);
    if (!success) {
      setUnlockError('Decryption failed. Please check your master encryption key.');
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.decryptedText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actionType.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' ? true : log.actionType.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const exportAuditLog = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ARONE_Encrypted_Audit_Log_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Vault Status Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-cyan-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-start gap-3">
          <div
            className={`p-3 rounded-xl border ${
              isUnlocked
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-400'
                : 'bg-amber-950/60 border-amber-500/50 text-amber-400'
            }`}
          >
            {isUnlocked ? <Unlock className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-100 font-mono tracking-wide">
                ENCRYPTED AUDIT VAULT // ZERO-KNOWLEDGE LOGS
              </h2>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  isUnlocked
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-amber-950 text-amber-300 border border-amber-800'
                }`}
              >
                {isUnlocked ? 'SECURE_DECRYPTED' : 'LOCKED_CIPHERTEXT'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              AES-GCM 256-bit with PBKDF2 (100,000 iterations) and SHA-256 anti-tampering proofs
            </p>
          </div>
        </div>

        {isUnlocked ? (
          <div className="flex items-center gap-2">
            <button
              onClick={exportAuditLog}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Audit</span>
            </button>
            <button
              onClick={onLock}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-800/60 text-red-300 text-xs font-mono font-bold transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Lock Vault</span>
            </button>
          </div>
        ) : null}
      </div>

      {/* Lock Screen if Locked */}
      {!isUnlocked ? (
        <div className="p-8 rounded-2xl bg-slate-950/90 border border-slate-800 max-w-lg mx-auto text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-950/60 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400">
            <Key className="w-7 h-7" />
          </div>

          <h3 className="text-base font-bold text-slate-200 font-mono">
            ENTER MASTER VAULT PASSPHRASE
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your daily voice dialogues, commands, and executive operations are client-side encrypted before storage in Firestore. Enter your master encryption passphrase to decrypt and review your session records.
          </p>

          <form onSubmit={handleUnlockSubmit} className="space-y-3 pt-2">
            <input
              type="password"
              required
              placeholder="Enter master encryption passphrase..."
              value={passphraseInput}
              onChange={(e) => setPassphraseInput(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs text-center focus:outline-none focus:border-cyan-400 font-mono tracking-wider"
            />

            {unlockError && (
              <p className="text-xs text-red-400 font-mono">{unlockError}</p>
            )}

            <button
              type="submit"
              disabled={isDecrypting || !passphraseInput.trim()}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-900/40 transition-all cursor-pointer disabled:opacity-50"
            >
              {isDecrypting ? 'Decrypting Records with PBKDF2...' : 'Unlock & Decrypt Vault'}
            </button>
          </form>

          <div className="pt-2 text-[11px] font-mono text-slate-500">
            Default preset key: <code className="text-cyan-400">ARONE_PROTOCOL_77</code>
          </div>
        </div>
      ) : (
        /* Decrypted Log Explorer */
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search encrypted records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              {[
                { id: 'all', label: 'All Operations' },
                { id: 'voice_command', label: 'Voice Directives' },
                { id: 'task_action', label: 'Google Tasks' },
                { id: 'smart_home', label: 'Smart Home' },
                { id: 'schedule_meeting', label: 'Meetings' },
                { id: 'send_email', label: 'Emails' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-mono whitespace-nowrap transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Records Table / Cards */}
          <div className="space-y-2.5">
            {filteredLogs.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-slate-950/40 border border-slate-800/60 text-slate-500 text-xs font-mono">
                No encrypted logs match the current criteria. As you interact with ARONE, encrypted entries will appear here.
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-900/60 transition-all space-y-2"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-400" />
                        <h4 className="text-xs font-bold text-slate-200">{log.summary}</h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-cyan-300 border border-slate-800">
                          {log.actionType}
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-slate-400">
                        {new Date(log.timestamp).toLocaleString()} {log.modelUsed && `// via ${log.modelUsed}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded border ${
                          log.verified
                            ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800/50'
                            : 'bg-red-950/80 text-red-400 border-red-800/50'
                        }`}
                      >
                        {log.verified ? (
                          <>
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            <span>SHA-256 VERIFIED</span>
                          </>
                        ) : (
                          <>
                            <ShieldAlert className="w-3 h-3 text-red-400" />
                            <span>TAMPER ALERT</span>
                          </>
                        )}
                      </span>

                      <button
                        onClick={() => setSelectedLogForProof(log)}
                        className="p-1 rounded-md text-slate-400 hover:text-cyan-300 hover:bg-slate-800 text-xs font-mono flex items-center gap-1 transition-colors"
                        title="View Cryptographic Proof"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Proof</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 bg-slate-950/80 p-3 rounded-lg border border-slate-800/70 font-mono leading-relaxed whitespace-pre-wrap">
                    {log.decryptedText}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Cryptographic Proof Modal */}
      {selectedLogForProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl p-6 rounded-2xl bg-slate-900 border border-cyan-800/80 shadow-2xl text-left space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-slate-100 font-mono">
                  CRYPTOGRAPHIC PROOF & INTEGRITY TELEMETRY
                </h3>
              </div>
              <button
                onClick={() => setSelectedLogForProof(null)}
                className="text-slate-400 hover:text-slate-200 text-xs font-mono"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono max-h-[60vh] overflow-y-auto pr-1">
              <div>
                <span className="text-slate-500 block mb-1">Log ID:</span>
                <span className="text-cyan-300">{selectedLogForProof.id}</span>
              </div>

              <div>
                <span className="text-slate-500 block mb-1">SHA-256 Digest Signature:</span>
                <div className="p-2 rounded bg-slate-950 border border-slate-800 text-emerald-400 break-all">
                  {selectedLogForProof.hashSignature || 'Computed upon encryption'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 block mb-1">Initialization Vector (IV):</span>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800 text-cyan-400 break-all">
                    {selectedLogForProof.iv || '12-byte hex'}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">PBKDF2 Salt:</span>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800 text-cyan-400 break-all">
                    {selectedLogForProof.salt || '16-byte hex'}
                  </div>
                </div>
              </div>

              <div>
                <span className="text-slate-500 block mb-1">Raw Ciphertext (Stored in Firestore):</span>
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-slate-400 break-all text-[11px] max-h-32 overflow-y-auto">
                  {selectedLogForProof.rawCiphertext || 'AES-GCM Ciphertext'}
                </div>
              </div>

              <div>
                <span className="text-slate-500 block mb-1">Decrypted Plaintext:</span>
                <div className="p-2.5 rounded bg-slate-950 border border-cyan-900/60 text-slate-200 break-all text-xs">
                  {selectedLogForProof.decryptedText}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedLogForProof(null)}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
