import { Router } from 'express';
import { userRouter } from '../modules/users/user.routes.js';
import { authRouter } from '../modules/auth/auth.router.js';
import { authenticate } from '../common/security/authenticate.js';
import { AUTH_BASE_PATH } from '../modules/auth/auth.constants.js';
import { USER_BASE_PATH } from '../modules/users/user.constants.js';

export const apiRouter = Router();

apiRouter.use(AUTH_BASE_PATH, authRouter);
apiRouter.use(USER_BASE_PATH, authenticate, userRouter);

export default apiRouter;
