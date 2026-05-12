import type { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { SansanClient } from '../client.js';

export type ReadResultContent =
  | { uri: string; mimeType?: string; text: string }
  | { uri: string; mimeType?: string; blob: string };

export interface ReadResult {
  contents: ReadResultContent[];
  [key: string]: unknown;
}

export interface StaticResource {
  kind: 'static';
  name: string;
  uri: string;
  title: string;
  description: string;
  mimeType?: string;
  read: (client: SansanClient, uri: URL) => Promise<ReadResult>;
}

export interface TemplateResource {
  kind: 'template';
  name: string;
  template: ResourceTemplate;
  title: string;
  description: string;
  mimeType?: string;
  read: (
    client: SansanClient,
    uri: URL,
    variables: Record<string, string | string[]>,
  ) => Promise<ReadResult>;
}

export type ResourceDefinition = StaticResource | TemplateResource;

export function defineStaticResource(def: Omit<StaticResource, 'kind'>): StaticResource {
  return { kind: 'static', ...def };
}

export function defineTemplateResource(def: Omit<TemplateResource, 'kind'>): TemplateResource {
  return { kind: 'template', ...def };
}
