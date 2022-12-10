import { GetUserLoginInfoRequest, ResponseStatusEnum } from '@adarsh-mishra/connects_you_services/services/user';
import { aesDecryptData, isEmptyEntity } from '@adarsh-mishra/node-utils/commonHelpers';
import { BadRequestError, NotFoundError } from '@adarsh-mishra/node-utils/httpResponses';
import { MongoObjectId } from '@adarsh-mishra/node-utils/mongoHelpers';

import { UserLoginHistoryModel } from '../../../../models';

export const getUserLoginInfo = async (request: GetUserLoginInfoRequest) => {
	const { loginId, userId } = request;
	if (!loginId || !userId) {
		throw new BadRequestError({ error: 'Invalid request. Please provide loginId and userId' });
	}

	const loginObjectId = MongoObjectId(loginId);
	const userObjectId = MongoObjectId(userId);

	if (!loginObjectId || !userObjectId) {
		throw new BadRequestError({ error: 'Invalid request. Please provide valid loginId and userId' });
	}

	const userLoginInfo = await UserLoginHistoryModel.findOne({
		_id: loginObjectId,
		userId: userObjectId,
		isValid: true,
	})
		.lean()
		.exec();

	if (!userLoginInfo || isEmptyEntity(userLoginInfo)) throw new NotFoundError({ error: 'No user login info found' });

	return {
		responseStatus: ResponseStatusEnum.SUCCESS,
		data: {
			userLoginInfo: {
				loginMetaData: JSON.parse(aesDecryptData(userLoginInfo.loginMetaData, process.env.ENCRYPT_KEY) ?? '{}'),
				userId: userLoginInfo.userId.toString(),
				loginId: userLoginInfo._id.toString(),
				createdAt: userLoginInfo.createdAt?.toISOString(),
				isValid: userLoginInfo.isValid,
			},
		},
	};
};
