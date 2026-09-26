import type { NextFunction, Request, Response } from 'express';
import { UnauthorizedError } from '../errors/unauthorized-error.js';
import { AccessTokenPayload, verifyAccessToken } from './jwt.js';

export async function authenticate(
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> {
	const authorization = req.headers.authorization;

	if (!authorization?.startsWith('Bearer ')) {
		throw new UnauthorizedError('Authentication required');
	}

	const token = authorization.slice(7);

	let payload: AccessTokenPayload;

	try {
		payload = await verifyAccessToken(token);
	} catch {
		throw new UnauthorizedError('Invalid or expired token');
	}

	req.user = {
		id: payload.sub,
		roles: payload.roles,
	};

	next();
}
