import { Router } from 'express';
import * as userController from './user.controller.js';
import { validateReq } from '../../common/validation/req-validator.js';
import { createUserSchema, deleteUserByIdSchema, getUserByIdSchema, updateUserSchema } from './user.validation.js';
import { authorize } from '../../common/security/authorize.js';
import { UserRole } from '../../common/auth/user-role.js';

export const userRouter = Router();

userRouter.get('/', userController.getUsers);

userRouter.get('/me', authorize(UserRole.USER), userController.getMe);

userRouter.get('/:id', validateReq(getUserByIdSchema), userController.getUserById);

userRouter.post('/', authorize(UserRole.ADMIN), validateReq(createUserSchema), userController.createUser);

userRouter.put('/:id', authorize(UserRole.ADMIN), validateReq(updateUserSchema), userController.updateUser);

userRouter.delete('/:id', authorize(UserRole.ADMIN), validateReq(deleteUserByIdSchema), userController.deleteUser);
