import test from 'node:test';
import assert from 'node:assert/strict';
import { encryptLog, decryptLog, computeHash, bufferToHex, hexToBuffer } from './crypto';

test('bufferToHex and hexToBuffer are inverse operations', () => {
  const original = new Uint8Array([0, 15, 255, 128, 42]);
  const hex = bufferToHex(original);
  assert.equal(hex, '000fff802a');
  const restored = hexToBuffer(hex);
  assert.deepEqual(Array.from(restored), Array.from(original));
});

test('computeHash produces deterministic SHA-256 hex string', async () => {
  const hash1 = await computeHash('ARONE System Directive: Execute Protocol Alpha');
  const hash2 = await computeHash('ARONE System Directive: Execute Protocol Alpha');
  const hash3 = await computeHash('Different text');

  assert.equal(typeof hash1, 'string');
  assert.equal(hash1.length, 64);
  assert.equal(hash1, hash2);
  assert.notEqual(hash1, hash3);
});

test('encryptLog and decryptLog successfully encrypt and decrypt with passphrase', async () => {
  const secretLog = 'User instructed: Schedule meeting with Stark Industries tomorrow at 3 PM.';
  const passphrase = 'JARVIS_MASTER_CIPHER_982';

  const encrypted = await encryptLog(secretLog, passphrase);
  assert.ok(encrypted.ciphertext);
  assert.ok(encrypted.iv);
  assert.ok(encrypted.salt);
  assert.ok(encrypted.hashSignature);
  assert.notEqual(encrypted.ciphertext, secretLog);

  const decrypted = await decryptLog(encrypted, passphrase);
  assert.equal(decrypted.text, secretLog);
  assert.equal(decrypted.verified, true);
});

test('decryptLog fails with invalid passphrase', async () => {
  const secretLog = 'Confidential executive interaction log.';
  const passphrase = 'Correct_Password_123';
  const wrongPassphrase = 'Wrong_Password_456';

  const encrypted = await encryptLog(secretLog, passphrase);

  await assert.rejects(
    async () => {
      await decryptLog(encrypted, wrongPassphrase);
    },
    /operation failed/i
  );
});

test('decryptLog detects payload tampering when hashSignature is modified', async () => {
  const secretLog = 'Smart home perimeter armed.';
  const passphrase = 'Key_Alpha_Omega';

  const encrypted = await encryptLog(secretLog, passphrase);
  encrypted.hashSignature = '0000000000000000000000000000000000000000000000000000000000000000';

  const result = await decryptLog(encrypted, passphrase);
  assert.equal(result.text, secretLog);
  assert.equal(result.verified, false);
});
