import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { defineTemplateResource } from './define.js';

export const bizCardResource = defineTemplateResource({
  name: 'sansan_bizcard',
  template: new ResourceTemplate('sansan://bizcard/{id}', { list: undefined }),
  title: 'Sansan business card',
  description:
    'Full record of a single Sansan business card by ID. JSON payload includes name, company, department, contact info, address, memo, and exchange date. Use URI sansan://bizcard/{id}.',
  mimeType: 'application/json',
  read: async (client, uri, variables) => {
    const id = String(variables.id);
    const data = await client.request({
      method: 'GET',
      path: `bizCards/${encodeURIComponent(id)}`,
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

export const bizCardImageResource = defineTemplateResource({
  name: 'sansan_bizcard_image',
  template: new ResourceTemplate('sansan://bizcard/{id}/image', { list: undefined }),
  title: 'Sansan business card image (front)',
  description:
    'JPEG image of the front side of a Sansan business card. Returned as a base64 blob suitable for visual inspection or OCR. Use URI sansan://bizcard/{id}/image.',
  mimeType: 'image/jpeg',
  read: async (client, uri, variables) => {
    const id = String(variables.id);
    const res = await client.request<Response>({
      method: 'GET',
      path: `bizCards/${encodeURIComponent(id)}/image`,
      query: { side: 'front' },
      raw: true,
    });
    const buffer = Buffer.from(await res.arrayBuffer());
    return {
      contents: [
        {
          uri: uri.toString(),
          mimeType: res.headers.get('content-type') ?? 'image/jpeg',
          blob: buffer.toString('base64'),
        },
      ],
    };
  },
});
