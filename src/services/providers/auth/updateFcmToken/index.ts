import { ResponseStatusEnum } from '@adarsh-mishra/connects_you_services/services/auth/ResponseStatusEnum';
import { UpdateFcmTokenRequest } from '@adarsh-mishra/connects_you_services/services/auth/UpdateFcmTokenRequest';
import { BadRequestError, NotFoundError } from '@adarsh-mishra/node-utils/httpResponses';
import { MongoObjectId } from '@adarsh-mishra/node-utils/mongoHelpers';

import { UserModel } from '../../../../models';

export const updateFcmToken = async (request: UpdateFcmTokenRequest) => {
	const { fcmToken, userId } = request;
	if (!fcmToken || !userId) {
		throw new BadRequestError({ error: 'Invalid request. Please provide fcmToken and userId' });
	}

	const userObjectId = MongoObjectId(userId);

	if (!userObjectId) {
		throw new BadRequestError({ error: 'Invalid request. Please provide valid userId' });
	}

	const updatedUser = await UserModel.updateOne({ _id: userObjectId }, { fcmToken }).exec();

	if (updatedUser.modifiedCount === 0) {
		throw new NotFoundError({ error: 'Unable to update FCM Token' });
	}
	return {
		responseStatus: ResponseStatusEnum.SUCCESS,
	};
};
