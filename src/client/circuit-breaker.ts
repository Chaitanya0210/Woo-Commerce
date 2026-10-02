export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime: number | null = null;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private readonly failureThreshold: number = 5,
    private readonly resetTimeoutMs: number = 30000
  ) {}

  async execute<T>(action: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - (this.lastFailureTime || 0) > this.resetTimeoutMs) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN: Upstream unavailable');
      }
    }

    try {
      const result = await action();
      if (this.state === 'HALF_OPEN') {
        this.reset();
      }
      return result;
    } catch (error: unknown) {
      this.recordFailure();
      throw error;
    }
  }

  private recordFailure() {
    this.failures += 1;
    this.lastFailureTime = Date.now();
    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }

  private reset() {
    this.failures = 0;
    this.lastFailureTime = null;
    this.state = 'CLOSED';
  }

  getState() {
    return this.state;
  }
}
