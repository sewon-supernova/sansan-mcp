import { defineStaticResource } from './define.js';

export const tagsResource = defineStaticResource({
  name: 'sansan_tags',
  uri: 'sansan://tags',
  title: 'All Sansan tags',
  description:
    'Full tag collection (private + public + shared) visible to the API key. JSON payload lists tagId, name, type, and owner. Useful as background context when filtering bizCards by tag.',
  mimeType: 'application/json',
  read: async (client, uri) => {
    const data = await client.request({
      method: 'GET',
      path: 'tags',
      query: { range: 'me', limit: 100 },
    });
    return {
      contents: [
        {
          uri: uri.toString(),
          mimeType: 'application/json',
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  },
});

export const usersResource = defineStaticResource({
  name: 'sansan_users',
  uri: 'sansan://users',
  title: 'Sansan tenant user roster',
  description:
    'Full user roster for the Sansan tenant, returned as CSV. Useful for resolving userId values seen in reports or for syncing org membership to external systems.',
  mimeType: 'text/csv',
  read: async (client, uri) => {
    const res = await client.request<Response>({
      method: 'GET',
      path: 'organization/users',
      query: { delimiter: 'comma' },
      raw: true,
    });
    return {
      contents: [
        {
          uri: uri.toString(),
          mimeType: 'text/csv',
          text: await res.text(),
        },
      ],
    };
  },
});

export const departmentsResource = defineStaticResource({
  name: 'sansan_departments',
  uri: 'sansan://departments',
  title: 'Sansan department tree',
  description:
    'Full department hierarchy for the Sansan tenant, returned as CSV. Useful for org-chart comprehension or org-scoped routing of cards and reports.',
  mimeType: 'text/csv',
  read: async (client, uri) => {
    const res = await client.request<Response>({
      method: 'GET',
      path: 'organization/departments',
      query: { delimiter: 'comma' },
      raw: true,
    });
    return {
      contents: [
        {
          uri: uri.toString(),
          mimeType: 'text/csv',
          text: await res.text(),
        },
      ],
    };
  },
});
