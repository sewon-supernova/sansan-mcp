import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { defineTemplateResource } from './define.js';

export const personResource = defineTemplateResource({
  name: 'sansan_person',
  template: new ResourceTemplate('sansan://person/{id}', { list: undefined }),
  title: 'Sansan person record',
  description:
    'Consolidated Person record from Sansan. Aggregates multiple business cards belonging to the same individual across time and contributors. JSON payload includes the most recent contact info and a headBizCard reference. Use URI sansan://person/{id}.',
  mimeType: 'application/json',
  read: async (client, uri, variables) => {
    const id = String(variables.id);
    const data = await client.request({
      method: 'GET',
      path: `persons/${encodeURIComponent(id)}`,
      query: { includeTags: true },
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
