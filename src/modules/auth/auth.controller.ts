import type { Request, Response } from 'express';
import { EmptyObject } from '../../common/types/empty-object.js';
import { LoginBody, RegisterBody } from './auth.validation.js';
import { AuthDTO } from './authDTO.js';
import * as authService from './auth.service.js';
import * as userService from '../users/user.service.js';
import { HttpStatus } from '../../common/http/http-status.js';

export async function login(
	req: Request<EmptyObject, AuthDTO, LoginBody>,
	res: Response<AuthDTO>,
): Promise<void> {
	const accessToken = await authService.login(
		req.body.email,
		req.body.password,
	);

	const user = await userService.getByEmail(req.body.email);

	res.json({ user, accessToken });
}

export async function register(
	req: Request<EmptyObject, AuthDTO, RegisterBody>,
	res: Response<AuthDTO>,
): Promise<void> {
	const result = await authService.register(req.body);

	res.status(HttpStatus.CREATED).json(result);
}
