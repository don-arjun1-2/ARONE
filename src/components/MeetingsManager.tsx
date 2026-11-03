import React, { useState } from 'react';
import { Calendar, Clock, Video, Users, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';

export interface MeetingItem {
  id: string;
  title: string;
  attendees: string;
  scheduledTime: string;
  duration: string;
  location: string;
  status: string;
  agenda?: string;
}

interface MeetingsManagerProps {
  meetings: MeetingItem[];
  onScheduleMeeting: (meeting: Omit<MeetingItem, 'id'>) => void;
  onCancelMeeting: (meetingId: string) => void;
}

export const MeetingsManager: React.FC<MeetingsManagerProps> = ({
  meetings,
  onScheduleMeeting,
  onCancelMeeting,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [attendees, setAttendees] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [duration, setDuration] = useState('30m');
  const [agenda, setAgenda] = useState('');

  // Confirmation modal
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [meetingToCancel, setMeetingToCancel] = useState<MeetingItem | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !scheduledTime.trim()) return;

    onScheduleMeeting({
      title: title.trim(),
      attendees: attendees.trim() || 'Executive Team',
      scheduledTime: scheduledTime.trim(),
      duration,
      location: 'Google Meet (meet.google.com/aron-sync)',
      status: 'Confirmed',
      agenda: agenda.trim() || 'Executive briefing and alignment.',
    });

    setTitle('');
    setAttendees('');
    setScheduledTime('');
    setAgenda('');
    setShowAddForm(false);
  };

  const handleCancelClick = (meeting: MeetingItem) => {
    setMeetingToCancel(meeting);
    setConfirmOpen(true);
  };

  const confirmCancel = () => {
    if (meetingToCancel) {
      onCancelMeeting(meetingToCancel.id);
    }
    setConfirmOpen(false);
    setMeetingToCancel(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-cyan-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-slate-100 font-mono tracking-wide">
              EXECUTIVE CALENDAR & BRIEFINGS
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            ARONE meeting orchestration, calendar sync, and briefing preparation
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-900/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'Close Form' : 'Schedule Meeting'}</span>
        </button>
      </div>

      {/* Schedule Form */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="p-5 rounded-2xl bg-slate-950/90 border border-cyan-800/60 space-y-4 animate-fade-in"
        >
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">
            Book New Executive Meeting
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 font-mono mb-1">Meeting Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Q4 Architectural Review"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-mono mb-1">Date & Time</label>
              <input
                type="text"
                required
                placeholder="e.g. Tomorrow at 2:00 PM"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-mono mb-1">Attendees (Comma separated)</label>
              <input
                type="text"
                placeholder="arjun@company.com, tech-leads"
                value={attendees}
                onChange={(e) => setAttendees(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-mono mb-1">Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-400"
              >
                <option value="15m">15 Minutes (Standup)</option>
                <option value="30m">30 Minutes (Standard Sync)</option>
                <option value="45m">45 Minutes</option>
                <option value="60m">1 Hour (Strategic Deep Dive)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 text-xs font-mono mb-1">Agenda / Executive Summary</label>
            <textarea
              rows={2}
              placeholder="Key objectives, discussion points, and materials to review..."
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-lg text-slate-400 text-xs hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs shadow-md"
            >
              Confirm Schedule
            </button>
          </div>
        </form>
      )}

      {/* Meetings List */}
      <div className="space-y-3">
        {meetings.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-950/40 border border-slate-800/60 text-slate-500 text-xs font-mono">
            No executive meetings scheduled. You can instruct ARONE verbally: "Schedule a sync with team tomorrow at 2 PM".
          </div>
        ) : (
          meetings.map((meeting) => (
            <div
              key={meeting.id}
              className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-800/60 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <h4 className="text-sm font-bold text-slate-100">{meeting.title}</h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                    {meeting.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono mt-1">
                  <span className="flex items-center gap-1 text-cyan-300">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" /> {meeting.scheduledTime} ({meeting.duration})
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-500" /> {meeting.attendees}
                  </span>
                  <span className="flex items-center gap-1 text-blue-300">
                    <Video className="w-3.5 h-3.5 text-blue-400" /> {meeting.location}
                  </span>
                </div>

                {meeting.agenda && (
                  <p className="text-xs text-slate-400 mt-2 pl-4 border-l-2 border-cyan-800/60">
                    {meeting.agenda}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 self-end md:self-center">
                <button
                  onClick={() => handleCancelClick(meeting)}
                  className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                  title="Cancel Meeting"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmOpen}
        title="Confirm Meeting Cancellation"
        description="Are you sure you want to cancel this meeting? Notification alerts will be dispatched to attendees."
        actionLabel="Cancel Meeting"
        isDestructive={true}
        onConfirm={confirmCancel}
        onCancel={() => {
          setConfirmOpen(false);
          setMeetingToCancel(null);
        }}
        details={
          meetingToCancel
            ? {
                title: meetingToCancel.title,
                time: meetingToCancel.scheduledTime,
                attendees: meetingToCancel.attendees,
              }
            : undefined
        }
      />
    </div>
  );
};
