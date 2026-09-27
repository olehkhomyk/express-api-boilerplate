import type { NextFunction, Request, Response } from 'express';

import { UnauthorizedError } from '../errors/unauthorized-error.js';
import { UserRole } from '../auth/user-role.js';
import { ForbiddenError } from '../errors/forbidden-error.js';

export function authorize(...allowedRoles: [UserRole, ...UserRole[]]) {
	return (
		req: Request,
		res: Response,
		next: NextFunction,
	): void => {
		if (!req.user) {
			throw new UnauthorizedError('Authentication required');
		}

		const allowed = req.user.roles.some(role =>
			allowedRoles.includes(role),
		);

		if (!allowed) {
			throw new ForbiddenError('Insufficient permissions');
		}

		next();
	};
}