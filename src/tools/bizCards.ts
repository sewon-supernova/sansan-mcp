import { z } from 'zod';
import type { SansanClient } from '../client.js';
import { defineTool } from './define.js';

const EntryStatus = z.enum(['processing', 'completed', 'unreadable']);
const OrderDirection = z.enum(['asc', 'desc']);
const Range = z.enum(['me', 'all']).describe('"me" = only my cards, "all" = entire tenant scope.');

const ListOrderBy = z
  .enum(['registeredAt', 'completedAt', 'updatedAt'])
  .describe('Field used to sort results.');
const SearchOrderBy = z
  .enum(['registeredAt', 'updatedAt'])
  .describe('Field used to sort results.');

const TimeWindow = {
  updatedFrom: z
    .string()
    .describe('ISO 8601 timestamp (inclusive lower bound). e.g. "2026-01-01T00:00:00+09:00".'),
  updatedTo: z
    .string()
    .describe('ISO 8601 timestamp (inclusive upper bound). Must be > updatedFrom.'),
};

export const listRecentBizCards = defineTool({
  name: 'list_recent_bizcards',
  title: 'List business cards updated within a time window',
  description:
    'Get a paginated list of Sansan business cards updated within a given ISO 8601 time window. Use this when you want a recent sweep (e.g. "what changed this week"). For free-text search by name / company / email, use search_bizcards instead.',
  inputSchema: {
    ...TimeWindow,
    nextPageToken: z.string().optional().describe('Pagination cursor from a previous response.'),
    includeTags: z.boolean().optional().describe('Include tag array on each card. Default false.'),
    includePastBizCards: z
      .boolean()
      .optional()
      .describe('Include older cards of the same person. Default false.'),
    range: Range.optional().default('me'),
    entryStatus: z
      .array(EntryStatus)
      .optional()
      .describe('Filter by digitization status. Default ["completed"].'),
    orderBy: ListOrderBy.optional().default('updatedAt'),
    orderDirection: OrderDirection.optional().default('asc'),
    limit: z.number().int().min(1).max(300).optional().default(100),
  },
  handler: async (client: SansanClient, args) => {
    return client.request({
      method: 'GET',
      path: 'bizCards',
      query: {
        updatedFrom: args.updatedFrom,
        updatedTo: args.updatedTo,
        nextPageToken: args.nextPageToken,
        includeTags: args.includeTags,
        includePastBizCards: args.includePastBizCards,
        range: args.range,
        entryStatus: args.entryStatus,
        orderBy: args.orderBy,
        orderDirection: args.orderDirection,
        limit: args.limit,
      },
    });
  },
});

export const searchBizCards = defineTool({
  name: 'search_bizcards',
  title: 'Search business cards by company, name, email, phone, or tag',
  description:
    'Search Sansan business cards by structured criteria. Use this for "find John at Acme" or "find anyone with @acme.com" style lookups. Combine fields with AND semantics; omit fields you do not need to filter by.',
  inputSchema: {
    companyName: z.string().optional().describe('Partial match against company name.'),
    name: z
      .string()
      .optional()
      .describe('Prefix match against full name (last + first concatenated).'),
    email: z.string().optional().describe('Exact match against email address.'),
    tel: z.string().optional().describe('Partial match against landline telephone.'),
    mobile: z.string().optional().describe('Partial match against mobile phone.'),
    tagId: z.array(z.string()).optional().describe('Filter by one or more tag IDs (OR semantics).'),
    nextPageToken: z.string().optional(),
    includeTags: z.boolean().optional(),
    includePastBizCards: z.boolean().optional(),
    range: Range.optional().default('me'),
    entryStatus: z.array(EntryStatus).optional(),
    orderBy: SearchOrderBy.optional().default('registeredAt'),
    orderDirection: OrderDirection.optional().default('desc'),
    limit: z.number().int().min(1).max(300).optional().default(100),
  },
  handler: async (client: SansanClient, args) => {
    return client.request({
      method: 'GET',
      path: 'bizCards/search',
      query: { ...args },
    });
  },
});

export const getBizCard = defineTool({
  name: 'get_bizcard',
  title: 'Get a single business card by ID',
  description:
    'Fetch the full Sansan business card record by its bizCardId, including all extracted fields (name, company, contact info, address, memo).',
  inputSchema: {
    id: z.string().describe('Business card ID (bizCardId).'),
    includeTags: z.boolean().optional().describe('Include tag array on the returned card.'),
  },
  handler: async (client: SansanClient, args) => {
    return client.request({
      method: 'GET',
      path: `bizCards/${encodeURIComponent(args.id)}`,
      query: { includeTags: args.includeTags },
    });
  },
});

export const getBizCardImage = defineTool({
  name: 'get_bizcard_image',
  title: 'Get the JPEG image of a business card',
  description:
    'Fetch the scanned image (front or back) of a Sansan business card. Returns a base64-encoded JPEG suitable for embedding or downstream OCR. Use the front side by default.',
  inputSchema: {
    id: z.string().describe('Business card ID.'),
    side: z
      .enum(['front', 'back'])
      .optional()
      .default('front')
      .describe('Which side of the card to retrieve.'),
  },
  handler: async (client: SansanClient, args) => {
    const res = await client.request<Response>({
      method: 'GET',
      path: `bizCards/${encodeURIComponent(args.id)}/image`,
      query: { side: args.side },
      raw: true,
    });
    const buffer = Buffer.from(await res.arrayBuffer());
    return {
      mimeType: res.headers.get('content-type') ?? 'image/jpeg',
      sizeBytes: buffer.byteLength,
      base64: buffer.toString('base64'),
    };
  },
});

export const getBizCardTags = defineTool({
  name: 'get_bizcard_tags',
  title: 'List tags attached to a business card',
  description: 'Return the tag set currently attached to a Sansan business card.',
  inputSchema: {
    id: z.string().describe('Business card ID.'),
    nextPageToken: z.string().optional(),
    limit: z.number().int().min(1).max(100).optional().default(100),
  },
  handler: async (client: SansanClient, args) => {
    return client.request({
      method: 'GET',
      path: `bizCards/${encodeURIComponent(args.id)}/tags`,
      query: { nextPageToken: args.nextPageToken, limit: args.limit },
    });
  },
});

export const createBizCard = defineTool({
  name: 'create_bizcard',
  title: 'Register a business card from structured data',
  description:
    'Create a new Sansan business card from explicit field values. Use this when you already have parsed contact data (e.g. from an email signature). For uploading a card photo for OCR, use upload_bizcard_image instead. At least one of companyName, firstName, or lastName must be provided.',
  inputSchema: {
    exchangeDate: z.string().optional().describe('YYYY-MM-DD format. When the card was exchanged.'),
    lastName: z.string().max(250).optional(),
    firstName: z.string().max(250).optional(),
    lastNameReading: z.string().optional(),
    firstNameReading: z.string().optional(),
    departmentName: z.string().optional(),
    title: z.string().optional(),
    companyName: z.string().optional(),
    countryCode: z
      .string()
      .optional()
      .describe('ISO 3166-1 alpha-2 (e.g. "JP") or "AUTO" to infer from address.'),
    postalCode: z.string().max(10).optional(),
    prefecture: z.string().optional(),
    city: z.string().optional(),
    street: z.string().optional(),
    building: z.string().optional(),
    email: z.string().optional(),
    mobile: z.string().optional(),
    tel: z.string().optional(),
    secondTel: z.string().optional(),
    fax: z.string().optional(),
    url: z.string().optional(),
    memo: z.string().max(2000).optional(),
    tagIds: z.array(z.string()).max(15).optional(),
  },
  handler: async (client: SansanClient, args) => {
    return client.request({
      method: 'POST',
      path: 'bizCards',
      body: args,
    });
  },
});
