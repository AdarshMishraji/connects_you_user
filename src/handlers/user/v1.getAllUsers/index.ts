import { AllUsersRequest } from '@adarsh-mishra/connects_you_services/services/user/AllUsersRequest';
import { AllUsersResponse } from '@adarsh-mishra/connects_you_services/services/user/AllUsersResponse';
import { bulkAesDecrypt, isEmptyEntity } from '@adarsh-mishra/node-utils/commonHelpers';
import { NotFoundError } from '@adarsh-mishra/node-utils/httpResponses';
import { mongoose } from '@adarsh-mishra/node-utils/mongoHelpers';
import { sendUnaryData, ServerUnaryCall } from '@grpc/grpc-js';

import { errorCallback } from '../../../helpers/errorCallback';
import { UserModel } from '../../../models';
import { IUser } from '../../../types';

export const v1GetAllUsers = async (
	req: ServerUnaryCall<AllUsersRequest, AllUsersResponse>,
	callback: sendUnaryData<AllUsersResponse>,
) => {
	try {
		const { exceptUserId } = req.request;

		const usersResponse = await UserModel.find(
			exceptUserId ? { _id: { $ne: new mongoose.Types.ObjectId(exceptUserId) } } : {},
			{
				name: true,
				photoUrl: true,
				publicKey: true,
				email: true,
				createdAt: true,
				description: true,
				updatedAt: true,
			},
		)
			.lean()
			.exec();
		if (isEmptyEntity(usersResponse)) throw new NotFoundError({ error: 'No user details found' });

		const usersData = await Promise.all(
			usersResponse.map(async (user) => {
				const bulkAesDecryptData = await bulkAesDecrypt<
					Pick<IUser, 'name' | 'email' | 'photoUrl' | 'publicKey' | 'description'>
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
					createdAt: user!.createdAt,
					updatedAt: user!.updatedAt,
					...bulkAesDecryptData,
				};
			}),
		);

		return callback(null, {
			responseStatus: 'SUCCESS',
			data: {
				users: usersData,
			},
		});
	} catch (error) {
		return errorCallback(callback, error);
	}
};
