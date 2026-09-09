import crypto from 'crypto';

/**
 * Hashes a password using Node's native crypto.scrypt with a random 16-byte salt
 * Format: <salt_hex>:<hash_hex>
 */
export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`${salt}:${derivedKey.toString('hex')}`);
    });
  });
}

/**
 * Verifies a password against a stored <salt>:<hash> string using timingSafeEqual
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const parts = storedHash.split(':');
    if (parts.length !== 2) return resolve(false);

    const [salt, originalHash] = parts;
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) return reject(err);
      try {
        const keyBuffer = Buffer.from(derivedKey.toString('hex'), 'hex');
        const originalBuffer = Buffer.from(originalHash, 'hex');
        if (keyBuffer.length !== originalBuffer.length) return resolve(false);
        resolve(crypto.timingSafeEqual(keyBuffer, originalBuffer));
      } catch {
        resolve(false);
      }
    });
  });
}

/**
 * Generates a cryptographically secure random token (e.g. for API keys or one-time codes)
 */
export function generateSecureToken(bytes: number = 24): string {
  return crypto.randomBytes(bytes).toString('hex');
}
