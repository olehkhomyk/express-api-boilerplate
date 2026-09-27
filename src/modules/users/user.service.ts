import { UserModel } from './user.model.js';
import { CreateUserBody, UpdateUserBody } from './user.validation.js';
import { toUserDTO, UserDTO } from './user.dto.js';
import { NotFoundError } from '../../common/errors/not-found-error.js';
import { ConflictError } from '../../common/errors/conflict-error.js';
import { getLogger } from '../../common/logger/request-context.js';
import { hashPassword } from '../../common/security/password.js';

export async function createUser(data: CreateUserBody): Promise<UserDTO> {
	const existingUser = await UserModel.findOne({ email: data.email });

	if (existingUser) {
		throw new ConflictError('User with this email already exists');
	}

	const { password, ...rest } = data;
	const user = new UserModel(rest);

	user.passwordHash = await hashPassword(password);

	const result = await user.save();
	getLogger().info({ userId: result.id }, 'User created');

	return toUserDTO(result);
}

export async function getAllUsers(): Promise<UserDTO[]> {
	const users = await UserModel.find({});

	return users.map(toUserDTO);
}

// Convention: find* returns null when nothing is found, get* throws NotFoundError.

export async function findById(id: string): Promise<UserDTO | null> {
	const user = await UserModel.findById(id);

	return user ? toUserDTO(user) : null;
}

export async function getById(id: string): Promise<UserDTO> {
	const user = await findById(id);

	if (!user) {
		throw new NotFoundError(`User with id ${id} not found`);
	}

	return user;
}

export async function getByEmail(email: string): Promise<UserDTO> {
	const user = await UserModel.findOne({ email });

	if (!user) {
		throw new NotFoundError(`User with email ${email} not found`);
	}

	return toUserDTO(user);
}

export async function updateUser(id: string, data: UpdateUserBody): Promise<UserDTO> {
	const foundUser = await UserModel.findById(id);

	if (!foundUser) {
		throw new NotFoundError(`User with id ${id} not found`);
	}

	foundUser.set(data);
	const result = await foundUser.save();

	getLogger().info({ userId: result.id }, 'User updated');

	return toUserDTO(result);
}

export async function deleteById(id: string): Promise<void> {
	const user = await UserModel.findByIdAndDelete(id);

	if (!user) {
		throw new NotFoundError(`User with id ${id} not found`);
	}

	getLogger().info({ userId: id }, 'User deleted');
}
