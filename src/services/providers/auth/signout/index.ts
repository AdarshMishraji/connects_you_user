import { ResponseStatusEnum } from '@adarsh-mishra/connects_you_services/services/auth/ResponseStatusEnum';
import { SignoutRequest } from '@adarsh-mishra/connects_you_services/services/auth/SignoutRequest';
import { BadRequestError, NoDataError } from '@adarsh-mishra/node-utils/httpResponses';
import { MongoObjectId } from '@adarsh-mishra/node-utils/mongoHelpers';

import { UserLoginHistoryModel } from '../../../../models';

export const signout = async (request: SignoutRequest) => {
	const { userId, loginId } = request;
	if (!userId || !loginId) throw new BadRequestError({ error: 'Invalid request. Please provide loginId and userId' });

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

	if (updatedUserLoginHistory.modifiedCount === 0) throw new NoDataError({ error: 'Unable to signout' });

	return {
		responseStatus: ResponseStatusEnum.SUCCESS,
	};
};
