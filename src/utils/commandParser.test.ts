import test from 'node:test';
import assert from 'node:assert/strict';
import { parseUserCommand } from './commandParser';

test('detects smart home commands correctly', () => {
  const result1 = parseUserCommand('Turn off the lights in the living room');
  assert.equal(result1.type, 'smart_home');
  assert.equal(result1.parameters.action, 'toggle_off');
  assert.equal(result1.parameters.room, 'Living Room');

  const result2 = parseUserCommand('Set temperature in the bedroom to 68');
  assert.equal(result2.type, 'smart_home');
  assert.equal(result2.parameters.room, 'Master Suite');
  assert.equal(result2.parameters.targetTemp, 68);

  const result3 = parseUserCommand('Lock the front door');
  assert.equal(result3.type, 'smart_home');
  assert.equal(result3.parameters.action, 'toggle_off');
});

test('detects meeting scheduling commands correctly', () => {
  const result = parseUserCommand('Schedule a meeting with Board of Directors tomorrow at 2 PM');
  assert.equal(result.type, 'schedule_meeting');
  assert.ok(result.parameters.title.includes('Board of Directors'));
  assert.ok(result.parameters.scheduledTime.includes('2 PM'));
});

test('detects email composition commands correctly', () => {
  const result = parseUserCommand('Draft an email to ceo@acme.com regarding Q4 Roadmap Launch');
  assert.equal(result.type, 'send_email');
  assert.equal(result.parameters.recipient, 'ceo@acme.com');
  assert.ok(result.parameters.subject.includes('Q4 Roadmap Launch'));
});

test('detects task creation commands correctly', () => {
  const result = parseUserCommand('Remind me to review the security architecture deck');
  assert.equal(result.type, 'task_create');
  assert.equal(result.parameters.title, 'review the security architecture deck');
});

test('detects maps and search queries correctly', () => {
  const mapCmd = parseUserCommand('Find coffee shops near me');
  assert.equal(mapCmd.type, 'maps_query');

  const searchCmd = parseUserCommand('What is the latest news on quantum computing breakthroughs?');
  assert.equal(searchCmd.type, 'search_query');
});
