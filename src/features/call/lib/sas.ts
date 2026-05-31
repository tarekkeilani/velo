/**
 * Short Authentication String (SAS) — the security anchor of Velo.
 *
 * After the DTLS handshake, each peer knows BOTH certificate fingerprints
 * (its own + the remote one, parsed from the exchanged SDP). Both peers hash
 * the canonical (sorted) pair into a short human-comparable code. Users read
 * it aloud; if it matches, no man-in-the-middle swapped the fingerprints on
 * the signaling channel. If it differs, abort the call.
 *
 * NOTE: the digest is injected. The default `insecureFnv1aHex` is fine for
 * wiring/tests but is NOT collision-resistant — before release, inject a real
 * SHA-256 (e.g. react-native-quick-crypto) so an attacker cannot brute-force a
 * second fingerprint pair that yields the same short code.
 */
export type Digest = (input: string) => string; // returns a hex string

export function deriveSafetyCode(
  localFingerprint: string,
  remoteFingerprint: string,
  digest: Digest = insecureFnv1aHex,
): string {
  const canonical = [localFingerprint, remoteFingerprint]
    .map(fp => fp.trim().toLowerCase())
    .sort()
    .join('|');

  const hex = digest(canonical);
  // 24 bits → a stable 6-digit code, grouped for easy reading.
  const n = parseInt(hex.slice(0, 6) || '0', 16) % 1_000_000;
  const code = n.toString().padStart(6, '0');
  return `${code.slice(0, 3)} ${code.slice(3)}`;
}

/** Non-cryptographic placeholder digest. Swap for SHA-256 before release. */
/* eslint-disable no-bitwise -- hashing is inherently bitwise */
export function insecureFnv1aHex(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}
/* eslint-enable no-bitwise */
