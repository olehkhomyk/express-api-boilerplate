import type { RequestHandler } from 'express';
import { NotFoundError } from './not-found-error.js';

export const notFoundHandler: RequestHandler = (req) => {
	throw new NotFoundError(`Route ${req.method} ${req.path} not found`);
};
