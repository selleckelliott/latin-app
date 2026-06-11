/**
 * PIN hashing for the parent gate. This is a child gate, not a security
 * boundary: it only needs to keep a 2nd grader out of the parent area.
 * Uses Web Crypto (available in browsers and Node 20+).
 */
export async function hashPin(pin: string): Promise<string> {
  const data = new TextEncoder().encode(pin);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function verifyPin(pin: string, pinHash: string): Promise<boolean> {
  return (await hashPin(pin)) === pinHash;
}

export function isValidPin(pin: string): boolean {
  return /^\d{4}$/.test(pin);
}
