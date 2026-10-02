import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  WOO_URL: z.string().url(),
  WOO_KEY: z.string().min(1),
  WOO_SECRET: z.string().min(1),
  ADMIN_PORT: z.string().transform(Number).default(3000),
  ENCRYPTION_KEY: z.string().min(32).max(32).optional(),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  AGENT_AUTH_TOKEN: z.string().min(8).optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const config = parsed.data;
