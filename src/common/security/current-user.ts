import type { Request } from 'express';
import { UnauthorizedError } from '../errors/unauthorized-error.js';

export function getCurrentUser(req: Request): NonNullable<Request['user']> {
	if (!req.user) {
		throw new UnauthorizedError('Authentication required');
	}
	return req.user;
}
