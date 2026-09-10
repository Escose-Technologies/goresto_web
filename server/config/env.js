import { z } from 'zod';
import { existsSync } from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '../../.env');

// Load .env file if it exists (Docker provides env vars directly)
if (existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  BCRYPT_SALT_ROUNDS: z.coerce.number().min(8).max(16).default(12),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().default(50),
  // Gate for superadmin-initiated password resets. Empty disables the endpoint.
  SUPERADMIN_RESET_PASSWORD: z.string().default(''),
  OCI_NAMESPACE: z.string().default(''),
  OCI_BUCKET: z.string().default('goresto-images'),
  OCI_REGION: z.string().default('ap-mumbai-1'),
  OCI_TENANCY_OCID: z.string().default(''),
  OCI_USER_OCID: z.string().default(''),
  OCI_FINGERPRINT: z.string().default(''),
  OCI_PRIVATE_KEY_PATH: z.string().default(''),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Environment validation failed:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

// A guessable reset secret is as good as no secret: it is the only thing
// standing between a compromised superadmin session and every restaurant
// account. Warn rather than exit — refusing to boot would take production down
// over a configuration problem that is not itself an outage.
if (env.SUPERADMIN_RESET_PASSWORD) {
  const value = env.SUPERADMIN_RESET_PASSWORD;
  const weak =
    value.length < 24 ||
    /^[a-z_]+$/.test(value) ||
    /superadmin|password|reset|goresto|changeme|secret/i.test(value);
  if (weak) {
    console.warn(
      '[security] SUPERADMIN_RESET_PASSWORD looks guessable. Generate one with ' +
      '`openssl rand -base64 32` and set it in the environment.'
    );
  }
}
