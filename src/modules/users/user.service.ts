import { UserModel } from './user.model.js';
import { CreateUserBody, UpdateUserBody } from './user.validation.js';
import { toUserDTO, UserDTO } from './user.dto.js';
import { NotFoundError } from '../../common/errors/not-found-error.js';
import { ConflictError } from '../../common/errors/conflict-error.js';
import { UnexpectedError } from '../../common/errors/unexpected-error.js';

export async function createUser(data: CreateUserBody): Promise<UserDTO> {
	const existingUser = await UserModel.findOne({ email: data.email });

	if (existingUser) {
		throw new ConflictError('User with this email already exists');
	}

	try {
		const { password, ...rest } = data;
		const userRecord = new UserModel(rest);

		// TODO: Implement hasher for the password.
		//  temporary solution.
		userRecord.passwordHash = password;

		await userRecord.save();

		return toUserDTO(userRecord);
	} catch (e) {
		// Todo: Make errors like tis to be logged in by logger as red error in console not throw to client.
		throw new UnexpectedError(`${e}`);
	}
}

export async function getAllUsers(): Promise<UserDTO[]> {
	const users = await UserModel.find({});

	return users.map(toUserDTO);
}

export async function getById(id: string): Promise<UserDTO> {
	const user = await UserModel.findById(id);

	if (!user) {
		throw new NotFoundError(`User with id ${id} not found`);
	}

	return toUserDTO(user);
}

export async function updateUser(id: string, data: UpdateUserBody): Promise<UserDTO> {
	const foundUser = await UserModel.findById(id);

	if (!foundUser) {
		throw new NotFoundError(`User with id ${id} not found`);
	}

	foundUser.set(data);
	const userRecord = await foundUser.save();

	return toUserDTO(userRecord);
}

export async function deleteById(id: string): Promise<void> {
	const user = await UserModel.findByIdAndDelete(id);

	if (!user) {
		throw new NotFoundError(`User with id ${id} not found`);
	}
}
