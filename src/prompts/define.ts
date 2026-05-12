import { z, ZodRawShape } from 'zod';

export interface PromptMessage {
  role: 'user' | 'assistant';
  content: { type: 'text'; text: string };
}

export interface PromptDefinition<Shape extends ZodRawShape> {
  name: string;
  title: string;
  description: string;
  argsSchema: Shape;
  build: (args: z.objectOutputType<Shape, z.ZodTypeAny>) => PromptMessage[];
}

export function definePrompt<Shape extends ZodRawShape>(
  def: PromptDefinition<Shape>,
): PromptDefinition<Shape> {
  return def;
}
