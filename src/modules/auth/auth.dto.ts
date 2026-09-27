import { UserDTO } from '../users/user.dto.js';

export type AuthDTO = {
	accessToken: string;
	accessTokenExpiresIn: number;
};

export type RefreshTokenDTO = {
	refreshToken: string;
};

export type LoginDTO = AuthDTO & {
	user: UserDTO;
};

export type RegisterDTO = AuthDTO & {
	user: UserDTO;
};
