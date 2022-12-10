import { GetUserLoginHistoryRequest, ResponseStatusEnum } from '@adarsh-mishra/connects_you_services/services/user';
import { isEmptyEntity } from '@adarsh-mishra/node-utils/commonHelpers';
import { BadRequestError, NotFoundError } from '@adarsh-mishra/node-utils/httpResponses';
import { MongoObjectId } from '@adarsh-mishra/node-utils/mongoHelpers';

import { UserLoginHistoryModel } from '../../../../models';

import { prepareResponseForLoginHistory } from './prepareResponseForLoginHistory';

export const getUserLoginHistory = async (request: GetUserLoginHistoryRequest) => {
	const { userId, nonValidAllowed, limit, offset } = request;
	if (!userId) {
		throw new BadRequestError({ error: 'Invalid request. Please provide userId' });
	}

	const userObjectId = MongoObjectId(userId);
	const [userLoginHistory, total] = await Promise.all([
		UserLoginHistoryModel.find(
			{
				userId: userObjectId,
				...(nonValidAllowed ? {} : { isValid: true }),
			},
			undefined,
			{ limit, skip: offset },
		)

			.lean()
			.exec(),
		UserLoginHistoryModel.count({ userId: userObjectId }).lean().exec(),
	]);

	if (isEmptyEntity(userLoginHistory)) throw new NotFoundError({ error: 'No login history found' });

	const userLoginHistoryData = await Promise.all(userLoginHistory.map(prepareResponseForLoginHistory));

	return {
		responseStatus: ResponseStatusEnum.SUCCESS,
		data: {
			userLoginHistory: userLoginHistoryData,
			total,
		},
	};
};
