import test from 'node:test';
import assert from 'node:assert/strict';
import { computeDailyInsight } from './telemetryInsight';

test('identifies Smart Home as most frequent category when smart_home logs dominate', () => {
  const logs = [
    { actionType: 'smart_home', summary: 'Turn on lights' },
    { actionType: 'smart_home', summary: 'Set temp to 72' },
    { actionType: 'smart_home', summary: 'Lock door' },
    { actionType: 'send_email', summary: 'Send status update' },
    { actionType: 'schedule_meeting', summary: 'Sync with team' },
  ];

  const insight = computeDailyInsight(logs);
  assert.equal(insight.mostFrequentCategory, 'Smart Home');
  assert.equal(insight.count, 3);
  assert.equal(insight.totalInteractions, 5);
  assert.equal(insight.percentage, 60);
  assert.ok(insight.summary.includes('Smart Home represents your primary activity'));
});

test('identifies Email as most frequent category when send_email logs dominate', () => {
  const logs = [
    { actionType: 'send_email', summary: 'Email Board' },
    { actionType: 'send_email', summary: 'Email Legal' },
    { actionType: 'send_email', summary: 'Email CTO' },
    { actionType: 'smart_home', summary: 'Dim lights' },
  ];

  const insight = computeDailyInsight(logs);
  assert.equal(insight.mostFrequentCategory, 'Email');
  assert.equal(insight.count, 3);
  assert.equal(insight.totalInteractions, 4);
  assert.equal(insight.percentage, 75);
  assert.ok(insight.summary.includes('Email communications dominate'));
});

test('falls back gracefully to current state data when interaction log list is empty', () => {
  const fallback = {
    smartHomeOperations: 5,
    emailCount: 1,
    meetingsCount: 2,
    tasksCount: 1,
    voiceDirectivesCount: 0,
  };

  const insight = computeDailyInsight([], fallback);
  assert.equal(insight.mostFrequentCategory, 'Smart Home');
  assert.equal(insight.count, 5);
  assert.equal(insight.totalInteractions, 9);
  assert.equal(insight.percentage, 56);
});

test('handles zero count cleanly with safe defaults', () => {
  const insight = computeDailyInsight([], {});
  assert.equal(insight.totalInteractions, 0);
  assert.equal(insight.count, 0);
  assert.equal(typeof insight.summary, 'string');
});
