import { z } from 'zod';
import type { SansanClient } from '../client.js';
import { defineTool } from './define.js';

const ListReportType = z.enum(['Meeting', 'Call', 'Email', 'BizCardExchange', 'OnlineMeeting']);
const CreateReportType = z.enum([
  'Meeting',
  'Visit',
  'MeetingAtOffice',
  'Call',
  'OutboundCall',
  'InboundCall',
  'Email',
  'SentEmail',
  'ReceivedEmail',
  'OnlineMeeting',
]);

export const listReports = defineTool({
  name: 'list_reports',
  title: 'List sales activity reports within a time window',
  description:
    'Fetch Sansan activity reports (meetings, calls, emails, exchanges) updated in a given ISO 8601 time window. Useful for sales-pipeline summaries or weekly recap generation.',
  inputSchema: {
    updatedFrom: z
      .string()
      .describe('ISO 8601 lower bound (inclusive). e.g. "2026-05-01T00:00:00+09:00".'),
    updatedTo: z.string().describe('ISO 8601 upper bound (inclusive). Must be > updatedFrom.'),
    nextPageToken: z.string().optional(),
    category: z.array(z.string()).optional().describe('Filter by report category (exact match).'),
    type: z.array(ListReportType).optional().describe('Filter by activity type.'),
    range: z.enum(['me', 'all']).optional().default('me'),
    orderBy: z.enum(['registeredAt', 'updatedAt']).optional().default('updatedAt'),
    orderDirection: z.enum(['asc', 'desc']).optional().default('desc'),
    limit: z.number().int().min(1).max(300).optional().default(100),
  },
  handler: async (client: SansanClient, args) => {
    return client.request({
      method: 'GET',
      path: 'reports',
      query: { ...args },
    });
  },
});

export const createReport = defineTool({
  name: 'create_report',
  title: 'Create a sales activity report',
  description:
    'Log a Sansan activity report (meeting, call, email, online meeting, etc.) with start/end time, internal attendees, and external attendees. Use this to push Claude-summarized meetings back into Sansan.',
  inputSchema: {
    startTime: z.string().describe('ISO 8601 start time.'),
    endTime: z.string().describe('ISO 8601 end time.'),
    type: CreateReportType,
    title: z.string().optional(),
    location: z.string().optional(),
    memo: z.string().optional().describe('Free-text body. Plain text only.'),
    internalAttendeeUserIds: z
      .array(z.string())
      .optional()
      .describe('User IDs of internal attendees in the Sansan tenant.'),
    externalAttendees: z
      .array(
        z.object({
          companyName: z.string().optional(),
          lastName: z.string().optional(),
          firstName: z.string().optional(),
          email: z.string().optional(),
        }),
      )
      .describe('Required. External attendees identified by name / company / email.'),
  },
  handler: async (client: SansanClient, args) => {
    return client.request({
      method: 'POST',
      path: 'reports',
      body: args,
    });
  },
});
