/**
 * Unit tests for the call feature's pure logic. No React, no native modules —
 * this is the payoff of keeping business rules out of components.
 *
 * @format
 */

import { deriveSafetyCode } from '../src/features/call/lib/sas';
import { normalizeRoomCode } from '../src/features/call/lib/roomCode';

describe('deriveSafetyCode', () => {
  const fpA = 'AA:BB:CC:DD';
  const fpB = '11:22:33:44';

  test('is symmetric — both peers compute the same code', () => {
    expect(deriveSafetyCode(fpA, fpB)).toBe(deriveSafetyCode(fpB, fpA));
  });

  test('is deterministic for the same inputs', () => {
    expect(deriveSafetyCode(fpA, fpB)).toBe(deriveSafetyCode(fpA, fpB));
  });

  test('changes if a fingerprint is tampered with (MITM)', () => {
    const honest = deriveSafetyCode(fpA, fpB);
    const tampered = deriveSafetyCode(fpA, 'FF:FF:FF:FF');
    expect(honest).not.toBe(tampered);
  });

  test('formats as two 3-digit groups', () => {
    expect(deriveSafetyCode(fpA, fpB)).toMatch(/^\d{3} \d{3}$/);
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
