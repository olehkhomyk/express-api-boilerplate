import type { ZodError } from 'zod';
import { AppError } from './app-error.js';
import { HttpStatus } from '../http/http-status.js';

export type ValidationIssue = { field: string; message: string };

export class ValidationError extends AppError {
	constructor(details: ValidationIssue[]) {
		super(HttpStatus.BAD_REQUEST, 'VALIDATION_ERROR', 'Validation failed', { details });
	}

	static fromZod(error: ZodError): ValidationError {
		return new ValidationError(
			error.issues.map(issue => ({
				field: issue.path.join('.'),
				message: issue.message,
			})),
		);
	}
}
