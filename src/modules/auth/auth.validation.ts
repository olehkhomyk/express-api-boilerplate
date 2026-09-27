import { z } from 'zod';

export const loginSchema = z.object({
	body: z.object({
		email: z.email(),
		password: z.string().min(1),
	}),
});

export const registerSchema = z.object({
	body: z.object({
		firstName: z.string().trim().min(2).max(50),
		lastName: z.string().trim().min(2).max(50),
		email: z.email().toLowerCase(),
		password: z.string().min(8).max(128),
	}),
});

export type LoginBody = z.infer<typeof loginSchema>['body'];
export type RegisterBody = z.infer<typeof registerSchema>['body'];
