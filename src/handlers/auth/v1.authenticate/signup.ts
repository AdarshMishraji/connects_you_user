import { bulkAesEncrypt } from '@adarsh-mishra/node-utils/commonHelpers';
import { mongoose } from '@adarsh-mishra/node-utils/mongoHelpers';
import { TokenPayload } from 'google-auth-library';

import { UserLoginHistoryModel, UserModel } from '../../../models';
import { IUser } from '../../../types';
import { AuthTypeEnum } from '../types';

export type TSignupParams = {
	oAuth2Response: TokenPayload;
	publicKey: string;
	userEmailHash: string;
	fcmToken: string;
	session: mongoose.ClientSession | null | undefined;
	loginMetaData?: string;
};

export const signup = async ({
	oAuth2Response,
	publicKey,
	userEmailHash,
	fcmToken,
	session,
	loginMetaData,
}: TSignupParams) => {
	const bulkAesEncryptData = await bulkAesEncrypt<Pick<IUser, 'name' | 'email' | 'photoUrl' | 'publicKey'>>(
		{
			name: oAuth2Response.name!,
			email: oAuth2Response.email!,
			photoUrl: oAuth2Response.picture ?? '',
			publicKey,
		},
		process.env.ENCRYPT_KEY,
	);
	const user: IUser = {
		...bulkAesEncryptData,
		photoUrl: '',
		emailHash: userEmailHash,
		emailVerified: oAuth2Response.email_verified ?? false,
		authProvider: oAuth2Response.iss,
		locale: oAuth2Response.locale ?? 'en',
		fcmToken,
	};

	const userModelResponse = await new UserModel(user).save({ session });
	const userLoginHistoryResponse = await new UserLoginHistoryModel({
		userId: userModelResponse._id,
		loginMetaData,
	}).save({
		session,
	});

	return {
		userModelResponse: {
			_id: userModelResponse._id.toString(),
			name: oAuth2Response.name,
			email: oAuth2Response.email,
			photoUrl: oAuth2Response.picture,
			publicKey,
		},
		userLoginHistoryResponse,
		method: AuthTypeEnum.SIGNUP,
	};
};
