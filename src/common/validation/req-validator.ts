import type { NextFunction, Request, Response } from 'express';
import { ZodType } from 'zod';
import { ValidationError } from '../errors/validation-error.js';

export function validateReq(schema: ZodType) {
	return (req: Request, res: Response, next: NextFunction) => {
		const result = schema.safeParse({
			body: req.body,
			params: req.params,
			query: req.query,
		});

		if (!result.success) {
			throw ValidationError.fromZod(result.error);
		}

		const { body, params, query } = result.data as { body?: unknown; params?: unknown; query?: unknown };

		if (body) {
			req.body = body;
		}
		if (params) {
			req.params = params as Request['params'];
		}
		if (query) {
			// As in Express 5 query is readonly getter, need to redefine it this way.
			Object.defineProperty(req, 'query', { value: query });
		}

		next();
	};
}
