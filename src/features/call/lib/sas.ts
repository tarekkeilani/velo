/**
 * Short Authentication String (SAS) — the security anchor of Velo.
 *
 * After the DTLS handshake, each peer knows BOTH certificate fingerprints
 * (its own + the remote one, parsed from the exchanged SDP). Both peers hash
 * the canonical (sorted) pair into a short human-comparable code. Users read
 * it aloud; if it matches, no man-in-the-middle swapped the fingerprints on
 * the signaling channel. If it differs, abort the call.
 *
 * The digest is injected (and REQUIRED — no insecure default) so the security
 * dependency is explicit. Production passes a cryptographic SHA-256; the hash
 * must be collision-resistant or an attacker could forge a matching code.
 */
export type Digest = (input: string) => string; // returns a hex string

export function deriveSafetyCode(
  localFingerprint: string,
  remoteFingerprint: string,
  digest: Digest,
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
