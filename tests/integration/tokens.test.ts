import { describe, it, expect } from 'vitest';
import { tokenManager } from '../../src/security/tokens.js';

describe('Token Manager', () => {
  it('creates, verifies, and revokes tokens', async () => {
    // Create
    const token = await tokenManager.createToken('Test Agent');
    expect(token).toBeDefined();
    
    // Verify
    const isValid = tokenManager.verify(token);
    expect(isValid).toBe(true);
    
    // Revoke
    tokenManager.revokeToken(token);
    const isStillValid = tokenManager.verify(token);
    expect(isStillValid).toBe(false);
  });
});
