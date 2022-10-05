import {
	aesEncryptData,
	BadRequestError,
	hashData,
	createSessionTransaction,
	isEmptyEntity,
	NoDataError,
	jwt,
} from '@adarsh-mishra/node-utils';
import { Request, Response } from 'express';

import { fetchRequestMetaData } from '../../../helpers';
import { fetchUserDetails } from '../../../helpers/fetchUserDetails';
import { IUser } from '../../../types';
import { TokenTypesEnum, AuthTypeEnum } from '../types';

import { login } from './login';
import { signup } from './signup';
import { validateOAuth2Token } from './validOAuth2Token';

export const v1Authenticate = async (req: Request, res: Response) => {
	try {
		if (!req.body.token || !req.body.publicKey || !req.body.fcmToken) {
			throw new BadRequestError<string>({
				error: 'Invalid request. Please provide token, publicKey and fcmToken',
			});
		}

		const oAuth2Response = await validateOAuth2Token(req.body.token);
		if (!oAuth2Response || !oAuth2Response.name || !oAuth2Response.email) {
			throw new BadRequestError<string>({ error: 'Token not provided' });
		}

		const userEmailHash = hashData(oAuth2Response.email, process.env.HASH_KEY);

		const existedUser = await fetchUserDetails({ emailHash: userEmailHash });

		const requestMetaData = await fetchRequestMetaData(req);

		const loginMetaData = aesEncryptData(JSON.stringify(requestMetaData), process.env.ENCRYPT_KEY) ?? '';

		const transactionResponse = await createSessionTransaction(async (session) => {
			if (existedUser) {
				const data = await login({
					existedUserId: existedUser._id,
					loginMetaData,
					fcmToken: req.body.fcmToken,
					session,
				});
				await session.commitTransaction();
				return data;
			} else {
				const data = await signup({
					oAuth2Response,
					publicKey: req.body.publicKey,
					userEmailHash,
					fcmToken: req.body.fcmToken,
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

		const token = jwt.sign(payload, process.env.SECRET, { expiresIn: '30d' });

		return res.create<{ method: AuthTypeEnum; user: Partial<IUser> & { token: string; userId?: string } }>?.({
			method: transactionResponse.method,
			user: {
				token,
				publicKey:
					transactionResponse.method === AuthTypeEnum.LOGIN
						? transactionResponse.userModelResponse?.publicKey
						: undefined,
				name: transactionResponse.userModelResponse?.name,
				email: transactionResponse.userModelResponse?.email,
				photoUrl: transactionResponse.userModelResponse?.photoUrl,
				userId: transactionResponse.userModelResponse?._id.toString(),
			},
		})
			.success()
			.send();
	} catch (error) {
		if (error instanceof BadRequestError) {
			return res.create<undefined, typeof error.error>?.().badRequest(error.error).send();
		}
		return res.create?.().internalServerError(error).send();
	}
};
