import { bulkAesDecrypt, mongoose } from '@adarsh-mishra/node-utils';

import { UserLoginHistoryModel, UserModel } from '../../../models';
import { AuthTypeEnum } from '../types';

export type TLoginParams = {
	loginMetaData: string;
	existedUserId: mongoose.Types.ObjectId;
	fcmToken: string;
	session: mongoose.ClientSession | null | undefined;
};
export const login = async ({ existedUserId, loginMetaData, fcmToken, session }: TLoginParams) => {
	const [userLoginHistoryResponse, userModelResponse] = await Promise.all([
		new UserLoginHistoryModel({ userId: existedUserId, loginMetaData }).save({ session }),
		UserModel.findOneAndUpdate({ _id: existedUserId }, { fcmToken }, { session, new: true }).lean().exec(),
	]);

	return {
		userModelResponse: {
			_id: userModelResponse?._id,
			...(await bulkAesDecrypt(
				{
					name: userModelResponse?.name ?? '',
					email: userModelResponse?.email ?? '',
					photoUrl: userModelResponse?.photoUrl ?? '',
					publicKey: userModelResponse?.publicKey ?? '',
				},
				process.env.ENCRYPT_KEY,
			)),
		},
		userLoginHistoryResponse: userLoginHistoryResponse,
		method: AuthTypeEnum.LOGIN,
	};
};
