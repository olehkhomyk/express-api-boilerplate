import { UserRole } from '../auth/user-role.js';

declare global {
	namespace Express {
		interface Request {
			user?: {
				id: string;
				roles: UserRole[];
			};
		}
	}
}

export {};
