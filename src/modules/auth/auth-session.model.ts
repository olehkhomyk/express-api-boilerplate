import { model, Schema } from 'mongoose';

const authSessionSchema = new Schema(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			index: true,
		},

		tokenHash: {
			type: String,
			required: true,
			unique: true,
		},

		expiresAt: {
			type: Date,
			required: true,
		},
	},
	{
		timestamps: true,
	},
);

export const AuthSessionModel =
	model('AuthSession', authSessionSchema);
