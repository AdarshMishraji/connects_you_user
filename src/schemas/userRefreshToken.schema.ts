import { mongoose } from '@adarsh-mishra/node-utils';

import { IUserRefreshToken } from '../types';

export const collectionName = 'userRefreshToken';
export const schema = new mongoose.Schema<IUserRefreshToken>(
	{
		loginId: {
			type: mongoose.SchemaTypes.ObjectId,
			required: true,
		},
		loginMetaData: {
			type: mongoose.SchemaTypes.String,
			required: true,
		},
	},
	{ timestamps: true, collection: collectionName },
);
