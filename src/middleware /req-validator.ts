import type { NextFunction, Request, Response } from 'express';
import { ZodType } from 'zod';

export function validateReq(schema: ZodType) {
	return (req: Request, res: Response, next: NextFunction) => {
		const result = schema.safeParse({
			body: req.body,
			params: req.params,
			query: req.query,
		});

		if (!result.success) {
			return res.status(400).json({
				error: {
					code: 'VALIDATION_ERROR',
					message: 'Validation failed',
					details: result.error.issues.map(issue => ({
						field: issue.path.join('.'),
						message: issue.message,
					})),
				},
			});
		}

		next();
	};
}
