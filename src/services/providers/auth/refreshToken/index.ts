import { RefreshTokenRequest } from '@adarsh-mishra/connects_you_services/services/auth/RefreshTokenRequest';
import { RefreshTokenResponse } from '@adarsh-mishra/connects_you_services/services/auth/RefreshTokenResponse';
import { ResponseStatusEnum } from '@adarsh-mishra/connects_you_services/services/auth/ResponseStatusEnum';
import { TokenTypesEnum } from '@adarsh-mishra/connects_you_services/services/auth/TokenTypesEnum';
import { aesEncryptData, jwt } from '@adarsh-mishra/node-utils/commonHelpers';
import { BadRequestError } from '@adarsh-mishra/node-utils/httpResponses';
import { MongoObjectId } from '@adarsh-mishra/node-utils/mongoHelpers';
import { sendUnaryData, ServerUnaryCall } from '@grpc/grpc-js';

import { UserLoginHistoryModel } from '../../../../models';
import { UserRefreshTokenModel } from '../../../../models/userRefreshToken.model';
import { errorCallback } from '../../../../utils';

export const refreshToken = async (
	req: ServerUnaryCall<RefreshTokenRequest, RefreshTokenResponse>,
	callback: sendUnaryData<RefreshTokenResponse>,
) => {
	try {
		const { clientMetaData, loginId, userId } = req.request;
		if (!loginId || !userId)
			throw new BadRequestError({ error: 'Invalid request. Please provide loginId and userId' });

		const loginObjectId = MongoObjectId(loginId);
		const userObjectId = MongoObjectId(userId);

		if (!loginObjectId || !userObjectId) {
			throw new BadRequestError({ error: 'Invalid request. Please provide valid loginId and userId' });
		}

		const loginMetaData = clientMetaData
			? aesEncryptData(JSON.stringify(clientMetaData), process.env.ENCRYPT_KEY) ?? undefined
			: undefined;

		const userLoginData = await UserLoginHistoryModel.findOne({
			_id: loginObjectId,
			isValid: true,
		})
			.lean()
			.exec();

		if (!userLoginData?.isValid) throw new BadRequestError({ error: 'Invalid loginId' });

		const token = jwt.sign(
			{
				userId,
				loginId,
				type: TokenTypesEnum.REFRESH_TOKEN,
			},
			process.env.SECRET,
			{ expiresIn: '90d' },
		);

		await new UserRefreshTokenModel({
			loginId: loginObjectId,
			loginMetaData,
		}).save();

		return callback(null, {
			responseStatus: ResponseStatusEnum.SUCCESS,
			data: {
				token,
			},
		});
	} catch (error) {
		return errorCallback(callback, error);
	}
};
