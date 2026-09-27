import { CookieOptions } from 'express';
import { API_PREFIX } from '../../common/http/api-prefix.js';
import { isProd } from '../../config/env.js';

export const AUTH_BASE_PATH = '/auth';

export const REFRESH_COOKIE_NAME = 'refreshToken';
export const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days.

export const refreshCookieOptions: CookieOptions = {
	httpOnly: true,
	secure: isProd,
	sameSite: 'strict',
	path: `${API_PREFIX}${AUTH_BASE_PATH}`,
	maxAge: REFRESH_TTL_MS,
};

export const UNAUTHORIZED_ERROR_MESSAGE = 'Invalid email or password';

