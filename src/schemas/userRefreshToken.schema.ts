import { mongoose } from '@adarsh-mishra/node-utils/mongoHelpers';

import { IUserRefreshToken } from '../types';

import { schemaName as userLoginHistorySchemaName } from './userLoginHistory.schema';

export const schemaName = 'userRefreshToken';
export const schema = new mongoose.Schema<IUserRefreshToken>(
	{
		loginId: {
			type: mongoose.SchemaTypes.ObjectId,
			required: true,
			ref: userLoginHistorySchemaName,
		},
		loginMetaData: {
			type: mongoose.SchemaTypes.String,
			required: true,
		},
	},
	{ timestamps: true, collection: schemaName },
);
