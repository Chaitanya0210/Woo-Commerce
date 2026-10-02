import crypto from 'crypto';

export class TokenManager {
  private tokens = new Map<string, string>(); // hashed -> name

  createToken(name: string): string {
    const raw = crypto.randomBytes(32).toString('hex');
    const hashed = this.hash(raw);
    this.tokens.set(hashed, name);
    return raw;
  }

  revokeToken(rawOrHashed: string) {
    // If it's a raw token, hash it. If it's already hashed, delete it.
    // For simplicity, let's just delete the hash of the raw token, or delete the string directly if it's already hashed.
    this.tokens.delete(this.hash(rawOrHashed));
    this.tokens.delete(rawOrHashed);
  }

  verify(raw: string): boolean {
    return this.tokens.has(this.hash(raw));
  }

  private hash(raw: string) {
    return crypto.createHash('sha256').update(raw).digest('hex');
  }
}

export const tokenManager = new TokenManager();
