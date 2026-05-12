import { z } from 'zod';

const ConfigSchema = z.object({
  apiKey: z
    .string()
    .min(1, 'SANSAN_API_KEY is required')
    .regex(/^[A-Za-z0-9]{32}$/, 'SANSAN_API_KEY must be 32 alphanumeric characters'),
  appId: z.string().optional(),
  baseUrl: z.string().url().optional(),
});

export type Config = z.infer<typeof ConfigSchema>;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const parsed = ConfigSchema.safeParse({
    apiKey: env.SANSAN_API_KEY,
    appId: env.SANSAN_APP_ID,
    baseUrl: env.SANSAN_BASE_URL,
  });

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('\n');
    throw new Error(
      `sansan-mcp: invalid configuration. Set the required environment variables (see .env.example):\n${issues}`,
    );
  }
  return parsed.data;
}

export function resolveBaseUrl(config: Config): string {
  return config.baseUrl ?? 'https://api.sansan.com/v6.0';
}
