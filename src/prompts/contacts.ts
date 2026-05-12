import { z } from 'zod';
import { definePrompt } from './define.js';

export const analyzeContact = definePrompt({
  name: 'analyze_contact',
  title: 'Analyze a single Sansan contact',
  description:
    "Produce a structured analysis of a Sansan contact: who they are, current engagement, opportunities, and recommended next steps. Backed by Sansan business card data and report history.",
  argsSchema: {
    bizcard_id: z.string().describe('The Sansan business card ID to analyze.'),
    focus: z
      .enum(['business_fit', 'deal_potential', 'relationship_health'])
      .optional()
      .describe('Optional analysis focus. Defaults to a balanced overview.'),
  },
  build: (args) => {
    const focusGuide: Record<string, string> = {
      business_fit: 'Lean into product-market fit and ICP alignment.',
      deal_potential: 'Lean into deal size, decision authority, and timeline signals.',
      relationship_health: 'Lean into engagement cadence and risk of churn / cooling.',
    };
    const guidance = args.focus
      ? focusGuide[args.focus]
      : 'Balance all three: fit, deal potential, and relationship health.';

    return [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Analyze Sansan business card ID = "${args.bizcard_id}".

Steps:
1. Read **sansan://bizcard/${args.bizcard_id}** for the full card.
2. Call **list_reports** range="all", updatedFrom = 180 days ago, limit = 300. Filter to reports whose externalAttendees include this person (match by name + company or by email).
3. ${guidance}

Output in this exact structure:

## Who
2–3 sentences: name, role, company, what you can infer about their function and decision authority.

## Engagement
- First touch: <date> (type)
- Last touch: <date> (type)
- Cadence (180d): <N> touchpoints
- Tone: <inferred from memo fields>

## Opportunities
3 bullets max. Concrete next-step ideas grounded in the activity history.

## Risks / gaps
2 bullets. What you don't know, or what would block a deal.

## Recommended next action
One sentence. What to do this week.

Keep total under 350 words.`,
        },
      },
    ];
  },
});

export const draftFollowupEmail = definePrompt({
  name: 'draft_followup_email',
  title: 'Draft a follow-up email to a Sansan contact',
  description:
    'Draft a context-aware follow-up email to a Sansan contact in Japanese or English. The assistant pulls the contact record and recent activity history before drafting.',
  argsSchema: {
    bizcard_id: z.string().describe('The Sansan business card ID to follow up with.'),
    language: z
      .enum(['ja', 'en'])
      .optional()
      .describe('Output language. Default "ja" (Japanese keigo).'),
    tone: z
      .enum(['polite_first_contact', 'warm_followup', 'reengagement', 'proposal_intro'])
      .optional()
      .describe('Email tone. Default "warm_followup".'),
    intent: z.string().optional().describe('One sentence describing what you want to achieve.'),
  },
  build: (args) => {
    const language = args.language ?? 'ja';
    const tone = args.tone ?? 'warm_followup';
    const intent = args.intent ?? '(infer from recent activity)';

    const langInstruction =
      language === 'ja'
        ? 'Write the email in natural Japanese keigo (敬語). Use です・ます with appropriate humble forms. Subject line in Japanese as well.'
        : 'Write the email in business English. Concise, warm, no fluff. Subject line in English.';

    const toneGuide: Record<string, string> = {
      polite_first_contact: 'Tone: respectful first reach-out. Acknowledge the introduction context.',
      warm_followup: 'Tone: warm, building on a prior touchpoint. Reference something specific from the history.',
      reengagement: 'Tone: re-engaging after a quiet period. Acknowledge the gap briefly, propose a low-friction next step.',
      proposal_intro: 'Tone: serious, business-forward. Frame as a proposal opener.',
    };

    return [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Draft a follow-up email to the contact at Sansan business card ID = "${args.bizcard_id}".

Steps:
1. Read **sansan://bizcard/${args.bizcard_id}** for name, company, title, and email.
2. Call **list_reports** range="all", updatedFrom = 180 days ago, and filter to entries involving this contact. Note the most recent touchpoint.
3. ${langInstruction}
4. ${toneGuide[tone]}
5. Goal of the email: ${intent}

Output:

\`\`\`
Subject: <subject line>

<greeting>

<body — 3 short paragraphs max>

<sign-off>
\`\`\`

Then a single line of meta:
> Suggested send time: <weekday morning JST recommendation, with one-sentence rationale>`,
        },
      },
    ];
  },
});

export const meetingRecapToReport = definePrompt({
  name: 'meeting_recap_to_report',
  title: 'Convert meeting transcript into a Sansan report',
  description:
    'Take a raw meeting transcript / notes and produce a clean Sansan activity report ready to push via create_report. Output is structured so the user can review and approve before the actual write.',
  argsSchema: {
    transcript: z.string().describe('Raw meeting transcript, notes, or bullet recap.'),
    type: z
      .enum(['Meeting', 'OnlineMeeting', 'Call', 'Visit', 'MeetingAtOffice'])
      .optional()
      .describe('Activity type. Default "Meeting".'),
  },
  build: (args) => {
    const type = args.type ?? 'Meeting';
    return [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Convert this meeting transcript into a Sansan activity report.

Transcript:
"""
${args.transcript}
"""

Extract:
- startTime / endTime (ISO 8601 with JST offset if no timezone given)
- type: "${type}"
- title: a short factual title (≤40 chars)
- location: physical location or "Online" / specific platform
- externalAttendees: list of { companyName, lastName, firstName, email } — infer from the transcript
- memo: clean prose summary, 150–300 words, neutral business tone, no first-person pronouns

If any extracted field is uncertain, mark it as <UNCERTAIN: explanation> rather than guessing.

Output the extracted fields as a JSON object the user can pass directly to the **create_report** tool. Do NOT call the tool yourself. Wait for the user to confirm and execute.`,
        },
      },
    ];
  },
});
