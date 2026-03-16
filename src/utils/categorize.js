/**
 * Lightweight NLP categorizer.
 * Classifies a raw text input into one of: 'Task', 'Reminder', or 'Note'.
 *
 * JSON schema for a captured item:
 * {
 *   id:        string   – UUID v4
 *   type:      'Task' | 'Reminder' | 'Note'
 *   content:   string   – original text
 *   createdAt: string   – ISO 8601 timestamp
 *   metadata: {
 *     priority?: 'high' | 'medium' | 'low'   (Task only)
 *     dueHint?:  string                        (Reminder only)
 *     tags:      string[]
 *   }
 * }
 */

// ── Pattern banks ──────────────────────────────────────────────────────────────

const REMINDER_PATTERNS = [
  /\bremind\b/i,
  /\breminder\b/i,
  /\balert\b/i,
  /\bat\s+\d/i,
  /\bby\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
  /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
  /\btoday\b/i,
  /\btonight\b/i,
  /\btomorrow\b/i,
  /\bnext\s+week\b/i,
  /\bnext\s+month\b/i,
  /\bin\s+\d+\s+(hour|minute|day|week|month)s?\b/i,
  /\bscheduled?\b/i,
  /\bdon't\s+forget\b/i,
  /\bdo\s+not\s+forget\b/i,
  /\bdue\b/i,
  /\bdeadline\b/i,
  /\bam\b|\bpm\b/i,
];

const TASK_PATTERNS = [
  /\bneed\s+to\b/i,
  /\bhave\s+to\b/i,
  /\bhas\s+to\b/i,
  /\bmust\b/i,
  /\bshould\b/i,
  /\bcomplete\b/i,
  /\bfinish\b/i,
  /\bdo\b/i,
  /\bfix\b/i,
  /\bbuy\b/i,
  /\bsend\b/i,
  /\bcall\b/i,
  /\bwrite\b/i,
  /\breview\b/i,
  /\bupdate\b/i,
  /\bsubmit\b/i,
  /\bprepare\b/i,
  /\bcheck\b/i,
  /\bfollow\s+up\b/i,
  /\borganize\b/i,
  /\bclean\b/i,
  /\bschedule\b/i,
  /\bbook\b/i,
  /\border\b/i,
  /\bpay\b/i,
  /\bpick\s+up\b/i,
  /\bdrop\s+off\b/i,
  /\bwrap\b/i,
  /\bdeploy\b/i,
  /\bmerge\b/i,
  /\bpush\b/i,
  /\bpull\b/i,
  /\btest\b/i,
];

const HIGH_PRIORITY_PATTERNS = [
  /\burgent\b/i,
  /\basap\b/i,
  /\bcritical\b/i,
  /\bimportant\b/i,
  /\bhigh.priority\b/i,
  /\bpriority\b/i,
];

const LOW_PRIORITY_PATTERNS = [
  /\bsometime\b/i,
  /\bwhenever\b/i,
  /\blow.priority\b/i,
  /\bno\s+rush\b/i,
  /\bif\s+possible\b/i,
  /\bmaybe\b/i,
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function score(text, patterns) {
  return patterns.filter((p) => p.test(text)).length;
}

function extractDueHint(text) {
  const timePatterns = [
    /\btomorrow\b/i,
    /\btonight\b/i,
    /\btoday\b/i,
    /\bnext\s+week\b/i,
    /\bnext\s+month\b/i,
    /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
    /\bat\s+\d+(?::\d+)?\s*(?:am|pm)?\b/i,
    /\bin\s+\d+\s+(?:hour|minute|day|week)s?\b/i,
    /\bby\s+\w+/i,
  ];
  for (const p of timePatterns) {
    const m = text.match(p);
    if (m) return m[0];
  }
  return null;
}

function extractTags(text) {
  const tags = [];
  const matches = text.match(/#\w+/g);
  if (matches) tags.push(...matches.map((t) => t.slice(1).toLowerCase()));
  return tags;
}

function determinePriority(text) {
  if (score(text, HIGH_PRIORITY_PATTERNS) > 0) return 'high';
  if (score(text, LOW_PRIORITY_PATTERNS) > 0) return 'low';
  return 'medium';
}

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ── Main export ────────────────────────────────────────────────────────────────

/**
 * Categorize a raw text string and return a structured item object.
 * @param {string} text
 * @returns {import('./types').BraindumpItem}
 */
export function categorize(text) {
  const trimmed = text.trim();
  const reminderScore = score(trimmed, REMINDER_PATTERNS);
  const taskScore = score(trimmed, TASK_PATTERNS);

  let type;
  if (reminderScore >= 2) {
    type = 'Reminder';
  } else if (reminderScore > 0 && taskScore === 0) {
    type = 'Reminder';
  } else if (taskScore > 0) {
    type = 'Task';
  } else {
    type = 'Note';
  }

  const tags = extractTags(trimmed);
  const metadata = { tags };

  if (type === 'Task') {
    metadata.priority = determinePriority(trimmed);
  } else if (type === 'Reminder') {
    const dueHint = extractDueHint(trimmed);
    if (dueHint) metadata.dueHint = dueHint;
  }

  return {
    id: uuid(),
    type,
    content: trimmed,
    createdAt: new Date().toISOString(),
    metadata,
  };
}
