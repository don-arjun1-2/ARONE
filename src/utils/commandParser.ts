/**
 * Natural language command parser and intent extractor for ARONE
 * Dispatches commands for smart home, meetings, emails, tasks, and web queries.
 */

export type CommandIntentType =
  | 'smart_home'
  | 'schedule_meeting'
  | 'send_email'
  | 'task_create'
  | 'maps_query'
  | 'search_query'
  | 'general_chat';

export interface ParsedCommand {
  type: CommandIntentType;
  confidence: number;
  parameters: Record<string, any>;
  originalText: string;
}

export function parseUserCommand(input: string): ParsedCommand {
  const text = input.trim();
  const lower = text.toLowerCase();

  // 1. Smart home patterns: "turn on lights", "dim living room to 40%", "set thermostat to 72", "lock front door", "arm security"
  if (
    lower.includes('turn on') ||
    lower.includes('turn off') ||
    lower.includes('switch on') ||
    lower.includes('switch off') ||
    lower.includes('lights') ||
    lower.includes('temperature') ||
    lower.includes('thermostat') ||
    lower.includes('lock') ||
    lower.includes('unlock') ||
    lower.includes('climate') ||
    lower.includes('home mode') ||
    lower.includes('away mode') ||
    lower.includes('night protocol') ||
    lower.includes('party mode')
  ) {
    const action = lower.includes('turn off') || lower.includes('switch off') || lower.includes('lock') ? 'toggle_off' : 'toggle_on';
    let room = 'all';
    if (lower.includes('living room')) room = 'Living Room';
    else if (lower.includes('office') || lower.includes('study')) room = 'Executive Office';
    else if (lower.includes('bedroom') || lower.includes('suite')) room = 'Master Suite';
    else if (lower.includes('kitchen')) room = 'Kitchen';

    // Temp check
    const tempMatch = lower.match(/(?:set|change).*?(?:to|at)\s*(\d{2})/);
    const targetTemp = tempMatch ? parseInt(tempMatch[1], 10) : undefined;

    return {
      type: 'smart_home',
      confidence: 0.95,
      parameters: {
        action,
        room,
        targetTemp,
        rawQuery: text,
      },
      originalText: text,
    };
  }

  // 2. Schedule meeting patterns: "schedule a meeting with...", "set up a call with...", "book meeting"
  if (
    lower.startsWith('schedule') ||
    lower.startsWith('book') ||
    lower.includes('meeting') ||
    lower.includes('set up a call') ||
    lower.includes('calendar invite')
  ) {
    // Extract attendee / title
    const withMatch = text.match(/(?:meeting|call)\s+(?:with\s+)?([^,]+?)(?:\s+(?:at|on|tomorrow|next)\s+|$)/i);
    const title = withMatch ? withMatch[1].trim() : 'Executive Sync';

    // Extract time
    const timeMatch = text.match(/(?:at|on)\s+([0-9]{1,2}(?::[0-9]{2})?\s*(?:am|pm)?|tomorrow|today)/i);
    const scheduledTime = timeMatch ? timeMatch[1].trim() : 'Tomorrow at 10:00 AM';

    return {
      type: 'schedule_meeting',
      confidence: 0.9,
      parameters: {
        title: title.startsWith('with') ? title : `Meeting with ${title}`,
        scheduledTime,
        location: 'Virtual / Google Meet',
      },
      originalText: text,
    };
  }

  // 3. Email patterns: "send an email to...", "draft email to...", "email arjun..."
  if (
    lower.startsWith('send an email') ||
    lower.startsWith('send email') ||
    lower.startsWith('draft an email') ||
    lower.startsWith('draft email') ||
    lower.includes('email to')
  ) {
    const toMatch = text.match(/(?:to\s+)([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|[A-Za-z\s]+?)(?:\s+about|\s+regarding|\s+saying|$)/i);
    const recipient = toMatch ? toMatch[1].trim() : 'team@company.com';

    const aboutMatch = text.match(/(?:about|regarding|saying)\s+(.*)/i);
    const subject = aboutMatch ? aboutMatch[1].trim() : 'Follow-up regarding project status';

    return {
      type: 'send_email',
      confidence: 0.92,
      parameters: {
        recipient,
        subject,
      },
      originalText: text,
    };
  }

  // 4. Tasks patterns: "add task...", "remind me to...", "create to-do...", "add to my tasks..."
  if (
    lower.startsWith('add task') ||
    lower.startsWith('create task') ||
    lower.startsWith('remind me to') ||
    lower.includes('to-do') ||
    lower.includes('add to tasks') ||
    lower.includes('google tasks')
  ) {
    const taskMatch = text.replace(/^(add task|create task|remind me to|add to tasks|add to my tasks):?\s*/i, '');
    return {
      type: 'task_create',
      confidence: 0.93,
      parameters: {
        title: taskMatch || 'New Task Item',
        dueDate: 'Today',
      },
      originalText: text,
    };
  }

  // 5. Maps Grounding query patterns: "find restaurants near...", "where is the closest...", "maps for..."
  if (
    lower.includes('near me') ||
    lower.includes('closest') ||
    lower.includes('nearby') ||
    lower.includes('directions to') ||
    lower.includes('navigate to') ||
    lower.includes('restaurants near') ||
    lower.includes('coffee shop near') ||
    lower.includes('where is')
  ) {
    return {
      type: 'maps_query',
      confidence: 0.88,
      parameters: {
        locationQuery: text,
      },
      originalText: text,
    };
  }

  // 6. Search Grounding query patterns: "what is the latest news...", "who won...", "search for..."
  if (
    lower.startsWith('search') ||
    lower.includes('latest news') ||
    lower.includes('current stock price') ||
    lower.includes('weather today') ||
    lower.includes('who won') ||
    lower.includes('recent news')
  ) {
    return {
      type: 'search_query',
      confidence: 0.85,
      parameters: {
        searchQuery: text.replace(/^search (for\s+)?/i, ''),
      },
      originalText: text,
    };
  }

  return {
    type: 'general_chat',
    confidence: 0.8,
    parameters: {
      query: text,
    },
    originalText: text,
  };
}
