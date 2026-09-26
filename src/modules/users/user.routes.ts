import { Router } from 'express';
import * as userController from './user.controller.js';
import { validateReq } from '../../common/validation/req-validator.js';
import { createUserSchema, deleteUserByIdSchema, getUserByIdSchema, updateUserSchema } from './user.validation.js';

export const userRouter = Router();

userRouter.get('/', userController.getUsers);

userRouter.get('/:id', validateReq(getUserByIdSchema), userController.getUserById);

userRouter.post('/', validateReq(createUserSchema), userController.createUser);

userRouter.put('/:id', validateReq(updateUserSchema), userController.updateUser);

userRouter.delete('/:id', validateReq(deleteUserByIdSchema), userController.deleteUser);
