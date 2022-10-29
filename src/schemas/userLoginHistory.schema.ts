import { mongoose } from '@adarsh-mishra/node-utils/mongoHelpers';

import { IUserLoginHistoryRaw } from '../types/userLoginHistory';

import { schemaName as UsersSchemaName } from './users.schema';

export const schemaName = 'userLoginHistory';
export const schema = new mongoose.Schema<IUserLoginHistoryRaw>(
	{
		userId: {
			type: mongoose.SchemaTypes.ObjectId,
			required: true,
			ref: UsersSchemaName,
		},
		loginMetaData: {
			type: mongoose.SchemaTypes.String,
			required: true,
		},
		isValid: {
			type: mongoose.SchemaTypes.Boolean,
			required: true,
			default: true,
		},
	},
	{ timestamps: true, collection: schemaName },
);
