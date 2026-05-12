import { z, ZodRawShape } from 'zod';
import type { SansanClient } from '../client.js';

export interface ToolDefinition<Shape extends ZodRawShape> {
  name: string;
  title: string;
  description: string;
  inputSchema: Shape;
  handler: (client: SansanClient, args: z.objectOutputType<Shape, z.ZodTypeAny>) => Promise<unknown>;
}

export function defineTool<Shape extends ZodRawShape>(
  def: ToolDefinition<Shape>,
): ToolDefinition<Shape> {
  return def;
}
