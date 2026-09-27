import mongoose, { mongo } from 'mongoose';
import { ZodError } from 'zod';
import { AppError } from '../app-error.js';
import { HttpError } from '../http-error.js';
import { ConflictError } from '../conflict-error.js';
import { ValidationError } from '../validation-error.js';
import { HttpStatus } from '../../http/http-status.js';

const MONGO_DUPLICATE_KEY = 11000;

type BodyParserError = { type: string; status: number };

type KnownError = {
	status: HttpStatus;
	code: string;
	message: string;
};

const BODY_PARSER_ERRORS: Record<string, KnownError> = {
	'entity.parse.failed': {
		status: HttpStatus.BAD_REQUEST,
		code: 'INVALID_JSON',
		message: 'Malformed JSON body',
	},
	'entity.too.large': {
		status: HttpStatus.PAYLOAD_TOO_LARGE,
		code: 'PAYLOAD_TOO_LARGE',
		message: 'Request body is too large',
	},
	'encoding.unsupported': {
		status: HttpStatus.UNSUPPORTED_MEDIA_TYPE,
		code: 'UNSUPPORTED_ENCODING',
		message: 'Unsupported content encoding',
	},
	'charset.unsupported': {
		status: HttpStatus.UNSUPPORTED_MEDIA_TYPE,
		code: 'UNSUPPORTED_CHARSET',
		message: 'Unsupported charset',
	},
};

function isBodyParserError(err: unknown): err is BodyParserError {
	return (
		typeof err === 'object' &&
		err !== null &&
		'type' in err &&
		typeof err.type === 'string' &&
		'status' in err &&
		typeof err.status === 'number'
	);
}

function isRequestTimeoutError(err: unknown): boolean {
	return (
		typeof err === 'object' &&
		err !== null &&
		'code' in err &&
		err.code === 'ETIMEDOUT' &&
		'status' in err &&
		err.status === HttpStatus.SERVICE_UNAVAILABLE
	);
}

/**
 * Translates known third-party errors into AppError.
 * Returns null for unknown errors, which must be treated as unexpected (500).
 */
export function normalizeError(err: unknown): AppError | null {
	if (err instanceof AppError) {
		return err;
	}

	// schema.parse() called outside validateReq (controller, service, env).
	if (err instanceof ZodError) {
		return ValidationError.fromZod(err);
	}

	// Unique index violation, e.g. two users registering with the same email at the same time.
	// Only field names go to the client: values may contain personal data.
	if (err instanceof mongo.MongoServerError && err.code === MONGO_DUPLICATE_KEY) {
		const fields = Object.keys(err.keyPattern ?? {});

		return new ConflictError('Resource already exists', { details: { fields }, cause: err });
	}

	// Mongoose schema validation failed on save().
	if (err instanceof mongoose.Error.ValidationError) {
		return new ValidationError(
			Object.values(err.errors).map(e => ({ field: e.path, message: e.message })),
		);
	}

	// Value could not be cast to the schema type, e.g. findById('not-an-object-id').
	if (err instanceof mongoose.Error.CastError) {
		return new ValidationError([{ field: err.path, message: `Invalid value for ${err.path}` }]);
	}

	// connect-timeout: no response within REQUEST_TIMEOUT_MS.
	if (isRequestTimeoutError(err)) {
		return new HttpError(HttpStatus.SERVICE_UNAVAILABLE, 'REQUEST_TIMEOUT', 'Request took too long', { cause: err });
	}

	if (isBodyParserError(err)) {
		const known = BODY_PARSER_ERRORS[err.type];

		if (known) {
			return new HttpError(known.status, known.code, known.message, { cause: err });
		}

		if (err.status < 500) {
			return new HttpError(HttpStatus.BAD_REQUEST, 'BAD_REQUEST', 'Invalid request body', { cause: err });
		}
	}

	return null;
}
