import { AppError } from './app-error.js';
import { HttpStatus } from '../http/http-status.js';

export class UnauthorizedError extends AppError {
	constructor(message: string) {
		super(
			HttpStatus.UNAUTHORIZED,
			'UNAUTHORIZED',
			message,
		);
	}
}
