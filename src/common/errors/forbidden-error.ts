import { AppError } from './app-error.js';
import { HttpStatus } from '../http/http-status.js';

export class ForbiddenError extends AppError {
	constructor(message: string) {
		super(
			HttpStatus.FORBIDDEN,
			'FORBIDDEN',
			message,
		);
	}
}
