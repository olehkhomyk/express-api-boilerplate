import { AppError } from './app-error.js';
import { HttpStatus } from '../http/http-status.js';

export class NotFoundError extends AppError {
	constructor(message: string) {
		super(
			HttpStatus.NOT_FOUND,
			'NOT_FOUND',
			message,
		);
	}
}
