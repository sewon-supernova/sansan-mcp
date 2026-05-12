export class SansanApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly endpoint: string,
    readonly body?: unknown,
  ) {
    super(message);
    this.name = 'SansanApiError';
  }

  override toString(): string {
    return `${this.name}: ${this.message} (status=${this.status} endpoint=${this.endpoint})`;
  }
}

export class SansanAuthError extends SansanApiError {
  constructor(endpoint: string, body?: unknown) {
    super('Sansan API key missing or invalid', 401, endpoint, body);
    this.name = 'SansanAuthError';
  }
}

export class SansanRateLimitError extends SansanApiError {
  constructor(endpoint: string, body?: unknown) {
    super('Sansan API rate limit exceeded (10 req/sec per key)', 429, endpoint, body);
    this.name = 'SansanRateLimitError';
  }
}

export class SansanNotFoundError extends SansanApiError {
  constructor(endpoint: string, body?: unknown) {
    super('Sansan resource not found', 404, endpoint, body);
    this.name = 'SansanNotFoundError';
  }
}
