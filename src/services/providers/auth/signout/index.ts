import { ResponseStatusEnum } from '@adarsh-mishra/connects_you_services/services/auth/ResponseStatusEnum';
import { SignoutRequest } from '@adarsh-mishra/connects_you_services/services/auth/SignoutRequest';
import { SignoutResponse } from '@adarsh-mishra/connects_you_services/services/auth/SignoutResponse';
import { BadRequestError, NotFoundError } from '@adarsh-mishra/node-utils/httpResponses';
import { MongoObjectId } from '@adarsh-mishra/node-utils/mongoHelpers';
import { sendUnaryData, ServerUnaryCall } from '@grpc/grpc-js';

import { UserLoginHistoryModel } from '../../../../models';
import { errorCallback } from '../../../../utils';

export const signout = async (
	req: ServerUnaryCall<SignoutRequest, SignoutResponse>,
	callback: sendUnaryData<SignoutResponse>,
) => {
	try {
		const { userId, loginId } = req.request;
		if (!userId || !loginId)
			throw new BadRequestError({ error: 'Invalid request. Please provide loginId and userId' });

		const loginObjectId = MongoObjectId(loginId);
		const userObjectId = MongoObjectId(userId);

		if (!loginObjectId || !userObjectId) {
			throw new BadRequestError({ error: 'Invalid request. Please provide valid loginId and userId' });
		}

		const updatedUserLoginHistory = await UserLoginHistoryModel.updateOne(
			{
				_id: loginObjectId,
				userId: userObjectId,
				isValid: true,
			},
			{ isValid: false },
		).exec();
		if (updatedUserLoginHistory.modifiedCount > 0) {
			return callback(null, {
				responseStatus: ResponseStatusEnum.SUCCESS,
			});
		} else {
			throw new NotFoundError({ error: 'User not updated' });
		}
	} catch (error) {
		return errorCallback(callback, error);
	}
};
