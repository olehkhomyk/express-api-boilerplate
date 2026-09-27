import 'dotenv/config';
import { z } from 'zod';

/**
 * Single source of truth for configuration.
 * The app validates env on startup and refuses to start with a broken config (fail fast).
 * Nothing else in the codebase should read process.env directly.
 */
const envSchema = z.object({
	NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
	PORT: z.coerce.number().int().positive().default(3000),
	LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'silent']).default('info'),

	MONGO_URI: z.string().regex(/^mongodb(\+srv)?:\/\//, 'MONGO_URI must start with mongodb:// or mongodb+srv://'),

	JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
	JWT_ACCESS_EXPIRES_IN: z.string().regex(/^\d+[smhd]$/, 'JWT_ACCESS_EXPIRES_IN must look like 15m, 1h or 7d').default('15m'),

	// Number of reverse proxies in front of the app (nginx, load balancer, Railway…).
	// 0 = no proxy (local dev). Never "true": clients could spoof X-Forwarded-For and fake their IP.
	TRUST_PROXY: z.coerce.number().int().min(0).default(0),

	// Comma-separated list of frontend origins allowed to call the API from a browser,
	// e.g. "http://localhost:5173,https://app.site.com".
	// "*" allows any origin. TODO: replace "*" with the real list before going to production.
	CORS_ORIGINS: z
		.string()
		.default('*')
		.transform((value): true | string[] =>
			value === '*'
				? true
				: value.split(',').map(origin => origin.trim()).filter(Boolean),
		),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
	// The logger depends on env, so console is the only option here.
	console.error(`Invalid environment configuration:\n${z.prettifyError(result.error)}`);
	process.exit(1);
}

export const env = result.data;

export const isDev = env.NODE_ENV === 'development';
export const isProd = env.NODE_ENV === 'production';
