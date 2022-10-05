import { mongoose } from '@adarsh-mishra/node-utils';

import { IUser } from '../types/user';

export const collectionName = 'users';
export const schema = new mongoose.Schema<IUser>(
	{
		name: {
			type: mongoose.SchemaTypes.String,
			required: true,
			index: true,
		},
		email: {
			type: mongoose.SchemaTypes.String,
			required: true,
			index: true,
		},
		emailHash: {
			type: mongoose.SchemaTypes.String,
			required: true,
			index: true,
		},
		photoUrl: {
			type: mongoose.SchemaTypes.String,
		},
		description: {
			type: mongoose.SchemaTypes.String,
		},
		publicKey: {
			type: mongoose.SchemaTypes.String,
			required: true,
		},
		fcmToken: {
			type: mongoose.SchemaTypes.String,
			required: true,
		},
		emailVerified: {
			type: mongoose.SchemaTypes.Boolean,
			required: true,
			default: false,
		},
		authProvider: {
			type: mongoose.SchemaTypes.String,
			required: true,
		},
		locale: {
			type: mongoose.SchemaTypes.String,
			required: true,
			default: 'en',
		},
	},
	{ timestamps: true, collection: 'users' },
);
