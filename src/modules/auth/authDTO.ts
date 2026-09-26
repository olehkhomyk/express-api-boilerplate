import { UserDTO } from '../users/user.dto.js';

export type AuthDTO = {
	accessToken: string;
	user: UserDTO;
};
