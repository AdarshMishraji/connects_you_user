import { AuthenticateRequest } from '@adarsh-mishra/connects_you_services/services/auth/AuthenticateRequest';
import { AuthenticateResponse } from '@adarsh-mishra/connects_you_services/services/auth/AuthenticateResponse';
import { aesEncryptData, hashData, isEmptyEntity, jwt } from '@adarsh-mishra/node-utils/commonHelpers';
import {
	BadRequestError,
	InternalServerError,
	ResponseError,
	NoDataError,
} from '@adarsh-mishra/node-utils/httpResponses';
import { createSessionTransaction } from '@adarsh-mishra/node-utils/mongoHelpers';
import { sendUnaryData, ServerUnaryCall } from '@grpc/grpc-js';

import { errorCallback } from '../../../helpers/errorCallback';
import { fetchUserDetails } from '../../../helpers/fetchUserDetails';
import { validateAccess } from '../../../middlewares';
import { TokenTypesEnum, AuthTypeEnum } from '../types';

import { login } from './login';
import { signup } from './signup';
import { validateOAuth2Token } from './validOAuth2Token';

export const v1Authenticate = async (
	req: ServerUnaryCall<AuthenticateRequest, AuthenticateResponse>,
	callback: sendUnaryData<AuthenticateResponse>,
) => {
	try {
		validateAccess(req);
		const { token, publicKey, fcmToken, clientMetaData } = req.request;
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

		const transactionResponse = await createSessionTransaction(async (session) => {
			if (existedUser) {
				const data = await login({
					existedUserId: existedUser._id,
					loginMetaData,
					fcmToken: fcmToken!,
					session,
				});
				await session.commitTransaction();
				return data;
			} else {
				const data = await signup({
					oAuth2Response,
					publicKey: publicKey!,
					userEmailHash,
					fcmToken: fcmToken!,
					session,
					loginMetaData,
				});
				await session.commitTransaction();
				return data;
			}
		});

		if (
			isEmptyEntity(transactionResponse) ||
			!transactionResponse.userModelResponse?._id ||
			!transactionResponse.userLoginHistoryResponse?._id
		) {
			throw new NoDataError({ error: 'No data found' });
		}

		const payload = {
			userId: transactionResponse.userModelResponse?._id.toString(),
			loginId: transactionResponse.userLoginHistoryResponse?._id.toString(),
			type: TokenTypesEnum.INITIAL_TOKEN,
		};

		const tokenForResponse = jwt.sign(payload, process.env.SECRET, { expiresIn: '30d' });

		return callback(null, {
			responseStatus: 'SUCCESS',
			data: {
				method: transactionResponse.method,
				user: {
					token: tokenForResponse,
					publicKey:
						transactionResponse.method === AuthTypeEnum.LOGIN
							? transactionResponse.userModelResponse?.publicKey
							: undefined,
					name: transactionResponse.userModelResponse?.name,
					email: transactionResponse.userModelResponse?.email,
					photoUrl: transactionResponse.userModelResponse?.photoUrl,
					userId: transactionResponse.userModelResponse?._id.toString(),
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
