import { mongoose } from '@adarsh-mishra/node-utils/mongoHelpers';

import { userRefreshToken } from '../schemas';
import { IUserRefreshTokenRaw } from '../types';

export const UserRefreshTokenModel = mongoose.model<IUserRefreshTokenRaw>(
	userRefreshToken.schemaName,
	userRefreshToken.schema,
	userRefreshToken.schemaName,
);
