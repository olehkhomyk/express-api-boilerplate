import type { Request, Response } from 'express';
import { EmptyObject } from '../../common/types/empty-object.js';
import { HttpStatus } from '../../common/http/http-status.js';
import * as userService from './user.service.js';
import { UserDTO } from './user.dto.js';
import {
	CreateUserBody,
	DeleteUserParams,
	GetByIdUserParams,
	UpdateUserBody,
	UpdateUserParams,
} from './user.validation.js';

export async function createUser(
	req: Request<EmptyObject, UserDTO, CreateUserBody>,
	res: Response<UserDTO>,
): Promise<void> {
	const user: UserDTO = await userService.createUser(req.body);

	res.status(HttpStatus.OK).json(user);
}

export async function getUsers(
	req: Request,
	res: Response<UserDTO[]>,
): Promise<void> {
	const users: UserDTO[] = await userService.getAllUsers();

	res.status(HttpStatus.OK).json(users);
}

export async function getUserById(
	req: Request<GetByIdUserParams, UserDTO>,
	res: Response<UserDTO>,
): Promise<void> {
	const user: UserDTO = await userService.getById(req.params.id);

	res.status(HttpStatus.OK).json(user);
}

export async function updateUser(
	req: Request<UpdateUserParams, UserDTO, UpdateUserBody>,
	res: Response<UserDTO>,
): Promise<void> {
	const user: UserDTO = await userService.updateUser(req.params.id, req.body);

	res.status(HttpStatus.OK).json(user);
}

export async function deleteUser(
	req: Request<DeleteUserParams>,
	res: Response<void>,
): Promise<void> {
	await userService.deleteById(req.params.id);

	res.status(HttpStatus.OK).status(200).end();
}
