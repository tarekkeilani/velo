/**
 * Unit tests for the call feature's pure logic. No React, no native modules —
 * this is the payoff of keeping business rules out of components.
 *
 * @format
 */

import { sha256 } from 'js-sha256';
import { deriveSafetyCode } from '../src/features/call/lib/sas';
import { normalizeRoomCode } from '../src/features/call/lib/roomCode';
import { extractDtlsFingerprint } from '../src/features/call/lib/fingerprint';

describe('deriveSafetyCode (SHA-256)', () => {
  const fpA = 'AA:BB:CC:DD';
  const fpB = '11:22:33:44';

  test('is symmetric — both peers compute the same code', () => {
    expect(deriveSafetyCode(fpA, fpB, sha256)).toBe(
      deriveSafetyCode(fpB, fpA, sha256),
    );
  });

  test('is deterministic for the same inputs', () => {
    expect(deriveSafetyCode(fpA, fpB, sha256)).toBe(
      deriveSafetyCode(fpA, fpB, sha256),
    );
  });

  test('changes if a fingerprint is tampered with (MITM)', () => {
    expect(deriveSafetyCode(fpA, fpB, sha256)).not.toBe(
      deriveSafetyCode(fpA, 'FF:FF:FF:FF', sha256),
    );
  });

  test('formats as two 3-digit groups', () => {
    expect(deriveSafetyCode(fpA, fpB, sha256)).toMatch(/^\d{3} \d{3}$/);
  });
});

describe('extractDtlsFingerprint', () => {
  const sdp = [
    'v=0',
    'a=group:BUNDLE 0',
    'a=fingerprint:sha-256 AB:CD:EF:01:23:45',
    'm=audio 9 UDP/TLS/RTP/SAVPF 111',
  ].join('\r\n');

  test('extracts the fingerprint hex, uppercased', () => {
    expect(extractDtlsFingerprint(sdp)).toBe('AB:CD:EF:01:23:45');
  });

  test('returns null when no fingerprint line is present', () => {
    expect(extractDtlsFingerprint('v=0\r\nm=audio 9 ...')).toBeNull();
  });
});

describe('normalizeRoomCode', () => {
  test('uppercases and strips spaces/ambiguous chars', () => {
    expect(normalizeRoomCode('abcd 2345')).toBe('ABCD2345');
  });

  test('drops characters outside the alphabet (0, 1, O, I)', () => {
    expect(normalizeRoomCode('A0B1C')).toBe('ABC');
  });
});
