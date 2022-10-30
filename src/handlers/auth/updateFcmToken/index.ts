import { ResponseStatusEnum } from '@adarsh-mishra/connects_you_services/services/auth/ResponseStatusEnum';
import { UpdateFcmTokenRequest } from '@adarsh-mishra/connects_you_services/services/auth/UpdateFcmTokenRequest';
import { UpdateFcmTokenResponse } from '@adarsh-mishra/connects_you_services/services/auth/UpdateFcmTokenResponse';
import { BadRequestError, NotFoundError } from '@adarsh-mishra/node-utils/httpResponses';
import { MongoObjectId } from '@adarsh-mishra/node-utils/mongoHelpers';
import { sendUnaryData, ServerUnaryCall } from '@grpc/grpc-js';

import { errorCallback } from '../../../helpers/errorCallback';
import { validateAccess } from '../../../middlewares';
import { UserModel } from '../../../models';

export const updateFcmToken = async (
	req: ServerUnaryCall<UpdateFcmTokenRequest, UpdateFcmTokenResponse>,
	callback: sendUnaryData<UpdateFcmTokenResponse>,
) => {
	try {
		validateAccess(req);
		const { fcmToken, userId } = req.request;
		if (!fcmToken || !userId) {
			throw new BadRequestError({ error: 'Invalid request. Please provide fcmToken and userId' });
		}

		const userIdObj = MongoObjectId(userId);

		if (!userIdObj) {
			throw new BadRequestError({ error: 'Invalid request. Please provide valid userId' });
		}

		const updatedUser = await UserModel.updateOne({ _id: userIdObj }, { fcmToken }).exec();

		if (updatedUser.modifiedCount === 0) {
			throw new NotFoundError({ error: 'userId not found' });
		}
		return callback(null, {
			responseStatus: ResponseStatusEnum.SUCCESS,
		});
	} catch (error) {
		return errorCallback(callback, error);
	}
};
