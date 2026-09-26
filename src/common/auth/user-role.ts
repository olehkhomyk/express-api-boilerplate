export const UserRole = {
	USER: 'USER',
	ADMIN: 'ADMIN',
	MODERATOR: 'MODERATOR',
} as const;

export type UserRole =
	typeof UserRole[keyof typeof UserRole];
