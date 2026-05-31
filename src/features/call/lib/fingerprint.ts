/**
 * DTLS fingerprint extraction.
 *
 * WebRTC embeds each peer's DTLS certificate fingerprint in its SDP as a line
 * like `a=fingerprint:sha-256 AB:CD:...`. That fingerprint cryptographically
 * binds the media-encryption keys to the peer. Comparing both fingerprints
 * (via the SAS code) is what detects a man-in-the-middle on the signaling path.
 */
export function extractDtlsFingerprint(sdp: string): string | null {
  // Tolerate any hash algo label (sha-256/sha-512/…) and CRLF or LF endings.
  const match = sdp.match(/a=fingerprint:\S+\s+([0-9A-Fa-f:]+)/);
  return match ? match[1].toUpperCase() : null;
}
