import { RoomCode } from '../model/types';

/**
 * Room-code generation + normalization. The room code is the rendezvous secret
 * shared out-of-band; it is NOT the security anchor (the SAS safety code is).
 * Even so we want decent entropy so codes aren't guessable.
 *
 * Excludes visually ambiguous characters (0/O, 1/I) for easy reading aloud.
 */
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 32 symbols → 5 bits each

/** 8 symbols ≈ 40 bits of entropy — fine for a short-lived room. */
export function generateRoomCode(length = 8): RoomCode {
  const bytes = randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i++) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return out;
}

/** Normalize user-typed input so "abc-1 23" and "ABC123" resolve to one room. */
export function normalizeRoomCode(input: string): RoomCode {
  return input
    .toUpperCase()
    .split('')
    .filter(ch => ALPHABET.includes(ch))
    .join('');
}

type RandomSource = { getRandomValues?: (array: Uint8Array) => void };

function randomBytes(n: number): Uint8Array {
  const arr = new Uint8Array(n);
  const cryptoObj = (globalThis as { crypto?: RandomSource }).crypto;
  if (cryptoObj?.getRandomValues) {
    cryptoObj.getRandomValues(arr);
    return arr;
  }
  // FALLBACK: not cryptographically secure. Before release, install
  // `react-native-get-random-values` (imported once at app entry) so the
  // branch above is always taken.
  for (let i = 0; i < n; i++) {
    arr[i] = Math.floor(Math.random() * 256);
  }
  return arr;
}
