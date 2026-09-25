import { UserDocument } from './user.model.js';

export type UserDTO = {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
};

export function toUserDTO(user: UserDocument): UserDTO {
	return {
		id: user._id.toString(),
		firstName: user.firstName,
		lastName: user.lastName,
		email: user.email,
	};
}
