import { HttpStatus } from '../http/http-status.js';
import { AppError } from './app-error.js';

export class UnexpectedError extends AppError {
	constructor(message: string) {
		super(
			HttpStatus.INTERNAL_SERVER_ERROR,
			'INTERNAL SERVER ERROR',
			message,
		);
	}
}
