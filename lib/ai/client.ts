import 'server-only';
import Anthropic from '@anthropic-ai/sdk';

// Singleton Anthropic client — server-side only.
// NEVER prefix ANTHROPIC_API_KEY with NEXT_PUBLIC_.
// Source: docs/architecture/fullstack-architecture.md#8-segurança-da-arquitetura
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});
