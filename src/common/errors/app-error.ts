import { HttpStatus } from '../http/http-status.js';

export type AppErrorOptions = {
	details?: unknown;
	cause?: unknown;
};

export abstract class AppError extends Error {
	public readonly details?: unknown;

	constructor(
		public readonly status: HttpStatus,
		public readonly code: string,
		message: string,
		options: AppErrorOptions = {},
	) {
		super(message, { cause: options.cause });
		this.details = options.details;

		Error.captureStackTrace(this, this.constructor);
	}
}
