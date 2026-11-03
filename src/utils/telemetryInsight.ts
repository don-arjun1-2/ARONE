/**
 * Pure calculation logic for computing the Daily Insight telemetry
 * Analyzes interaction frequency across categories from current state data.
 */

export interface InteractionLogRecord {
  actionType?: string;
  summary?: string;
  timestamp?: string;
}

export interface StateMetricsFallback {
  smartHomeOperations?: number;
  emailCount?: number;
  meetingsCount?: number;
  tasksCount?: number;
  voiceDirectivesCount?: number;
}

export interface CategoryStat {
  category: string;
  key: string;
  count: number;
  percentage: number;
}

export interface DailyInsightResult {
  mostFrequentCategory: string;
  count: number;
  totalInteractions: number;
  percentage: number;
  summary: string;
  distribution: CategoryStat[];
}

const CATEGORY_MAP: Record<string, string> = {
  smart_home: 'Smart Home',
  send_email: 'Email',
  email: 'Email',
  schedule_meeting: 'Meetings',
  meeting: 'Meetings',
  task_action: 'Google Tasks',
  task: 'Google Tasks',
  voice_command: 'Voice Directives',
  general_chat: 'AI Inquiries',
};

export function computeDailyInsight(
  logs: InteractionLogRecord[] = [],
  fallbackMetrics: StateMetricsFallback = {}
): DailyInsightResult {
  const counts: Record<string, number> = {
    'Smart Home': 0,
    'Email': 0,
    'Meetings': 0,
    'Google Tasks': 0,
    'Voice Directives': 0,
  };

  // 1. Tally from actual logs if available
  if (logs && logs.length > 0) {
    for (const log of logs) {
      const type = (log.actionType || '').toLowerCase();
      const mapped = CATEGORY_MAP[type] || 'Voice Directives';
      counts[mapped] = (counts[mapped] || 0) + 1;
    }
  } else {
    // 2. Fallback to state metrics counts if no interactions have been logged yet
    counts['Smart Home'] = fallbackMetrics.smartHomeOperations ?? 0;
    counts['Email'] = fallbackMetrics.emailCount ?? 0;
    counts['Meetings'] = fallbackMetrics.meetingsCount ?? 0;
    counts['Google Tasks'] = fallbackMetrics.tasksCount ?? 0;
    counts['Voice Directives'] = fallbackMetrics.voiceDirectivesCount ?? 0;
  }

  const total = Object.values(counts).reduce((acc, curr) => acc + curr, 0);

  // If completely empty, default to Smart Home baseline
  if (total === 0) {
    return {
      mostFrequentCategory: 'Smart Home',
      count: 0,
      totalInteractions: 0,
      percentage: 0,
      summary: 'Awaiting daily interactions. Directives will be analyzed dynamically.',
      distribution: Object.entries(counts).map(([cat, c]) => ({
        category: cat,
        key: cat.toLowerCase().replace(/\s+/g, '_'),
        count: c,
        percentage: 0,
      })),
    };
  }

  // Find category with highest count
  let topCategory = 'Smart Home';
  let maxCount = -1;

  for (const [cat, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count;
      topCategory = cat;
    }
  }

  const percentage = Math.round((maxCount / total) * 100);

  const distribution: CategoryStat[] = Object.entries(counts)
    .map(([cat, count]) => ({
      category: cat,
      key: cat.toLowerCase().replace(/\s+/g, '_'),
      count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  let summary = '';
  switch (topCategory) {
    case 'Smart Home':
      summary = `Smart Home represents your primary activity (${percentage}% of directives). Environmental and IoT automation is heavily utilized.`;
      break;
    case 'Email':
      summary = `Email communications dominate your workflow (${percentage}% of directives). Executive correspondence is your main priority.`;
      break;
    case 'Meetings':
      summary = `Meetings and briefing coordination account for ${percentage}% of directives. Executive calendar management is high.`;
      break;
    case 'Google Tasks':
      summary = `Google Tasks synchronization represents ${percentage}% of operations. High action-item throughput detected.`;
      break;
    default:
      summary = `Voice Directives & Intel queries represent ${percentage}% of interactions. Real-time assistant dialogues are most frequent.`;
      break;
  }

  return {
    mostFrequentCategory: topCategory,
    count: maxCount,
    totalInteractions: total,
    percentage,
    summary,
    distribution,
  };
}
