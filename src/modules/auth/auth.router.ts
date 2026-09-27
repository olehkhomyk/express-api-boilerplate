import { Router } from 'express';
import { validateReq } from '../../common/validation/req-validator.js';
import { loginSchema, registerSchema } from './auth.validation.js';
import * as authController from './auth.controller.js';

export const authRouter = Router();

authRouter.post(
	'/login',
	validateReq(loginSchema),
	authController.login,
);

authRouter.post(
	'/register',
	validateReq(registerSchema),
	authController.register,
);

authRouter.post(
	'/logout',
	authController.logout,
);

authRouter.post(
	'/refresh-token',
	authController.refresh,
);
