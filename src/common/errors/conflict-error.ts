import { HttpStatus } from '../http/http-status.js';
import { AppError } from './app-error.js';

export class ConflictError extends AppError {
	constructor(message: string) {
		super(
			HttpStatus.CONFLICT,
			'CONFLICT',
			message,
		);
	}
}
