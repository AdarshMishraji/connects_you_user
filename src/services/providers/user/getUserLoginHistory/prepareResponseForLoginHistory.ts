import { UserLoginInfo } from '@adarsh-mishra/connects_you_services/services/auth';
import { promisifiedAesDecryptData } from '@adarsh-mishra/node-utils/commonHelpers';

import { IUserLoginHistoryRaw } from '../../../../types';

export const prepareResponseForLoginHistory = async (userLoginInfo: IUserLoginHistoryRaw): Promise<UserLoginInfo> => ({
	userId: userLoginInfo.userId.toString(),
	loginId: userLoginInfo._id.toString(),
	createdAt: userLoginInfo.createdAt?.toISOString(),
	isValid: userLoginInfo.isValid,
	loginMetaData: JSON.parse(
		(await promisifiedAesDecryptData(userLoginInfo.loginMetaData, process.env.ENCRYPT_KEY)) ?? '{}',
	),
});
