import { mongoose } from '@adarsh-mishra/node-utils/mongoHelpers';

import { userLoginHistory } from '../schemas';
import { IUserLoginHistoryRaw } from '../types';

export const UserLoginHistoryModel = mongoose.model<IUserLoginHistoryRaw>(
	userLoginHistory.schemaName,
	userLoginHistory.schema,
	userLoginHistory.schemaName,
);
