import { Config, resolveBaseUrl } from './config.js';
import {
  SansanApiError,
  SansanAuthError,
  SansanNotFoundError,
  SansanRateLimitError,
} from './errors.js';
import { TokenBucket } from './rate-limiter.js';

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  /** Path after the v6.0 base, e.g. `bizCards/search`. */
  path: string;
  query?: Record<string, string | number | boolean | string[] | undefined>;
  body?: unknown;
  /** When set, returns the raw Response (e.g. for binary downloads like images). */
  raw?: boolean;
}

const USER_AGENT = 'sansan-mcp (+https://github.com/sewon-supernova/sansan-mcp)';

export class SansanClient {
  private readonly baseUrl: string;
  private readonly bucket: TokenBucket;

  constructor(private readonly config: Config) {
    this.baseUrl = resolveBaseUrl(config);
    this.bucket = new TokenBucket(8, 8);
  }

  async request<T = unknown>(options: RequestOptions): Promise<T> {
    const url = this.buildUrl(options.path, options.query);

    await this.bucket.acquire();

    const headers: Record<string, string> = {
      'X-Sansan-Api-Key': this.config.apiKey,
      Accept: 'application/json',
      'User-Agent': USER_AGENT,
    };
    if (this.config.appId) headers['X-Sansan-App-Id'] = this.config.appId;
    if (options.body !== undefined) headers['Content-Type'] = 'application/json';

    const init: RequestInit = {
      method: options.method ?? 'GET',
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    };

    const res = await fetch(url, init);
    const endpoint = `${init.method} ${options.path}`;

    if (!res.ok) {
      const text = await res.text();
      const parsed = tryParseJson(text);
      if (res.status === 401) throw new SansanAuthError(endpoint, parsed);
      if (res.status === 404) throw new SansanNotFoundError(endpoint, parsed);
      if (res.status === 429) throw new SansanRateLimitError(endpoint, parsed);
      throw new SansanApiError(
        `Sansan API request failed: ${res.status} ${res.statusText}`,
        res.status,
        endpoint,
        parsed,
      );
    }

    if (options.raw) {
      return res as unknown as T;
    }

    if (res.status === 204 || res.headers.get('content-length') === '0') {
      return undefined as T;
    }

    const text = await res.text();
    return tryParseJson(text) as T;
  }

  private buildUrl(
    path: string,
    query?: Record<string, string | number | boolean | string[] | undefined>,
  ): string {
    const url = new URL(`${this.baseUrl}/${path.replace(/^\//, '')}`);
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value === undefined) continue;
        if (Array.isArray(value)) {
          for (const v of value) url.searchParams.append(key, String(v));
        } else {
          url.searchParams.set(key, String(value));
        }
      }
    }
    return url.toString();
  }
}

function tryParseJson(text: string): unknown {
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
