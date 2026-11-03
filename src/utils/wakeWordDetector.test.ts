import test from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizeWakeWord,
  detectWakeWord,
  DEFAULT_WAKE_WORD,
} from './wakeWordDetector';

test('sanitizeWakeWord cleans and uppercases input', () => {
  assert.equal(sanitizeWakeWord('arone'), 'ARONE');
  assert.equal(sanitizeWakeWord('  jarvis!  '), 'JARVIS');
  assert.equal(sanitizeWakeWord('friday_v2'), 'FRIDAY_V2');
  assert.equal(sanitizeWakeWord('a'), DEFAULT_WAKE_WORD);
  assert.equal(sanitizeWakeWord(''), DEFAULT_WAKE_WORD);
});

test('detectWakeWord detects ARONE with direct command', () => {
  const result = detectWakeWord('ARONE turn on the lights', 'ARONE');
  assert.equal(result.detected, true);
  assert.equal(result.command, 'turn on the lights');
});

test('detectWakeWord handles conversational prefix like Hey ARONE', () => {
  const result = detectWakeWord('Hey ARONE, what is the reactor status?', 'ARONE');
  assert.equal(result.detected, true);
  assert.equal(result.command, "what is the reactor status");
});

test('detectWakeWord handles OK ARONE or HELLO ARONE', () => {
  const result1 = detectWakeWord('OK ARONE schedule a meeting', 'ARONE');
  assert.equal(result1.detected, true);
  assert.equal(result1.command, 'schedule a meeting');

  const result2 = detectWakeWord('Hello ARONE', 'ARONE');
  assert.equal(result2.detected, true);
  assert.equal(result2.command, '');
});

test('detectWakeWord handles custom wake words like JARVIS and FRIDAY', () => {
  const jarvisResult = detectWakeWord('Jarvis, initiate deep focus protocol', 'JARVIS');
  assert.equal(jarvisResult.detected, true);
  assert.equal(jarvisResult.command, 'initiate deep focus protocol');

  const fridayResult = detectWakeWord('FRIDAY scan perimeter security', 'FRIDAY');
  assert.equal(fridayResult.detected, true);
  assert.equal(fridayResult.command, 'scan perimeter security');
});

test('detectWakeWord does not trigger on unrelated speech', () => {
  const result = detectWakeWord('The weather today is cloudy with light rain', 'ARONE');
  assert.equal(result.detected, false);
  assert.equal(result.command, '');
});
