import { z } from 'zod';
import type { SansanClient } from '../client.js';
import { defineTool } from './define.js';

export const getPerson = defineTool({
  name: 'get_person',
  title: 'Get a person (consolidated contact)',
  description:
    'Fetch a Sansan Person record by ID. A Person aggregates multiple business cards belonging to the same individual across time and contributors, so you get the most recent contact info plus a headBizCard reference.',
  inputSchema: {
    id: z.string().describe('Person ID.'),
    includeTags: z.boolean().optional().describe('Include the tag array on the headBizCard.'),
  },
  handler: async (client: SansanClient, args) => {
    return client.request({
      method: 'GET',
      path: `persons/${encodeURIComponent(args.id)}`,
      query: { includeTags: args.includeTags },
    });
  },
});
