import { Router } from 'express';
import { userRouter } from '../modules/users/user.routes.js';
import { authRouter } from '../modules/auth/auth.router.js';

export const apiRouter = Router();

apiRouter.use('/users', userRouter);
apiRouter.use('/auth', authRouter);

export default apiRouter;