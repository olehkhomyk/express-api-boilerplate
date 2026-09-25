import type { ErrorRequestHandler } from 'express';

import { AppError } from './app-error.js';
import { HttpStatus } from '../http/http-status.js';

export const appErrorHandler: ErrorRequestHandler = (
	err,
	req,
	res,
	next,
) => {
	if (err instanceof AppError) {
		res.status(err.status).json({
			error: {
				code: err.code,
				message: err.message,
			},
		});

		return;
	}

	console.error(err);

	res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
		error: {
			code: 'INTERNAL_SERVER_ERROR',
			message: 'Internal server error',
		},
	});
};
