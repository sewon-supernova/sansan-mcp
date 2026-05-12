import { z } from 'zod';
import type { SansanClient } from '../client.js';
import { defineTool } from './define.js';

export const getUser = defineTool({
  name: 'get_user',
  title: 'Get a single Sansan user',
  description:
    'Fetch a Sansan tenant user by userId. Returns profile fields used for assigning bizCards or reports.',
  inputSchema: {
    userId: z.string().describe('Sansan user ID.'),
  },
  handler: async (client: SansanClient, args) => {
    return client.request({
      method: 'GET',
      path: `users/${encodeURIComponent(args.userId)}`,
    });
  },
});

export const listUsers = defineTool({
  name: 'list_users',
  title: 'Acquire user roster (CSV)',
  description:
    'Download the Sansan tenant user roster as CSV. Sansan returns CSV (not JSON) for this endpoint by design, so the response is the raw CSV string.',
  inputSchema: {
    delimiter: z
      .enum(['comma', 'tab'])
      .optional()
      .default('comma')
      .describe('Column delimiter for the returned CSV.'),
  },
  handler: async (client: SansanClient, args) => {
    const res = await client.request<Response>({
      method: 'GET',
      path: 'organization/users',
      query: { delimiter: args.delimiter },
      raw: true,
    });
    return { format: 'csv', delimiter: args.delimiter, body: await res.text() };
  },
});
