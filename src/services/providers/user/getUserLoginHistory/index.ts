import {
	GetUserLoginHistoryRequest,
	GetUserLoginHistoryResponse,
	ResponseStatusEnum,
} from '@adarsh-mishra/connects_you_services/services/user';
import { isEmptyEntity } from '@adarsh-mishra/node-utils/commonHelpers';
import { BadRequestError, NotFoundError } from '@adarsh-mishra/node-utils/httpResponses';
import { MongoObjectId } from '@adarsh-mishra/node-utils/mongoHelpers';
import { sendUnaryData, ServerUnaryCall } from '@grpc/grpc-js';

import { UserLoginHistoryModel } from '../../../../models';
import { errorCallback } from '../../../../utils';

import { prepareResponseForLoginHistory } from './prepareResponseForLoginHistory';

export const getUserLoginHistory = async (
	req: ServerUnaryCall<GetUserLoginHistoryRequest, GetUserLoginHistoryResponse>,
	callback: sendUnaryData<GetUserLoginHistoryResponse>,
) => {
	try {
		const { userId, nonValidAllowed, limit = 10, offset = 0 } = req.request;
		if (!userId) {
			throw new BadRequestError({ error: 'Invalid request. Please provide loginId and userId' });
		}

		const userObjectId = MongoObjectId(userId);
		const [userLoginHistory, total] = await Promise.all([
			UserLoginHistoryModel.find({
				userId: userObjectId,
				...(nonValidAllowed ? {} : { isValid: true }),
			})
				.limit(limit)
				.skip(offset)
				.lean()
				.exec(),
			UserLoginHistoryModel.count({ userId: userObjectId }).lean().exec(),
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
