import { jwtVerify, SignJWT } from 'jose';
import { UserRole } from '../auth/user-role.js';

const secret = new TextEncoder().encode(
	process.env.JWT_ACCESS_SECRET,
);

const expiresIn = process.env.JWT_EXPIRES_IN || '15m';

export type AccessTokenPayload = {
	sub: string;
	roles: UserRole[];
};

export async function signAccessToken(
	payload: AccessTokenPayload,
): Promise<string> {
	return new SignJWT({
		roles: [...payload.roles],
	})
		.setProtectedHeader({
			alg: 'HS256',
		})
		.setSubject(payload.sub)
		.setIssuedAt()
		.setExpirationTime(expiresIn)
		.sign(secret);
}

export async function verifyAccessToken(
	token: string,
): Promise<AccessTokenPayload> {
	const { payload } = await jwtVerify(token, secret, {
		algorithms: ['HS256'],
	});

	if (!payload.sub || !Array.isArray(payload.roles)) {
		throw new Error('Invalid access token payload');
	}

	return {
		sub: payload.sub,
		roles: payload.roles as UserRole[],
	};
}
