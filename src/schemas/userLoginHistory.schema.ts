import { mongoose } from '@adarsh-mishra/node-utils/mongoHelpers';

import { IUserLoginHistory } from '../types/userLoginHistory';

export const collectionName = 'userLoginHistory';
export const schema = new mongoose.Schema<IUserLoginHistory>(
	{
		userId: {
			type: mongoose.SchemaTypes.ObjectId,
			required: true,
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
	{ timestamps: true, collection: collectionName },
);
