import type { Request, Response } from 'express';
import { EmptyObject } from '../../common/types/empty-object.js';
import { LoginBody, RegisterBody } from './auth.validation.js';
import { AuthDTO, LoginDTO, RegisterDTO } from './auth.dto.js';
import * as authService from './auth.service.js';
import { HttpStatus } from '../../common/http/http-status.js';
import { UnauthorizedError } from '../../common/errors/unauthorized-error.js';
import { REFRESH_COOKIE_NAME, refreshCookieOptions } from './auth.constants.js';

export async function login(
	req: Request<EmptyObject, LoginDTO, LoginBody>,
	res: Response<LoginDTO>,
): Promise<void> {
	const { refreshToken, ...authData } = await authService.login(
		req.body.email,
		req.body.password,
	);

	res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions);
	res.json(authData);
}

export async function register(
	req: Request<EmptyObject, RegisterDTO, RegisterBody>,
	res: Response<RegisterDTO>,
): Promise<void> {
	const { refreshToken, ...authData } = await authService.register(req.body);

	res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions);
	res.status(HttpStatus.CREATED).json(authData);
}

export async function logout(
	req: Request,
	res: Response,
): Promise<void> {
	const token = req.cookies.refreshToken;

	if (!token) {
		throw new UnauthorizedError('Refresh token missing');
	}

	await authService.logout(token);
	res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions);
	res.status(HttpStatus.OK).end();
}

export async function refresh(
	req: Request<EmptyObject, AuthDTO>,
	res: Response<AuthDTO>,
): Promise<void> {
	const token = req.cookies.refreshToken;
	if (!token) {
		throw new UnauthorizedError('Refresh token missing');
	}


	const { refreshToken, ...authData } = await authService.refresh(token);
	res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions);

	res.status(HttpStatus.OK).json(authData);
}
