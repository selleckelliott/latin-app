import { describe, expect, it } from 'vitest';
import { hashPin, isValidPin, verifyPin } from './pin';

describe('pin', () => {
  it('hashes a PIN to a stable SHA-256 hex digest', async () => {
    const hash = await hashPin('1234');
    // Well-known SHA-256 of "1234"
    expect(hash).toBe('03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4');
    expect(await hashPin('1234')).toBe(hash);
  });

  it('verifies a matching PIN and rejects a wrong one', async () => {
    const hash = await hashPin('0420');
    expect(await verifyPin('0420', hash)).toBe(true);
    expect(await verifyPin('4200', hash)).toBe(false);
  });

  it('accepts only 4-digit PINs', () => {
    expect(isValidPin('1234')).toBe(true);
    expect(isValidPin('0000')).toBe(true);
    expect(isValidPin('123')).toBe(false);
    expect(isValidPin('12345')).toBe(false);
    expect(isValidPin('12a4')).toBe(false);
    expect(isValidPin('')).toBe(false);
  });
});
