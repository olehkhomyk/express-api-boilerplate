import { Router } from 'express';
import { userRouter } from '../modules/users/user.routes.js';
import { authRouter } from '../modules/auth/auth.router.js';
import { authenticate } from '../common/security/authenticate.js';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/users', authenticate, userRouter);
// apiRouter.use('/users', userRouter);

export default apiRouter;