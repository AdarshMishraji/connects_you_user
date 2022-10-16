import { UserLoginInfoRequest } from '@adarsh-mishra/connects_you_services/services/user/UserLoginInfoRequest';
import { UserLoginInfoResponse } from '@adarsh-mishra/connects_you_services/services/user/UserLoginInfoResponse';
import { aesDecryptData, isEmptyEntity } from '@adarsh-mishra/node-utils';
import {
	BadRequestError,
	InternalServerError,
	NotFoundError,
	ResponseError,
} from '@adarsh-mishra/node-utils/httpResponses';
import { mongoose } from '@adarsh-mishra/node-utils/mongoHelpers';
import { sendUnaryData, ServerUnaryCall } from '@grpc/grpc-js';

import { errorCallback } from '../../../helpers/errorCallback';
import { UserLoginHistoryModel } from '../../../models';

export const v1GetUserLoginInfo = async (
	req: ServerUnaryCall<UserLoginInfoRequest, UserLoginInfoResponse>,
	callback: sendUnaryData<UserLoginInfoResponse>,
) => {
	try {
		const { loginId, userId } = req.request;
		if (!loginId || !userId) {
			throw new BadRequestError({ error: 'Invalid request. Please provide loginId and userId' });
		}

		const userLoginInfo = await UserLoginHistoryModel.findOne({
			_id: new mongoose.Types.ObjectId(loginId),
			userId: new mongoose.Types.ObjectId(userId),
			isValid: true,
		})
			.lean()
			.exec();

		if (isEmptyEntity(userLoginInfo)) throw new NotFoundError({ error: 'user login info not found' });

		return callback(null, {
			responseStatus: 'SUCCESS',
			data: {
				userLoginInfo: {
					loginMetaData: JSON.parse(
						aesDecryptData(userLoginInfo!.loginMetaData, process.env.ENCRYPT_KEY) ?? '{}',
					),
					userId: userLoginInfo!.userId.toString(),
					loginId: userLoginInfo!._id.toString(),
					createdAt: userLoginInfo!.createdAt,
					isValid: userLoginInfo!.isValid,
				},
			},
		});
	} catch (error) {
		if (error instanceof ResponseError) {
			return errorCallback(callback, error);
		}
		return errorCallback(callback, new InternalServerError({ error }));
	}
};
