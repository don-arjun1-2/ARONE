import React from 'react';
import { DailyInsightResult } from '../utils/telemetryInsight';
import {
  Sparkles,
  Radio,
  Mail,
  Calendar,
  CheckSquare,
  Mic,
  TrendingUp,
} from 'lucide-react';

interface DailyInsightCardProps {
  insight: DailyInsightResult;
}

export const DailyInsightCard: React.FC<DailyInsightCardProps> = ({ insight }) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Smart Home':
        return <Radio className="w-3.5 h-3.5 text-cyan-400" />;
      case 'Email':
        return <Mail className="w-3.5 h-3.5 text-blue-400" />;
      case 'Meetings':
        return <Calendar className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Google Tasks':
        return <CheckSquare className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <Mic className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'Smart Home':
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40';
      case 'Email':
        return 'bg-blue-950/80 text-blue-300 border-blue-500/40';
      case 'Meetings':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40';
      case 'Google Tasks':
        return 'bg-purple-950/80 text-purple-300 border-purple-500/40';
      default:
        return 'bg-amber-950/80 text-amber-300 border-amber-500/40';
    }
  };

  return (
    <div
      data-testid="daily-insight-card"
      className="mt-3 p-3.5 rounded-xl bg-gradient-to-br from-slate-950/90 to-slate-900/90 border border-cyan-900/50 shadow-inner space-y-2.5"
    >
      {/* Subheader */}
      <div className="flex items-center justify-between text-[11px] font-mono">
        <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
          <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
          <span>DAILY INSIGHT</span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono tracking-tight">
          FREQUENCY METRICS
        </span>
      </div>

      {/* Focus Category Banner */}
      <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-900/80 border border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-slate-950 border border-slate-800">
            {getCategoryIcon(insight.mostFrequentCategory)}
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-mono uppercase block leading-none">
              Top Interaction Category
            </span>
            <span className="text-xs font-bold text-slate-100 font-sans">
              {insight.mostFrequentCategory}
            </span>
          </div>
        </div>

        <span
          className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold ${getCategoryBadgeColor(
            insight.mostFrequentCategory
          )}`}
        >
          {insight.percentage}% of Activity
        </span>
      </div>

      {/* AI Summary Observation */}
      <p className="text-[11px] text-slate-300 leading-relaxed font-sans pl-2 border-l-2 border-cyan-500/60">
        {insight.summary}
      </p>

      {/* Category breakdown bar & pills */}
      <div className="pt-1.5 border-t border-slate-800/80">
        <div className="text-[10px] font-mono text-slate-400 mb-1.5 flex justify-between">
          <span>Interaction Distribution:</span>
          <span className="text-cyan-400 font-bold">{insight.totalInteractions} total recorded</span>
        </div>

        {/* Multi-segment progress bar */}
        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden flex gap-0.5">
          {insight.distribution.map((item) => {
            if (item.percentage === 0) return null;
            let barColor = 'bg-slate-600';
            if (item.category === 'Smart Home') barColor = 'bg-cyan-400';
            else if (item.category === 'Email') barColor = 'bg-blue-400';
            else if (item.category === 'Meetings') barColor = 'bg-emerald-400';
            else if (item.category === 'Google Tasks') barColor = 'bg-purple-400';
            else if (item.category === 'Voice Directives') barColor = 'bg-amber-400';

            return (
              <div
                key={item.category}
                style={{ width: `${item.percentage}%` }}
                className={`h-full ${barColor}`}
                title={`${item.category}: ${item.count} (${item.percentage}%)`}
              />
            );
          })}
        </div>

        {/* Category Pills List */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {insight.distribution.slice(0, 4).map((item) => (
            <span
              key={item.category}
              className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 flex items-center gap-1"
            >
              <span className="text-slate-300 font-medium">{item.category}:</span>
              <span className="text-cyan-300 font-bold">{item.count}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
