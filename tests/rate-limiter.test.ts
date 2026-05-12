import { describe, expect, it } from 'vitest';
import { TokenBucket } from '../src/rate-limiter.js';

describe('TokenBucket', () => {
  it('grants the initial burst without delay', async () => {
    const bucket = new TokenBucket(5, 5);
    const start = Date.now();
    for (let i = 0; i < 5; i++) await bucket.acquire();
    expect(Date.now() - start).toBeLessThan(50);
  });

  it('throttles once the burst is exhausted', async () => {
    const bucket = new TokenBucket(2, 5); // 5 tokens/sec → 200ms each
    await bucket.acquire();
    await bucket.acquire();
    const start = Date.now();
    await bucket.acquire();
    expect(Date.now() - start).toBeGreaterThanOrEqual(150);
  });
});
