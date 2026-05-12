import { loadConfig } from './config.js';
import { runServer } from './server.js';

async function main(): Promise<void> {
  const config = loadConfig();
  await runServer(config);
}

main().catch((err) => {
  process.stderr.write(`sansan-mcp: ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
