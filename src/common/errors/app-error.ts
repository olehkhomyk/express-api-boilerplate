import { HttpStatus } from '../http/http-status.js';

export abstract class AppError extends Error {
	constructor(
		public readonly status: HttpStatus,
		public readonly code: string,
		message: string,
	) {
		super(message);

		Error.captureStackTrace(this, this.constructor);
	}
}
