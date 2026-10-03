import { JournalEntry, EncryptedBackupPayload } from '../types/journal';

// Helper: Uint8Array to Base64
function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Helper: Base64 to Uint8Array
function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Derive AES-GCM 256 key from passphrase using PBKDF2 (100,000 rounds)
async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as any,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export const encryptionService = {
  async encryptJournal(entries: JournalEntry[], passphrase: string): Promise<EncryptedBackupPayload> {
    if (!passphrase || passphrase.length < 4) {
      throw new Error('Passphrase must be at least 4 characters long.');
    }

    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(passphrase, salt);

    const enc = new TextEncoder();
    const dataString = JSON.stringify(entries);
    const encodedData = enc.encode(dataString);

    const ciphertextBuffer = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv as any,
      },
      key,
      encodedData
    );

    return {
      version: 1,
      algorithm: 'AES-GCM-256',
      salt: bufferToBase64(salt),
      iv: bufferToBase64(iv),
      ciphertext: bufferToBase64(ciphertextBuffer),
      entryCount: entries.length,
      exportedAt: new Date().toISOString(),
    };
  },

  async decryptJournal(payload: EncryptedBackupPayload, passphrase: string): Promise<JournalEntry[]> {
    if (!passphrase) {
      throw new Error('Please enter the encryption passphrase.');
    }

    try {
      const salt = base64ToBuffer(payload.salt);
      const iv = base64ToBuffer(payload.iv);
      const ciphertext = base64ToBuffer(payload.ciphertext);

      const key = await deriveKey(passphrase, salt);

      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv as any,
        },
        key,
        ciphertext as any
      );

      const dec = new TextDecoder();
      const jsonString = dec.decode(decryptedBuffer);
      return JSON.parse(jsonString) as JournalEntry[];
    } catch (err) {
      throw new Error('Decryption failed: Incorrect passphrase or corrupted encrypted backup.');
    }
  },
};
