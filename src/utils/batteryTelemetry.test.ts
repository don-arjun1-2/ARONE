import test from 'node:test';
import assert from 'node:assert/strict';
import { formatBatteryStatus } from './batteryTelemetry';

test('formats charging status correctly with charging badge and text', () => {
  const result = formatBatteryStatus({ level: 85, charging: true });
  assert.equal(result.statusBadge, 'CHARGING');
  assert.ok(result.displayText.includes('85% Charging'));
  assert.equal(result.colorClass, 'text-emerald-400');
});

test('formats nominal optimal level when not charging and level > 60', () => {
  const result = formatBatteryStatus({ level: 92, charging: false });
  assert.equal(result.statusBadge, 'OPTIMAL');
  assert.ok(result.displayText.includes('92% Nominal'));
  assert.equal(result.colorClass, 'text-cyan-300');
});

test('formats low power mode when level is low', () => {
  const result = formatBatteryStatus({ level: 18, charging: false });
  assert.equal(result.statusBadge, 'LOW POWER');
  assert.ok(result.displayText.includes('18% Low Power Mode'));
  assert.equal(result.colorClass, 'text-amber-400');
});

test('clamps boundary numbers safely between 0 and 100', () => {
  const over = formatBatteryStatus({ level: 150, charging: false });
  assert.ok(over.displayText.includes('100%'));

  const under = formatBatteryStatus({ level: -20, charging: false });
  assert.ok(under.displayText.includes('0%'));
});
