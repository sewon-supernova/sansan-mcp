import { z } from 'zod';
import type { SansanClient } from '../client.js';
import { defineTool } from './define.js';

const TagType = z.enum(['private', 'public', 'shared']);

export const listTags = defineTool({
  name: 'list_tags',
  title: 'List tags',
  description:
    'List Sansan tags available to the API user. Filter by type (private / public / shared), owner, or name prefix. Use the returned tagId values with search_bizcards or create_bizcard.',
  inputSchema: {
    range: z.enum(['me', 'all']).optional().default('me'),
    type: z.array(TagType).optional().describe('Filter by tag visibility scope.'),
    ownerUserId: z.string().max(20).optional().describe('Filter by tag owner user ID.'),
    tagName: z.string().max(50).optional().describe('Partial match against tag name.'),
    nextPageToken: z.string().optional(),
    limit: z.number().int().min(1).max(100).optional().default(100),
  },
  handler: async (client: SansanClient, args) => {
    return client.request({
      method: 'GET',
      path: 'tags',
      query: { ...args },
    });
  },
});
