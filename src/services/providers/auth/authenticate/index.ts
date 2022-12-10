import {
	AuthenticateRequest,
	AuthTypeEnum,
	ResponseStatusEnum,
	TokenTypesEnum,
} from '@adarsh-mishra/connects_you_services/services/auth';
import { aesEncryptData, hashData, isEmptyEntity, jwt } from '@adarsh-mishra/node-utils/commonHelpers';
import { BadRequestError, NoDataError } from '@adarsh-mishra/node-utils/httpResponses';
import { createSessionTransaction } from '@adarsh-mishra/node-utils/mongoHelpers';

import { fetchUserDetails } from '../../_helper';

import { login } from './login';
import { signup } from './signup';
import { validateOAuth2Token } from './validOAuth2Token';

export const authenticate = async (request: AuthenticateRequest) => {
	const { token, publicKey, fcmToken, clientMetaData } = request;
	if (!token || !publicKey || !fcmToken) {
		throw new BadRequestError({
			error: 'Invalid request. Please provide token, publicKey and fcmToken',
		});
	}

	const oAuth2Response = await validateOAuth2Token(token);
	if (!oAuth2Response || !oAuth2Response.name || !oAuth2Response.email) {
		throw new BadRequestError({ error: 'Token not provided' });
	}

	const userEmailHash = hashData(oAuth2Response.email, process.env.HASH_KEY);
	const existedUser = await fetchUserDetails({ emailHash: userEmailHash });

	const loginMetaData = clientMetaData
		? aesEncryptData(JSON.stringify(clientMetaData), process.env.ENCRYPT_KEY) ?? undefined
		: undefined;

	const { method, userLoginHistoryResponse, userResponse } = await createSessionTransaction(async (session) => {
		if (existedUser) {
			const data = await login({
				existedUserId: existedUser._id,
				loginMetaData,
				fcmToken: fcmToken,
				session,
			});
			await session.commitTransaction();
			return data;
		} else {
			const data = await signup({
				oAuth2Response,
				publicKey: publicKey,
				userEmailHash,
				fcmToken: fcmToken,
				session,
				loginMetaData,
			});
			await session.commitTransaction();
			return data;
		}
	});

	if (isEmptyEntity(userResponse) || isEmptyEntity(userLoginHistoryResponse)) {
		throw new NoDataError({ error: 'Unable to authenticate' });
	}

	const payload = {
		userId: userResponse.userId,
		loginId: userLoginHistoryResponse.loginId,
		type: TokenTypesEnum[TokenTypesEnum.INITIAL_TOKEN],
	};

	const tokenForResponse = jwt.sign(payload, process.env.SECRET, { expiresIn: '30d' });

	return {
		responseStatus: ResponseStatusEnum.SUCCESS,
		data: {
			method,
			user: {
				token: tokenForResponse,
				publicKey: method === AuthTypeEnum[AuthTypeEnum.LOGIN] ? userResponse.publicKey : undefined,
				name: userResponse.name,
				email: userResponse.email,
				photoUrl: userResponse.photoUrl,
				userId: userResponse.userId,
			},
			loginInfo: {
				loginId: userLoginHistoryResponse.loginId,
				loginMetaData: clientMetaData,
				userId: userLoginHistoryResponse.userId,
				isValid: true,
				createdAt: userLoginHistoryResponse.createdAt,
			},
		},
	};
};
