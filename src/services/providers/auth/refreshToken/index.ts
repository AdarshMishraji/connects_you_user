import { RefreshTokenRequest } from '@adarsh-mishra/connects_you_services/services/auth/RefreshTokenRequest';
import { ResponseStatusEnum } from '@adarsh-mishra/connects_you_services/services/auth/ResponseStatusEnum';
import { TokenTypesEnum } from '@adarsh-mishra/connects_you_services/services/auth/TokenTypesEnum';
import { aesEncryptData, jwt } from '@adarsh-mishra/node-utils/commonHelpers';
import { BadRequestError } from '@adarsh-mishra/node-utils/httpResponses';
import { MongoObjectId } from '@adarsh-mishra/node-utils/mongoHelpers';

import { UserLoginHistoryModel } from '../../../../models';
import { UserRefreshTokenModel } from '../../../../models/userRefreshToken.model';

export const refreshToken = async (request: RefreshTokenRequest) => {
	const { clientMetaData, loginId, userId } = request;
	if (!loginId || !userId) throw new BadRequestError({ error: 'Invalid request. Please provide loginId and userId' });

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

	if (!userLoginData?.isValid) throw new BadRequestError({ error: 'Invalid request. Please provide valid loginId' });

	const token = jwt.sign(
		{
			userId,
			loginId,
			type: TokenTypesEnum.REFRESH_TOKEN,
		},
		process.env.SECRET,
		{ expiresIn: '7d' },
	);

	await new UserRefreshTokenModel({
		loginId: loginObjectId,
		loginMetaData,
	}).save();

	return {
		responseStatus: ResponseStatusEnum.SUCCESS,
		data: {
			token,
		},
	};
};
