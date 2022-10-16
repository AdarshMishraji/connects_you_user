import { SetUserOnlineStatusRequest } from '@adarsh-mishra/connects_you_services/services/user/SetUserOnlineStatusRequest';
import { SetUserOnlineStatusResponse } from '@adarsh-mishra/connects_you_services/services/user/SetUserOnlineStatusResponse';
import {
	BadRequestError,
	InternalServerError,
	NotFoundError,
	ResponseError,
} from '@adarsh-mishra/node-utils/httpResponses';
import { mongoose } from '@adarsh-mishra/node-utils/mongoHelpers';
import { sendUnaryData, ServerUnaryCall } from '@grpc/grpc-js';

import { errorCallback } from '../../../helpers/errorCallback';
import { UserModel } from '../../../models';

export const v1SetUserOnlineStatus = async (
	req: ServerUnaryCall<SetUserOnlineStatusRequest, SetUserOnlineStatusResponse>,
	callback: sendUnaryData<SetUserOnlineStatusResponse>,
) => {
	try {
		const { userId, isOnline } = req.request;
		if (!userId)
			throw new BadRequestError({
				error: 'Invalid request. Please provide userId',
			});
		const updateResponse = await UserModel.updateOne(
			{ _id: new mongoose.Types.ObjectId(userId) },
			{ isOnline: isOnline ?? false },
		)
			.lean()
			.exec();

		if (updateResponse.modifiedCount) return callback(null, { responseStatus: 'SUCCESS' });
		throw new NotFoundError({ error: "User's online status not updated" });
	} catch (error) {
		if (error instanceof ResponseError) {
			return errorCallback(callback, error);
		}
		return errorCallback(callback, new InternalServerError({ error }));
	}
};
