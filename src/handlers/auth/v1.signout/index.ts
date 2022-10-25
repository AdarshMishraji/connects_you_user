import { SignoutRequest } from '@adarsh-mishra/connects_you_services/services/auth/SignoutRequest';
import { SignoutResponse } from '@adarsh-mishra/connects_you_services/services/auth/SignoutResponse';
import { BadRequestError, NotFoundError } from '@adarsh-mishra/node-utils/httpResponses';
import { mongoose } from '@adarsh-mishra/node-utils/mongoHelpers';
import { sendUnaryData, ServerUnaryCall } from '@grpc/grpc-js';

import { errorCallback } from '../../../helpers/errorCallback';
import { validateAccess } from '../../../middlewares';
import { UserLoginHistoryModel } from '../../../models';

export const v1Signout = async (
	req: ServerUnaryCall<SignoutRequest, SignoutResponse>,
	callback: sendUnaryData<SignoutResponse>,
) => {
	try {
		validateAccess(req);
		const { userId, loginId } = req.request;
		if (!userId || !loginId)
			throw new BadRequestError({ error: 'Invalid request. Please provide loginId and userId' });
		const updatedUserLoginHistory = await UserLoginHistoryModel.updateOne(
			{
				userId: new mongoose.Types.ObjectId(userId),
				_id: new mongoose.Types.ObjectId(loginId),
				isValid: true,
			},
			{ isValid: false },
		).exec();
		if (updatedUserLoginHistory.modifiedCount > 0) {
			return callback(null, {
				responseStatus: 'SUCCESS',
			});
		} else {
			throw new NotFoundError({ error: 'User not updated' });
		}
	} catch (error) {
		return errorCallback(callback, error);
	}
};
