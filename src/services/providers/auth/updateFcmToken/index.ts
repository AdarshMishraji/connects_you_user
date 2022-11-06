import { ResponseStatusEnum } from '@adarsh-mishra/connects_you_services/services/auth/ResponseStatusEnum';
import { UpdateFcmTokenRequest } from '@adarsh-mishra/connects_you_services/services/auth/UpdateFcmTokenRequest';
import { UpdateFcmTokenResponse } from '@adarsh-mishra/connects_you_services/services/auth/UpdateFcmTokenResponse';
import { BadRequestError, NotFoundError } from '@adarsh-mishra/node-utils/httpResponses';
import { MongoObjectId } from '@adarsh-mishra/node-utils/mongoHelpers';
import { sendUnaryData, ServerUnaryCall } from '@grpc/grpc-js';

import { UserModel } from '../../../../models';
import { errorCallback } from '../../../../utils';

export const updateFcmToken = async (
	req: ServerUnaryCall<UpdateFcmTokenRequest, UpdateFcmTokenResponse>,
	callback: sendUnaryData<UpdateFcmTokenResponse>,
) => {
	try {
		const { fcmToken, userId } = req.request;
		if (!fcmToken || !userId) {
			throw new BadRequestError({ error: 'Invalid request. Please provide fcmToken and userId' });
		}

		const userObjectId = MongoObjectId(userId);

		if (!userObjectId) {
			throw new BadRequestError({ error: 'Invalid request. Please provide valid userId' });
		}

		const updatedUser = await UserModel.updateOne({ _id: userObjectId }, { fcmToken }).exec();

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
