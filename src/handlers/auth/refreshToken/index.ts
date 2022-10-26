import { RefreshTokenRequest } from '@adarsh-mishra/connects_you_services/services/auth/RefreshTokenRequest';
import { RefreshTokenResponse } from '@adarsh-mishra/connects_you_services/services/auth/RefreshTokenResponse';
import { aesEncryptData, jwt } from '@adarsh-mishra/node-utils/commonHelpers';
import { BadRequestError } from '@adarsh-mishra/node-utils/httpResponses';
import { mongoose } from '@adarsh-mishra/node-utils/mongoHelpers';
import { sendUnaryData, ServerUnaryCall } from '@grpc/grpc-js';

import { errorCallback } from '../../../helpers/errorCallback';
import { validateAccess } from '../../../middlewares';
import { UserLoginHistoryModel } from '../../../models';
import { UserRefreshTokenModel } from '../../../models/userRefreshToken.model';
import { TokenTypesEnum } from '../types';

export const refreshToken = async (
	req: ServerUnaryCall<RefreshTokenRequest, RefreshTokenResponse>,
	callback: sendUnaryData<RefreshTokenResponse>,
) => {
	try {
		validateAccess(req);
		const { clientMetaData, loginId, userId } = req.request;
		if (!loginId || !userId)
			throw new BadRequestError({ error: 'Invalid request. Please provide loginId and userId' });

		const loginMetaData = clientMetaData
			? aesEncryptData(JSON.stringify(clientMetaData), process.env.ENCRYPT_KEY) ?? undefined
			: undefined;

		const userLoginData = await UserLoginHistoryModel.findOne({
			_id: new mongoose.Types.ObjectId(loginId),
			isValid: true,
		})
			.lean()
			.exec();

		if (!userLoginData?.isValid) throw new BadRequestError({ error: 'Invalid loginId' });

		const token = jwt.sign(
			{
				userId: userId,
				loginId: loginId,
				type: TokenTypesEnum.REFRESH_TOKEN,
			},
			process.env.SECRET,
			{ expiresIn: '90d' },
		);

		await new UserRefreshTokenModel({
			loginId: new mongoose.Types.ObjectId(loginId),
			loginMetaData,
		}).save();

		return callback(null, {
			responseStatus: 'SUCCESS',
			data: {
				token,
			},
		});
	} catch (error) {
		return errorCallback(callback, error);
	}
};
