import { Router } from 'express';
import { createUser, deleteUser, getUserById, getUsers, updateUser } from './user.controller.js';
import { validateReq } from '../../common/validation/req-validator.js';
import { createUserSchema, deleteUserByIdSchema, getUserByIdSchema, updateUserSchema } from './user.validation.js';

export const userRouter = Router();

userRouter.get('/', getUsers);

userRouter.get('/:id', validateReq(getUserByIdSchema), getUserById);

userRouter.post('/', validateReq(createUserSchema), createUser);

userRouter.put('/:id', validateReq(updateUserSchema), updateUser);

userRouter.delete('/:id', validateReq(deleteUserByIdSchema), deleteUser);
