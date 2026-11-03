import React, { useState } from 'react';
import { Mail, Send, Sparkles, AlertCircle, CheckCircle, Trash2, ArrowUpRight } from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';

export interface EmailItem {
  id: string;
  recipient: string;
  subject: string;
  body: string;
  status: 'draft' | 'sent';
  priority?: string;
  createdAt: string;
}

interface EmailCenterProps {
  emails: EmailItem[];
  onSendEmail: (email: Omit<EmailItem, 'id' | 'createdAt' | 'status'>) => void;
  onDeleteEmail: (emailId: string) => void;
}

export const EmailCenter: React.FC<EmailCenterProps> = ({
  emails,
  onSendEmail,
  onDeleteEmail,
}) => {
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [priority, setPriority] = useState('Normal');
  const [tone, setTone] = useState<'Formal' | 'Concise' | 'Diplomatic' | 'Urgent'>('Formal');
  const [isPolishing, setIsPolishing] = useState(false);

  // Confirmation modal
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<{
    recipient: string;
    subject: string;
    body: string;
    priority: string;
  } | null>(null);

  const handlePolishWithAI = async () => {
    if (!body.trim()) return;
    setIsPolishing(true);
    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'low_latency',
          messages: [
            {
              role: 'user',
              content: `Rewrite the following email draft in a ${tone.toLowerCase()} executive tone suitable for a high-level executive communication. Return ONLY the polished email body text:\n\n${body}`,
            },
          ],
        }),
      });

      const data = await response.json();
      if (data.text) {
        setBody(data.text.trim());
      }
    } catch (err) {
      console.error('Failed to polish email:', err);
    } finally {
      setIsPolishing(false);
    }
  };

  const handleInitiateSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient.trim() || !subject.trim() || !body.trim()) return;

    setPendingDraft({
      recipient: recipient.trim(),
      subject: subject.trim(),
      body: body.trim(),
      priority,
    });
    setConfirmOpen(true);
  };

  const confirmSend = () => {
    if (pendingDraft) {
      onSendEmail(pendingDraft);
      setRecipient('');
      setSubject('');
      setBody('');
    }
    setConfirmOpen(false);
    setPendingDraft(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-cyan-900/40 flex items-center justify-between shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-slate-100 font-mono tracking-wide">
              EXECUTIVE DISPATCH // COMMUNICATIONS
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Voice-enabled email drafting, neural tone refinement, and verified dispatch
          </p>
        </div>
      </div>

      {/* Email Composer Form */}
      <form
        onSubmit={handleInitiateSend}
        className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">
            Compose Executive Communication
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-400">Tone:</span>
            {(['Formal', 'Concise', 'Diplomatic', 'Urgent'] as const).map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => setTone(t)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                  tone === t
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="sm:col-span-2">
            <label className="block text-slate-400 font-mono mb-1">To (Recipient)</label>
            <input
              type="email"
              required
              placeholder="stakeholder@enterprise.com"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-mono mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-400 font-mono"
            >
              <option value="Normal">Normal</option>
              <option value="High Priority">High Priority</option>
              <option value="Confidential">Confidential</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-slate-400 text-xs font-mono mb-1">Subject</label>
          <input
            type="text"
            required
            placeholder="e.g., Executive Strategic Initiative Q4"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-slate-400 text-xs font-mono">Message Body</label>
            <button
              type="button"
              onClick={handlePolishWithAI}
              disabled={isPolishing || !body.trim()}
              className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 disabled:opacity-40 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isPolishing ? 'Refining with ARONE...' : `Polish with AI (${tone})`}</span>
            </button>
          </div>
          <textarea
            rows={5}
            required
            placeholder="Type your message or dictate via voice: 'Draft an email to Alex saying the report is complete...'"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 leading-relaxed font-sans"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-900/30 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Review & Dispatch</span>
          </button>
        </div>
      </form>

      {/* Dispatch History & Outbox */}
      <div className="space-y-3">
        <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
          Communication Log & Outbox ({emails.length})
        </h4>

        {emails.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-950/40 border border-slate-800/60 text-slate-500 text-xs font-mono">
            No communications dispatched yet. You can ask ARONE: "Send an email to team@company.com about the project kickoff".
          </div>
        ) : (
          emails.map((mail) => (
            <div
              key={mail.id}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-900/60 transition-all space-y-2"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <h5 className="text-xs font-bold text-slate-200">{mail.subject}</h5>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40">
                      {mail.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                    To: <span className="text-cyan-300">{mail.recipient}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-500">
                    {new Date(mail.createdAt).toLocaleTimeString()}
                  </span>
                  <button
                    onClick={() => onDeleteEmail(mail.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 leading-relaxed font-sans whitespace-pre-wrap">
                {mail.body}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmOpen}
        title="Confirm Email Dispatch"
        description="Please confirm you would like ARONE to dispatch this executive communication on your behalf. This will register the outgoing transmission."
        actionLabel="Send Email"
        isDestructive={false}
        onConfirm={confirmSend}
        onCancel={() => {
          setConfirmOpen(false);
          setPendingDraft(null);
        }}
        details={
          pendingDraft
            ? {
                to: pendingDraft.recipient,
                subject: pendingDraft.subject,
                priority: pendingDraft.priority,
              }
            : undefined
        }
      />
    </div>
  );
};
