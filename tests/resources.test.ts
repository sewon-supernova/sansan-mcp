import { describe, expect, it } from 'vitest';
import { resources } from '../src/resources/index.js';

describe('resources registry', () => {
  it('exposes 6 named resources', () => {
    const names = resources.map((r) => r.name).sort();
    expect(names).toEqual(
      [
        'sansan_bizcard',
        'sansan_bizcard_image',
        'sansan_person',
        'sansan_tags',
        'sansan_users',
        'sansan_departments',
      ].sort(),
    );
  });

  it('static resources use stable sansan:// URIs', () => {
    const staticUris = resources
      .filter((r) => r.kind === 'static')
      .map((r) => (r.kind === 'static' ? r.uri : ''))
      .sort();
    expect(staticUris).toEqual(['sansan://departments', 'sansan://tags', 'sansan://users']);
  });

  it('template resources declare URI templates', () => {
    const templates = resources.filter((r) => r.kind === 'template');
    expect(templates.length).toBe(3);
    for (const t of templates) {
      if (t.kind !== 'template') continue;
      const uriStr = t.template.uriTemplate.toString();
      expect(uriStr).toMatch(/^sansan:\/\//);
      expect(uriStr).toMatch(/\{id\}/);
    }
  });

  it('every resource has a non-empty description', () => {
    for (const r of resources) {
      expect(r.description.length).toBeGreaterThan(20);
    }
  });
});
