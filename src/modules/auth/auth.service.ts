import { UserModel } from '../users/user.model.js';
import { UnauthorizedError } from '../../common/errors/unauthorized-error.js';
import { hashPassword, verifyPassword } from '../../common/security/password.js';
import { signAccessToken } from '../../common/security/jwt.js';
import * as userService from '../users/user.service.js';
import { toUserDTO, UserDTO } from '../users/user.dto.js';
import { REFRESH_TTL_MS, UNAUTHORIZED_ERROR_MESSAGE } from './auth.constants.js';
import { RegisterBody } from './auth.validation.js';
import { AuthDTO, LoginDTO, RefreshTokenDTO, RegisterDTO } from './auth.dto.js';
import { ConflictError } from '../../common/errors/conflict-error.js';
import { generateRefreshToken, hashRefreshToken } from '../../common/security/refresh-token.js';
import { getLogger } from '../../common/logger/request-context.js';
import { AuthSessionModel } from './auth-session.model.js';


export async function login(email: string, password: string): Promise<LoginDTO & RefreshTokenDTO> {
	const result = await UserModel.findOne({ email });

	if (!result) {
		throw new UnauthorizedError(UNAUTHORIZED_ERROR_MESSAGE);
	}

	const passwordValid = await verifyPassword(password, result.passwordHash);

	if (!passwordValid) {
		throw new UnauthorizedError(UNAUTHORIZED_ERROR_MESSAGE);
	}

	getLogger().info({ userId: result.id }, 'User logged in');

	const userDTO = toUserDTO(result);
	const tokens = await issueTokens(userDTO);

	return { user: userDTO, ...tokens };
}

export async function register(data: RegisterBody): Promise<RegisterDTO & RefreshTokenDTO> {
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

	getLogger().info({ userId: result.id }, 'User registered');

	const userDTO = toUserDTO(result);
	const tokens = await issueTokens(userDTO);

	return { user: userDTO, ...tokens };
}

export async function refresh(refreshToken: string): Promise<AuthDTO & RefreshTokenDTO> {
	const session = await AuthSessionModel.findOneAndDelete({
		tokenHash: hashRefreshToken(refreshToken),
		expiresAt: { $gt: new Date() },
	});

	if (!session) {
		throw new UnauthorizedError('Invalid refresh token');
	}

	const userDTO = await userService.getById(session.userId.toString());
	const tokens = await issueTokens(userDTO);

	return { ...tokens };
}

export async function logout(refreshToken: string): Promise<void> {
	await AuthSessionModel.deleteOne({ tokenHash: hashRefreshToken(refreshToken) });
	getLogger().info('Logged out');
}

async function issueTokens(user: UserDTO): Promise<AuthDTO & RefreshTokenDTO> {
	const accessToken = await signAccessToken({
		sub: user.id,
		roles: user.roles,
	});

	const expiresAt = new Date(Date.now() + REFRESH_TTL_MS);

	const refreshToken = generateRefreshToken();
	await AuthSessionModel.create({
		userId: user.id,
		tokenHash: hashRefreshToken(refreshToken),
		expiresAt,
	});

	return { accessToken, accessTokenExpiresIn: expiresAt, refreshToken };
}

