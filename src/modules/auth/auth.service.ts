import { UserModel } from '../users/user.model.js';
import { UnauthorizedError } from '../../common/errors/unauthorized-error.js';
import { hashPassword, verifyPassword } from '../../common/security/password.js';
import { signAccessToken } from '../../common/security/jwt.js';
import { UNAUTHORIZED_ERROR_MESSAGE } from './auth.constants.js';
import { RegisterBody } from './auth.validation.js';
import { AuthDTO } from './authDTO.js';
import { ConflictError } from '../../common/errors/conflict-error.js';
import { toUserDTO } from '../users/user.dto.js';

export async function login(
	email: string,
	password: string,
): Promise<string> {
	const user = await UserModel.findOne({ email });

	if (!user) {
		throw new UnauthorizedError(UNAUTHORIZED_ERROR_MESSAGE);
	}

	const passwordValid = await verifyPassword(
		password,
		user.passwordHash,
	);

	if (!passwordValid) {
		throw new UnauthorizedError(UNAUTHORIZED_ERROR_MESSAGE);
	}

	return signAccessToken({
		sub: user._id.toString(),
		roles: user.roles,
	});
}

export async function register(
	data: RegisterBody,
): Promise<AuthDTO> {
	const existingUser = await UserModel.findOne({
		email: data.email,
	});

	if (existingUser) {
		throw new ConflictError('User with this email already exists');
	}

	const passwordHash = await hashPassword(data.password);

	const result = await UserModel.create({
		firstName: data.firstName,
		lastName: data.lastName,
		email: data.email,
		passwordHash,
	});

	const userDTO = toUserDTO(result);

	const accessToken = await signAccessToken({
		sub: userDTO.id,
		roles: userDTO.roles,
	});

	return {
		user: userDTO,
		accessToken,
	};
}
