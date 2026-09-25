import { HydratedDocument, InferSchemaType, model, Schema } from 'mongoose';

const userSchema = new Schema(
	{
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
		},

		firstName: {
			type: String,
			required: true,
			trim: true,
		},

		lastName: {
			type: String,
			required: true,
			trim: true,
		},

		passwordHash: {
			type: String,
			required: true,
		},

		role: {
			type: String,
			enum: ['USER', 'ADMIN'],
			default: 'USER',
		},
	},
	{
		timestamps: true,
	},
);

export const UserModel = model('User', userSchema);
export type UserSchema = InferSchemaType<typeof userSchema>;
export type UserDocument = HydratedDocument<UserSchema>;
