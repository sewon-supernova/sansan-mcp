import { z } from 'zod';
import type { SansanClient } from '../client.js';
import { defineTool } from './define.js';

export const listDepartments = defineTool({
  name: 'list_departments',
  title: 'List departments',
  description:
    'Paginated list of Sansan departments under the tenant. Use returned department IDs for permission patterns or org-aware queries.',
  inputSchema: {
    nextPageToken: z.string().optional(),
    limit: z.number().int().min(1).max(100).optional().default(100),
  },
  handler: async (client: SansanClient, args) => {
    return client.request({
      method: 'GET',
      path: 'departments',
      query: { nextPageToken: args.nextPageToken, limit: args.limit },
    });
  },
});

export const listOrganizationDepartments = defineTool({
  name: 'list_organization_departments',
  title: 'Acquire department tree (CSV)',
  description:
    'Download the full department hierarchy as CSV. Sansan returns CSV by design. Use for org-chart sync or external reporting.',
  inputSchema: {
    delimiter: z.enum(['comma', 'tab']).optional().default('comma'),
  },
  handler: async (client: SansanClient, args) => {
    const res = await client.request<Response>({
      method: 'GET',
      path: 'organization/departments',
      query: { delimiter: args.delimiter },
      raw: true,
    });
    return { format: 'csv', delimiter: args.delimiter, body: await res.text() };
  },
});
