import { mongoose } from '@adarsh-mishra/node-utils/mongoHelpers';

import { userLoginHistory } from '../schemas';
import { IUserLoginHistory } from '../types';

export const UserLoginHistoryModel = mongoose.model<IUserLoginHistory>(
	userLoginHistory.schemaName,
	userLoginHistory.schema,
	userLoginHistory.schemaName,
);
