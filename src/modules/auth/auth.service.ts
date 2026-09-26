import { UserModel } from '../users/user.model.js';
import { UnauthorizedError } from '../../common/errors/unauthorized-error.js';
import { verifyPassword } from '../../common/security/password.js';
import { signAccessToken } from '../../common/security/jwt.js';
import { UNAUTHORIZED_ERROR_MESSAGE } from './auth.constants.js';

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
		role: user.role,
	});
}

