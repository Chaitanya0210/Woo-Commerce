import { describe, it, expect } from 'vitest';
import { CircuitBreaker } from '../../src/client/circuit-breaker.js';

describe('Circuit Breaker (Half-Open)', () => {
  it('transitions from OPEN to HALF_OPEN after timeout and succeeds', async () => {
    const cb = new CircuitBreaker(2, 500); // 500ms timeout
    
    // Fail 2 times to trigger OPEN
    try { await cb.execute(async () => { throw new Error('fail'); }); } catch (e) {}
    try { await cb.execute(async () => { throw new Error('fail'); }); } catch (e) {}
    
    expect(cb.getState()).toBe('OPEN');
    
    // Wait for timeout
    await new Promise(r => setTimeout(r, 600));
    
    // Should transition to HALF_OPEN on next execution and succeed
    const res = await cb.execute(async () => 'success');
    expect(res).toBe('success');
    expect(cb.getState()).toBe('CLOSED');
  });

  it('transitions from HALF_OPEN back to OPEN if it fails', async () => {
    const cb = new CircuitBreaker(2, 500);
    try { await cb.execute(async () => { throw new Error('fail'); }); } catch (e) {}
    try { await cb.execute(async () => { throw new Error('fail'); }); } catch (e) {}
    expect(cb.getState()).toBe('OPEN');
    
    await new Promise(r => setTimeout(r, 600));
    
    try { await cb.execute(async () => { throw new Error('fail'); }); } catch (e) {}
    expect(cb.getState()).toBe('OPEN');
  });
});
