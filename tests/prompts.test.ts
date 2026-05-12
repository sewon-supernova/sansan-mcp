import { describe, expect, it } from 'vitest';
import { prompts } from '../src/prompts/index.js';

describe('prompts registry', () => {
  it('exposes 5 named prompts', () => {
    const names = prompts.map((p) => p.name).sort();
    expect(names).toEqual(
      [
        'weekly_sales_recap',
        'find_warm_contacts',
        'analyze_contact',
        'draft_followup_email',
        'meeting_recap_to_report',
      ].sort(),
    );
  });

  it('every prompt builds at least one user message', () => {
    for (const prompt of prompts) {
      const minimal: Record<string, unknown> = {};
      // satisfy required args with stub values
      if (prompt.name === 'find_warm_contacts') minimal.company_pattern = 'Acme';
      if (prompt.name === 'analyze_contact') minimal.bizcard_id = 'abc123';
      if (prompt.name === 'draft_followup_email') minimal.bizcard_id = 'abc123';
      if (prompt.name === 'meeting_recap_to_report') minimal.transcript = 'sample notes';

      const messages = (prompt.build as (a: unknown) => Array<{ role: string }>)(minimal);
      expect(messages.length).toBeGreaterThan(0);
      expect(messages[0]?.role).toBe('user');
    }
  });
});

describe('analyze_contact prompt', () => {
  const prompt = prompts.find((p) => p.name === 'analyze_contact')!;

  it('embeds the bizcard_id in the prompt body', () => {
    const messages = (prompt.build as (a: unknown) => Array<{ content: { text: string } }>)({
      bizcard_id: 'card-42',
    });
    expect(messages[0]?.content.text).toContain('card-42');
  });

  it('changes guidance based on focus arg', () => {
    const build = prompt.build as (a: unknown) => Array<{ content: { text: string } }>;
    const dealMsg = build({ bizcard_id: 'x', focus: 'deal_potential' });
    const healthMsg = build({ bizcard_id: 'x', focus: 'relationship_health' });
    expect(dealMsg[0]?.content.text).toContain('deal size');
    expect(healthMsg[0]?.content.text).toContain('engagement cadence');
  });
});

describe('draft_followup_email prompt', () => {
  const prompt = prompts.find((p) => p.name === 'draft_followup_email')!;
  const build = prompt.build as (a: unknown) => Array<{ content: { text: string } }>;

  it('defaults to Japanese keigo when language omitted', () => {
    const messages = build({ bizcard_id: 'abc' });
    expect(messages[0]?.content.text).toContain('Japanese keigo');
  });

  it('switches to business English when language=en', () => {
    const messages = build({ bizcard_id: 'abc', language: 'en' });
    expect(messages[0]?.content.text).toContain('business English');
  });
});
