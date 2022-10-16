import { mongoose } from '@adarsh-mishra/node-utils/mongoHelpers';

import { userRefreshToken } from '../schemas';
import { IUserRefreshToken } from '../types';

export const UserRefreshTokenModel = mongoose.model<IUserRefreshToken>(
	userRefreshToken.collectionName,
	userRefreshToken.schema,
	userRefreshToken.collectionName,
);
