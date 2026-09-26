import type { Request, Response } from 'express';
import { EmptyObject } from '../../common/types/empty-object.js';
import { LoginBody } from './auth.validation.js';
import { LoginDTO } from './login.dto.js';
import * as authService from './auth.service.js';

export async function login(
	req: Request<EmptyObject, LoginDTO, LoginBody>,
	res: Response<LoginDTO>,
): Promise<void> {
	const accessToken = await authService.login(
		req.body.email,
		req.body.password,
	);

	res.json({
		accessToken,
	});
}
