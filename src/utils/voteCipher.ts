import { UserOnStory } from '@/types';
import { isNumber } from '@/utils/isNumber';

/**
 * Lightweight obfuscation of vote values.
 *
 * Votes are encrypted with AES-GCM before being written to `UsersOnStories`,
 * so the raw numbers are not readable from the realtime websocket frames or
 * REST responses in the browser devtools. A random IV is generated for every
 * encryption, so the same vote produces a different ciphertext every time and
 * cannot be matched by comparing payloads.
 *
 * This is intentionally NOT a security boundary: the key lives in the client
 * bundle and anyone determined enough can decrypt the values. The goal is only
 * to keep the numbers from being visible at a glance.
 */

const DEFAULT_SECRET = 'polly-planning-poker-vote-cipher-v1';
const SECRET = process.env.NEXT_PUBLIC_VOTE_CIPHER_SECRET || DEFAULT_SECRET;
const IV_LENGTH = 12;
// Plaintext is padded to a fixed width so that every ciphertext has the same
// length; otherwise "1" and "1.25" would be distinguishable by payload size.
const PLAINTEXT_LENGTH = 16;

let keyPromise: Promise<CryptoKey> | null = null;

const getSubtle = (): SubtleCrypto => {
    const subtle = globalThis.crypto?.subtle;
    if (!subtle) {
        throw new Error('Web Crypto API is not available in this environment');
    }
    return subtle;
};

const getKey = (): Promise<CryptoKey> => {
    if (!keyPromise) {
        keyPromise = (async () => {
            const subtle = getSubtle();
            const digest = await subtle.digest('SHA-256', new TextEncoder().encode(SECRET));
            return subtle.importKey('raw', digest, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
        })();
    }
    return keyPromise;
};

const toBase64 = (bytes: Uint8Array): string => {
    let binary = '';
    bytes.forEach((byte) => {
        binary += String.fromCharCode(byte);
    });
    return btoa(binary);
};

const fromBase64 = (base64: string): Uint8Array => {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
};

export const encryptVote = async (value: number): Promise<string> => {
    const subtle = getSubtle();
    const key = await getKey();
    const iv = globalThis.crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const encoded = new TextEncoder().encode(String(value).padEnd(PLAINTEXT_LENGTH, ' '));
    const cipher = new Uint8Array(await subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded));

    const payload = new Uint8Array(iv.length + cipher.length);
    payload.set(iv, 0);
    payload.set(cipher, iv.length);

    return toBase64(payload);
};

export const decryptVote = async (encrypted: string | null | undefined): Promise<number | null> => {
    if (!encrypted) {
        return null;
    }
    try {
        const subtle = getSubtle();
        const key = await getKey();
        const payload = fromBase64(encrypted);
        const iv = payload.slice(0, IV_LENGTH);
        const cipher = payload.slice(IV_LENGTH);
        const plain = new TextDecoder().decode(await subtle.decrypt({ name: 'AES-GCM', iv }, key, cipher));
        const trimmed = plain.trim();
        const value = trimmed === '' ? NaN : Number(trimmed);
        return isNumber(value) ? value : null;
    } catch (error) {
        console.error('Failed to decrypt vote value', error);
        return null;
    }
};

/**
 * Resolves the plain numeric `value` of a `UsersOnStories` row: decrypts
 * `encrypted_value` when present, otherwise falls back to the legacy plain
 * `value` column (rows created before encryption was introduced).
 */
export const decodeUserOnStory = async (row: UserOnStory): Promise<UserOnStory> => {
    if (row.encrypted_value) {
        return { ...row, value: await decryptVote(row.encrypted_value) };
    }
    return row;
};

export const decodeUsersOnStory = (rows: UserOnStory[]): Promise<UserOnStory[]> => {
    return Promise.all(rows.map(decodeUserOnStory));
};
