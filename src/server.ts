import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ZodRawShape } from 'zod';
import type { Config } from './config.js';
import { SansanClient } from './client.js';
import { tools } from './tools/index.js';
import { resources } from './resources/index.js';
import { prompts } from './prompts/index.js';
import type { PromptDefinition } from './prompts/define.js';
import { SansanApiError } from './errors.js';

const VERSION = '0.2.0';

function formatError(err: unknown): string {
  if (err instanceof SansanApiError) {
    return `${err.message}\nendpoint: ${err.endpoint}\nstatus: ${err.status}\nbody: ${JSON.stringify(err.body, null, 2)}`;
  }
  return err instanceof Error ? err.message : String(err);
}

export function createServer(config: Config): McpServer {
  const client = new SansanClient(config);

  const server = new McpServer({
    name: 'sansan-mcp',
    version: VERSION,
  });

  for (const tool of tools) {
    server.registerTool(
      tool.name,
      {
        title: tool.title,
        description: tool.description,
        inputSchema: tool.inputSchema,
      },
      async (args: unknown) => {
        try {
          const handler = tool.handler as (c: SansanClient, a: unknown) => Promise<unknown>;
          const result = await handler(client, args);
          return {
            content: [
              {
                type: 'text' as const,
                text: JSON.stringify(result ?? { ok: true }, null, 2),
              },
            ],
          };
        } catch (err) {
          return {
            isError: true,
            content: [{ type: 'text' as const, text: formatError(err) }],
          };
        }
      },
    );
  }

  for (const resource of resources) {
    if (resource.kind === 'static') {
      server.registerResource(
        resource.name,
        resource.uri,
        {
          title: resource.title,
          description: resource.description,
          mimeType: resource.mimeType,
        },
        async (uri) => resource.read(client, uri),
      );
    } else {
      server.registerResource(
        resource.name,
        resource.template,
        {
          title: resource.title,
          description: resource.description,
          mimeType: resource.mimeType,
        },
        async (uri, variables) => resource.read(client, uri, variables),
      );
    }
  }

  for (const prompt of prompts) {
    registerPromptOn(server, prompt as PromptDefinition<ZodRawShape>);
  }

  return server;
}

function registerPromptOn<S extends ZodRawShape>(
  server: McpServer,
  prompt: PromptDefinition<S>,
): void {
  const callback = ((args: Record<string, unknown>) => ({
    messages: (prompt.build as (a: unknown) => ReturnType<typeof prompt.build>)(args),
  })) as unknown as Parameters<typeof server.registerPrompt<S>>[2];

  server.registerPrompt<S>(
    prompt.name,
    {
      title: prompt.title,
      description: prompt.description,
      argsSchema: prompt.argsSchema,
    },
    callback,
  );
}

export async function runServer(config: Config): Promise<void> {
  const server = createServer(config);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
