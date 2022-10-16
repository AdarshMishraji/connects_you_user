import { mongoose } from '@adarsh-mishra/node-utils/mongoHelpers';

import { userLoginHistory } from '../schemas';
import { IUserLoginHistory } from '../types';

export const UserLoginHistoryModel = mongoose.model<IUserLoginHistory>(
	userLoginHistory.collectionName,
	userLoginHistory.schema,
	userLoginHistory.collectionName,
);
