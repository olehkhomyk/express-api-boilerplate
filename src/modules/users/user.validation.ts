import { z } from 'zod';
import { mongoDbIdSchema } from '../../common/validation/mongo-object-id.schema.js';

export const createUserSchema = z.object({
	body: z.object({
		firstName: z.string()
			.trim()
			.min(2)
			.max(50),

		lastName: z.string()
			.trim()
			.min(2)
			.max(50),

		email: z.email(),

		password: z.string()
			.min(8)
			.max(128),
	}),
});

export const updateUserSchema = z.object({
	body: z.object({
		firstName: z.string()
			.trim()
			.min(2)
			.max(50)
			.optional(),

		lastName: z.string()
			.trim()
			.min(2)
			.max(50)
			.optional(),

		email: z.string()
			.trim()
			.min(2)
			.max(50)
			.optional(),
	}),
	params: z.object({ id: mongoDbIdSchema }),
});

export const getUserByIdSchema = z.object({
	params: z.object({ id: mongoDbIdSchema }),
});

export const deleteUserByIdSchema = z.object({
	params: z.object({ id: mongoDbIdSchema }),
});

export type CreateUserBody = z.infer<typeof createUserSchema>['body'];

export type UpdateUserBody = Partial<z.infer<typeof updateUserSchema>['body']>;
export type UpdateUserParams = z.infer<typeof updateUserSchema>['params'];

export type GetByIdUserParams = z.infer<typeof getUserByIdSchema>['params'];
export type DeleteUserParams = z.infer<typeof deleteUserByIdSchema>['params'];
