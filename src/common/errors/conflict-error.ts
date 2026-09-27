import { HttpStatus } from '../http/http-status.js';
import { AppError, AppErrorOptions } from './app-error.js';

export class ConflictError extends AppError {
	constructor(message: string, options?: AppErrorOptions) {
		super(
			HttpStatus.CONFLICT,
			'CONFLICT',
			message,
			options,
		);
	}
}
