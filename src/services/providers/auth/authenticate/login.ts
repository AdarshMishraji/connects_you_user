import { AuthTypeEnum } from '@adarsh-mishra/connects_you_services/services/auth/AuthTypeEnum';
import { UserLoginInfo } from '@adarsh-mishra/connects_you_services/services/auth/UserLoginInfo';
import { UserDetails } from '@adarsh-mishra/connects_you_services/services/user/UserDetails';
import { bulkAesDecrypt, isEmptyEntity } from '@adarsh-mishra/node-utils/commonHelpers';
import { NotFoundError } from '@adarsh-mishra/node-utils/httpResponses';
import { mongoose } from '@adarsh-mishra/node-utils/mongoHelpers';

import { UserLoginHistoryModel, UserModel } from '../../../../models';

export type TLoginParams = {
	loginMetaData?: string;
	existedUserId: mongoose.Types.ObjectId;
	fcmToken: string;
	session: mongoose.ClientSession | null | undefined;
};

export type TLoginOutput = {
	method: AuthTypeEnum.LOGIN;
	userResponse: UserDetails;
	userLoginHistoryResponse: UserLoginInfo;
};

export const login = async ({
	existedUserId,
	loginMetaData,
	fcmToken,
	session,
}: TLoginParams): Promise<TLoginOutput> => {
	const [userLoginHistoryResponse, userModelResponse] = await Promise.all([
		new UserLoginHistoryModel({ userId: existedUserId, loginMetaData }).save({ session }),
		UserModel.findOneAndUpdate({ _id: existedUserId }, { fcmToken }, { session, new: true }).lean().exec(),
	]);

	if (!userModelResponse || isEmptyEntity(userModelResponse))
		throw new NotFoundError({ error: 'Unable to user fcmToken while login' });

	const decryptedUserData = await bulkAesDecrypt(
		{
			name: userModelResponse.name,
			email: userModelResponse.email,
			photoUrl: userModelResponse.photoUrl,
			publicKey: userModelResponse.publicKey,
		},
		process.env.ENCRYPT_KEY,
	);

	return {
		userResponse: {
			userId: userModelResponse._id.toString(),
			createdAt: userModelResponse.createdAt?.toISOString(),
			updatedAt: userModelResponse.updatedAt?.toISOString(),
			...decryptedUserData,
		},
		userLoginHistoryResponse: Object.assign(userLoginHistoryResponse, {
			userId: userLoginHistoryResponse.userId.toString(),
			loginId: userLoginHistoryResponse._id.toString(),
			createdAt: userLoginHistoryResponse.createdAt?.toISOString(),
			updatedAt: userLoginHistoryResponse.updatedAt?.toISOString(),
			loginMetaData: undefined,
		}),
		method: AuthTypeEnum.LOGIN,
	};
};
