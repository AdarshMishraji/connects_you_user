import { AuthTypeEnum } from '@adarsh-mishra/connects_you_services/services/auth/AuthTypeEnum';
import { UserLoginInfo } from '@adarsh-mishra/connects_you_services/services/auth/UserLoginInfo';
import { UserDetails } from '@adarsh-mishra/connects_you_services/services/user/UserDetails';
import { bulkAesEncrypt } from '@adarsh-mishra/node-utils/commonHelpers';
import { mongoose } from '@adarsh-mishra/node-utils/mongoHelpers';
import { TokenPayload } from 'google-auth-library';

import { UserLoginHistoryModel, UserModel } from '../../../../models';
import { IUserBase } from '../../../../types';

export type TSignupParams = {
	oAuth2Response: TokenPayload;
	publicKey: string;
	userEmailHash: string;
	fcmToken: string;
	session: mongoose.ClientSession | null | undefined;
	loginMetaData?: string;
};

export type TSignupOutput = {
	method: AuthTypeEnum.SIGNUP;
	userResponse: UserDetails;
	userLoginHistoryResponse: UserLoginInfo;
};

export const signup = async ({
	oAuth2Response,
	publicKey,
	userEmailHash,
	fcmToken,
	session,
	loginMetaData,
}: TSignupParams): Promise<TSignupOutput> => {
	const bulkEncryptedUserData = await bulkAesEncrypt<Pick<IUserBase, 'name' | 'email' | 'photoUrl' | 'publicKey'>>(
		{
			name: oAuth2Response.name!,
			email: oAuth2Response.email!,
			photoUrl: oAuth2Response.picture ?? '',
			publicKey,
		},
		process.env.ENCRYPT_KEY,
	);

	const user = {
		photoUrl: '',
		emailHash: userEmailHash,
		emailVerified: oAuth2Response.email_verified ?? false,
		authProvider: oAuth2Response.iss,
		locale: oAuth2Response.locale ?? 'en',
		fcmToken,
		...bulkEncryptedUserData,
	};

	const userSaveResponse = await new UserModel(user).save({ session });
	const userLoginHistoryResponse = await new UserLoginHistoryModel({
		userId: userSaveResponse._id,
		loginMetaData,
	}).save({
		session,
	});

	return {
		userResponse: {
			userId: userSaveResponse._id.toString(),
			name: oAuth2Response.name ?? '',
			email: oAuth2Response.email ?? '',
			photoUrl: oAuth2Response.picture,
			publicKey,
			createdAt: userSaveResponse.createdAt?.toISOString(),
			updatedAt: userSaveResponse.updatedAt?.toISOString(),
		},
		userLoginHistoryResponse: Object.assign(userLoginHistoryResponse, {
			userId: userLoginHistoryResponse.userId.toString(),
			loginId: userLoginHistoryResponse._id.toString(),
			createdAt: userLoginHistoryResponse.createdAt?.toISOString(),
			updatedAt: userLoginHistoryResponse.updatedAt?.toISOString(),
			loginMetaData: undefined,
		}),
		method: AuthTypeEnum.SIGNUP,
	};
};
