import { AllUsersRequest } from '@adarsh-mishra/connects_you_services/services/user/AllUsersRequest';
import { AllUsersResponse } from '@adarsh-mishra/connects_you_services/services/user/AllUsersResponse';
import { ResponseStatusEnum } from '@adarsh-mishra/connects_you_services/services/user/ResponseStatusEnum';
import { UserDetails } from '@adarsh-mishra/connects_you_services/services/user/UserDetails';
import { bulkAesDecrypt, isEmptyEntity } from '@adarsh-mishra/node-utils/commonHelpers';
import { NotFoundError } from '@adarsh-mishra/node-utils/httpResponses';
import { MongoObjectId } from '@adarsh-mishra/node-utils/mongoHelpers';
import { sendUnaryData, ServerUnaryCall } from '@grpc/grpc-js';

import { errorCallback } from '../../../helpers/errorCallback';
import { UserModel } from '../../../models';
import { IUserBase, IUserRaw } from '../../../types';

const prepareResponseForUser = async (user: IUserRaw): Promise<UserDetails> => {
	const bulkAesDecryptData = await bulkAesDecrypt<
		Pick<IUserBase, 'name' | 'email' | 'photoUrl' | 'publicKey' | 'description'>
	>(
		{
			email: user.email,
			name: user.name,
			photoUrl: user.photoUrl ?? '',
			publicKey: user.publicKey,
			description: user.description ?? '',
		},
		process.env.ENCRYPT_KEY,
	);
	return {
		userId: user!._id.toString(),
		createdAt: user!.createdAt?.toISOString(),
		updatedAt: user!.updatedAt?.toISOString(),
		...bulkAesDecryptData,
	};
};

export const getAllUsers = async (
	req: ServerUnaryCall<AllUsersRequest, AllUsersResponse>,
	callback: sendUnaryData<AllUsersResponse>,
) => {
	try {
		const { exceptUserId } = req.request;

		const exceptUserIdObj = MongoObjectId(exceptUserId);

		const filter = exceptUserIdObj ? { _id: { $ne: exceptUserIdObj } } : {};

		const usersResponse = await UserModel.find(filter, {
			name: true,
			photoUrl: true,
			publicKey: true,
			email: true,
			createdAt: true,
			description: true,
			updatedAt: true,
		})
			.lean()
			.exec();
		if (isEmptyEntity(usersResponse)) throw new NotFoundError({ error: 'No user details found' });

		const usersData = await Promise.all(usersResponse.map(prepareResponseForUser));

		return callback(null, {
			responseStatus: ResponseStatusEnum.SUCCESS,
			data: {
				users: usersData,
			},
		});
	} catch (error) {
		return errorCallback(callback, error);
	}
};
