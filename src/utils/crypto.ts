/**
 * Cryptographic Utility for ARONE Encrypted Daily Interaction Logs
 * Uses AES-GCM 256-bit with PBKDF2 key derivation from a user master key/passphrase.
 */

// Helper to access subtle crypto across Node.js test environment and modern browser
const getSubtle = (): SubtleCrypto => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    return window.crypto.subtle;
  }
  if (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.subtle) {
    return globalThis.crypto.subtle;
  }
  throw new Error('Web Crypto API is not available');
};

const getRandomValues = (array: Uint8Array): Uint8Array => {
  if (typeof window !== 'undefined' && window.crypto) {
    return window.crypto.getRandomValues(array as any) as unknown as Uint8Array;
  }
  if (typeof globalThis !== 'undefined' && globalThis.crypto) {
    return (globalThis.crypto as any).getRandomValues(array as any) as Uint8Array;
  }
  throw new Error('Web Crypto API is not available');
};

// Convert array buffer to hex string
export function bufferToHex(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Convert hex string to Uint8Array
export function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

// Derive a 256-bit AES-GCM key from a passphrase and salt using PBKDF2
export async function deriveKey(passphrase: string, saltHex: string): Promise<CryptoKey> {
  const subtle = getSubtle();
  const enc = new TextEncoder();
  const keyMaterial = await subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const saltBuffer = hexToBuffer(saltHex);

  return subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// Generate random salt (16 bytes) as hex
export function generateSalt(): string {
  const salt = new Uint8Array(16);
  getRandomValues(salt);
  return bufferToHex(salt);
}

// Generate random IV (12 bytes for AES-GCM) as hex
export function generateIV(): string {
  const iv = new Uint8Array(12);
  getRandomValues(iv);
  return bufferToHex(iv);
}

// Compute SHA-256 hash of a string
export async function computeHash(data: string): Promise<string> {
  const subtle = getSubtle();
  const enc = new TextEncoder();
  const hashBuffer = await subtle.digest('SHA-256', enc.encode(data));
  return bufferToHex(hashBuffer);
}

export interface EncryptedData {
  ciphertext: string;
  iv: string;
  salt: string;
  hashSignature: string;
}

// Encrypt plaintext with passphrase
export async function encryptLog(plaintext: string, passphrase: string): Promise<EncryptedData> {
  const subtle = getSubtle();
  const salt = generateSalt();
  const iv = generateIV();
  const key = await deriveKey(passphrase, salt);
  const enc = new TextEncoder();
  const plaintextBuffer = enc.encode(plaintext);

  const ciphertextBuffer = await subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: hexToBuffer(iv) as BufferSource,
    },
    key,
    plaintextBuffer
  );

  const ciphertext = bufferToHex(ciphertextBuffer);
  const hashSignature = await computeHash(plaintext);

  return {
    ciphertext,
    iv,
    salt,
    hashSignature,
  };
}

// Decrypt ciphertext with passphrase and verify integrity
export async function decryptLog(
  encrypted: { ciphertext: string; iv: string; salt: string; hashSignature?: string },
  passphrase: string
): Promise<{ text: string; verified: boolean }> {
  const subtle = getSubtle();
  const key = await deriveKey(passphrase, encrypted.salt);
  const ciphertextBuffer = hexToBuffer(encrypted.ciphertext);

  const decryptedBuffer = await subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: hexToBuffer(encrypted.iv) as BufferSource,
    },
    key,
    ciphertextBuffer as BufferSource
  );

  const dec = new TextDecoder();
  const text = dec.decode(decryptedBuffer);

  let verified = true;
  if (encrypted.hashSignature) {
    const computed = await computeHash(text);
    verified = computed === encrypted.hashSignature;
  }

  return { text, verified };
}
