import { mongoose } from '@adarsh-mishra/node-utils/mongoHelpers';

import { userRefreshToken } from '../schemas';
import { IUserRefreshToken } from '../types';

export const UserRefreshTokenModel = mongoose.model<IUserRefreshToken>(
	userRefreshToken.schemaName,
	userRefreshToken.schema,
	userRefreshToken.schemaName,
);
