export class WooClientError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = 'WooClientError';
  }
}

export class AuthError extends WooClientError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
    this.name = 'AuthError';
  }
}

export class NotFoundError extends WooClientError {
  constructor(message = 'Resource not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

export class RateLimitedError extends WooClientError {
  constructor(message = 'Too many requests', public readonly retryAfter?: number) {
    super(message, 429);
    this.name = 'RateLimitedError';
  }
}

export class UpstreamError extends WooClientError {
  constructor(message = 'Upstream unavailable', status = 502) {
    super(message, status);
    this.name = 'UpstreamError';
  }
}

export class ValidationError extends WooClientError {
  constructor(message = 'Validation failed') {
    super(message, 400);
    this.name = 'ValidationError';
  }
}
