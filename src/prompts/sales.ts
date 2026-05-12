import { z } from 'zod';
import { definePrompt } from './define.js';

export const weeklySalesRecap = definePrompt({
  name: 'weekly_sales_recap',
  title: 'Weekly sales recap',
  description:
    "Generate a concise weekly recap of sales activity logged in Sansan. The assistant calls list_reports for the given window and produces a summary grouped by company and activity type, with follow-up suggestions.",
  argsSchema: {
    since: z
      .string()
      .optional()
      .describe(
        'ISO 8601 lower bound. Defaults to 7 days before now. e.g. "2026-05-06T00:00:00+09:00".',
      ),
    until: z
      .string()
      .optional()
      .describe('ISO 8601 upper bound. Defaults to now.'),
    range: z
      .enum(['me', 'all'])
      .optional()
      .describe('"me" for personal recap, "all" for team recap. Default "me".'),
  },
  build: (args) => {
    const since = args.since ?? 'the past 7 days (compute from now − 7d)';
    const until = args.until ?? 'now';
    const range = args.range ?? 'me';
    return [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `You are reviewing sales activity logged in Sansan.

Call the **list_reports** tool with:
  updatedFrom = ${since}
  updatedTo = ${until}
  range = ${range}
  limit = 300

Then produce a recap in this exact shape:

## Activity volume
- Total reports: <N>
- By type: Meeting <n> · Call <n> · Email <n> · OnlineMeeting <n> · BizCardExchange <n>

## Top companies this week
For each of the top 5 companies (by report count), one line:
  **<companyName>** — <N> touchpoints · last contact <date>

## Notable threads
3–5 bullet points describing the most substantive interactions. Use the report memo field.

## Suggested follow-ups
List 3 companies where the contact pattern suggests it's time to re-engage (e.g. last touch >14 days, no follow-up after a meeting).

Keep the whole recap under 400 words. Plain prose, no fluff.`,
        },
      },
    ];
  },
});

export const findWarmContacts = definePrompt({
  name: 'find_warm_contacts',
  title: 'Find warm contacts at a target company',
  description:
    "Identify recently-active contacts at a target company. The assistant searches Sansan business cards and reports, then ranks contacts by recency and engagement signals.",
  argsSchema: {
    company_pattern: z.string().describe('Partial match on company name. e.g. "Toyota".'),
    days_lookback: z
      .number()
      .int()
      .positive()
      .optional()
      .describe('How many days back to consider "recent" activity. Default 90.'),
  },
  build: (args) => {
    const lookback = args.days_lookback ?? 90;
    return [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Find warm contacts at companies matching "${args.company_pattern}".

Steps:
1. Call **search_bizcards** with companyName = "${args.company_pattern}", limit = 100, includeTags = true.
2. For the ~10 most senior-looking contacts (by title), call **list_reports** with range = "all" and updatedFrom = ${lookback} days ago, then filter to reports whose externalAttendees include each contact.
3. Rank contacts by: (a) last touchpoint recency, (b) number of distinct touchpoints in the window, (c) whether the last touchpoint was an in-person meeting vs an email.

Output a ranked table:

| Rank | Name | Title | Company | Last touch | # touches (${lookback}d) | Signal |
|------|------|-------|---------|------------|--------------------------|--------|

Then add 2–3 sentences on which 2 contacts to prioritize this week and why.`,
        },
      },
    ];
  },
});
