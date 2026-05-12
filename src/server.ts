import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import type { Config } from './config.js';
import { SansanClient } from './client.js';
import { tools } from './tools/index.js';
import { SansanApiError } from './errors.js';

const VERSION = '0.1.0';

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
          const isApi = err instanceof SansanApiError;
          const message = isApi
            ? `${err.message}\nendpoint: ${err.endpoint}\nstatus: ${err.status}\nbody: ${JSON.stringify(err.body, null, 2)}`
            : err instanceof Error
              ? err.message
              : String(err);
          return {
            isError: true,
            content: [{ type: 'text' as const, text: message }],
          };
        }
      },
    );
  }

  return server;
}

export async function runServer(config: Config): Promise<void> {
  const server = createServer(config);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
