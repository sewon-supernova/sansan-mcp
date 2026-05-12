import { describe, expect, it } from 'vitest';
import { loadConfig, resolveBaseUrl } from '../src/config.js';

describe('loadConfig', () => {
  const validKey = 'a'.repeat(32);

  it('accepts a valid 32-char API key', () => {
    const cfg = loadConfig({ SANSAN_API_KEY: validKey } as NodeJS.ProcessEnv);
    expect(cfg.apiKey).toBe(validKey);
    expect(cfg.appId).toBeUndefined();
    expect(cfg.baseUrl).toBeUndefined();
  });

  it('accepts optional appId and baseUrl', () => {
    const cfg = loadConfig({
      SANSAN_API_KEY: validKey,
      SANSAN_APP_ID: 'app-xyz',
      SANSAN_BASE_URL: 'https://api.example.com/v6.0',
    } as NodeJS.ProcessEnv);
    expect(cfg.appId).toBe('app-xyz');
    expect(cfg.baseUrl).toBe('https://api.example.com/v6.0');
  });

  it('rejects a missing API key', () => {
    expect(() => loadConfig({} as NodeJS.ProcessEnv)).toThrow(/apiKey/);
  });

  it('rejects a malformed API key (wrong length)', () => {
    expect(() => loadConfig({ SANSAN_API_KEY: 'tooshort' } as NodeJS.ProcessEnv)).toThrow(
      /32 alphanumeric/,
    );
  });

  it('rejects a malformed API key (non-alphanumeric)', () => {
    expect(() => loadConfig({ SANSAN_API_KEY: '!'.repeat(32) } as NodeJS.ProcessEnv)).toThrow(
      /32 alphanumeric/,
    );
  });

  it('rejects an invalid base URL', () => {
    expect(() =>
      loadConfig({
        SANSAN_API_KEY: validKey,
        SANSAN_BASE_URL: 'not-a-url',
      } as NodeJS.ProcessEnv),
    ).toThrow();
  });
});

describe('resolveBaseUrl', () => {
  it('defaults to api.sansan.com v6.0', () => {
    expect(resolveBaseUrl({ apiKey: 'x'.repeat(32) })).toBe('https://api.sansan.com/v6.0');
  });

  it('respects an explicit override', () => {
    expect(
      resolveBaseUrl({
        apiKey: 'x'.repeat(32),
        baseUrl: 'https://api.example.com/v6.0',
      }),
    ).toBe('https://api.example.com/v6.0');
  });
});
