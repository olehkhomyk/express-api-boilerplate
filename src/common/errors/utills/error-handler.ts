import type { ErrorRequestHandler } from 'express';

import { HttpStatus } from '../../http/http-status.js';
import { normalizeError } from './normalize-error.js';

export const appErrorHandler: ErrorRequestHandler = (
	err,
	req,
	res,
	next,
) => {
	const appError = normalizeError(err);

	if (appError) {
		res.status(appError.status).json({
			error: {
				code: appError.code,
				message: appError.message,
				requestId: req.id,
				...(appError.details !== undefined && { details: appError.details }),
			},
		});

		return;
	}

	// Only unexpected errors reach the log with a stack trace.
	res.err = err;

	res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
		error: {
			code: 'INTERNAL_SERVER_ERROR',
			message: 'Internal server error',
			requestId: req.id,
		},
	});
};
