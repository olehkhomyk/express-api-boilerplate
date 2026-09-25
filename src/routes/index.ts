import { Router } from 'express';
import { userRouter } from '../modules/users/user.routes.js';

export const apiRouter = Router();

apiRouter.use('/users', userRouter);

export default apiRouter;