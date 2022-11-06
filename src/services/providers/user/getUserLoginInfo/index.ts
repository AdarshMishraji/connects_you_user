import {
	GetUserLoginInfoRequest,
	GetUserLoginInfoResponse,
	ResponseStatusEnum,
} from '@adarsh-mishra/connects_you_services/services/user';
import { aesDecryptData, isEmptyEntity } from '@adarsh-mishra/node-utils/commonHelpers';
import { BadRequestError, NotFoundError } from '@adarsh-mishra/node-utils/httpResponses';
import { MongoObjectId } from '@adarsh-mishra/node-utils/mongoHelpers';
import { sendUnaryData, ServerUnaryCall } from '@grpc/grpc-js';

import { UserLoginHistoryModel } from '../../../../models';
import { errorCallback } from '../../../../utils';

export const getUserLoginInfo = async (
	req: ServerUnaryCall<GetUserLoginInfoRequest, GetUserLoginInfoResponse>,
	callback: sendUnaryData<GetUserLoginInfoResponse>,
) => {
	try {
		const { loginId, userId } = req.request;
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

		if (!userLoginInfo || isEmptyEntity(userLoginInfo))
			throw new NotFoundError({ error: 'user login info not found' });

		return callback(null, {
			responseStatus: ResponseStatusEnum.SUCCESS,
			data: {
				userLoginInfo: {
					loginMetaData: JSON.parse(
						aesDecryptData(userLoginInfo.loginMetaData, process.env.ENCRYPT_KEY) ?? '{}',
					),
					userId: userLoginInfo.userId.toString(),
					loginId: userLoginInfo._id.toString(),
					createdAt: userLoginInfo.createdAt?.toISOString(),
					isValid: userLoginInfo.isValid,
				},
			},
		});
	} catch (error) {
		return errorCallback(callback, error);
	}
};
