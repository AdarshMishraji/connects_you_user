import { UserLoginInfo } from '@adarsh-mishra/connects_you_services/services/auth/UserLoginInfo';
import { ResponseStatusEnum } from '@adarsh-mishra/connects_you_services/services/user/ResponseStatusEnum';
import { UserLoginHistoryRequest } from '@adarsh-mishra/connects_you_services/services/user/UserLoginHistoryRequest';
import { UserLoginHistoryResponse } from '@adarsh-mishra/connects_you_services/services/user/UserLoginHistoryResponse';
import { isEmptyEntity, promisifiedAesDecryptData } from '@adarsh-mishra/node-utils/commonHelpers';
import { BadRequestError, NotFoundError } from '@adarsh-mishra/node-utils/httpResponses';
import { MongoObjectId } from '@adarsh-mishra/node-utils/mongoHelpers';
import { sendUnaryData, ServerUnaryCall } from '@grpc/grpc-js';

import { errorCallback } from '../../../../helpers/errorCallback';
import { UserLoginHistoryModel } from '../../../../models';
import { IUserLoginHistoryRaw } from '../../../../types';

const prepareResponseForLoginHistory = async (userLoginInfo: IUserLoginHistoryRaw): Promise<UserLoginInfo> => ({
	userId: userLoginInfo!.userId.toString(),
	loginId: userLoginInfo!._id.toString(),
	createdAt: userLoginInfo!.createdAt?.toISOString(),
	isValid: userLoginInfo!.isValid,
	loginMetaData: JSON.parse(
		(await promisifiedAesDecryptData(userLoginInfo!.loginMetaData, process.env.ENCRYPT_KEY)) ?? '{}',
	),
});

export const getUserLoginHistory = async (
	req: ServerUnaryCall<UserLoginHistoryRequest, UserLoginHistoryResponse>,
	callback: sendUnaryData<UserLoginHistoryResponse>,
) => {
	try {
		const { userId, nonValidAllowed, limit = 10, offset = 0 } = req.request;
		if (!userId) {
			throw new BadRequestError({ error: 'Invalid request. Please provide loginId and userId' });
		}

		const userIdObjectId = MongoObjectId(userId);
		const [userLoginHistory, total] = await Promise.all([
			UserLoginHistoryModel.find({
				userId: userIdObjectId,
				...(nonValidAllowed ? {} : { isValid: true }),
			})
				.limit(limit)
				.skip(offset)
				.lean()
				.exec(),
			UserLoginHistoryModel.count({ userId: userIdObjectId }).lean().exec(),
		]);

		if (isEmptyEntity(userLoginHistory)) throw new NotFoundError({ error: 'user login History not found' });

		const userLoginHistoryData = await Promise.all(userLoginHistory.map(prepareResponseForLoginHistory));

		return callback(null, {
			responseStatus: ResponseStatusEnum.SUCCESS,
			data: {
				userLoginHistory: userLoginHistoryData,
				total,
			},
		});
	} catch (error) {
		return errorCallback(callback, error);
	}
};
