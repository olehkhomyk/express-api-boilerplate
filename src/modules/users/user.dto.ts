import { UserDocument } from './user.model.js';
import { UserRole } from '../../common/auth/user-role.js';

export type UserDTO = {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	roles: UserRole[];
};

export function toUserDTO(user: UserDocument): UserDTO {
	return {
		id: user._id.toString(),
		firstName: user.firstName,
		lastName: user.lastName,
		email: user.email,
		roles: user.roles,
	};
}
