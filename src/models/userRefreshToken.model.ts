import { mongoose } from '@adarsh-mishra/node-utils';

import { userRefreshToken } from '../schemas';
import { IUserRefreshToken } from '../types';

export const UserRefreshTokenModel = mongoose.model<IUserRefreshToken>(
	userRefreshToken.collectionName,
	userRefreshToken.schema,
	userRefreshToken.collectionName,
);
