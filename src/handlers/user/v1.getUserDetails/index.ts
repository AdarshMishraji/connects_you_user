import { UserDetailsRequest } from '@adarsh-mishra/connects_you_services/services/user/UserDetailsRequest';
import { UserDetailsResponse } from '@adarsh-mishra/connects_you_services/services/user/UserDetailsResponse';
import { bulkAesDecrypt, isEmptyEntity } from '@adarsh-mishra/node-utils/commonHelpers';
import { BadRequestError, NotFoundError } from '@adarsh-mishra/node-utils/httpResponses';
import { mongoose } from '@adarsh-mishra/node-utils/mongoHelpers';
import { sendUnaryData, ServerUnaryCall } from '@grpc/grpc-js';

import { errorCallback } from '../../../helpers/errorCallback';
import { UserModel } from '../../../models';
import { IUser } from '../../../types';

export const v1GetUserDetails = async (
	req: ServerUnaryCall<UserDetailsRequest, UserDetailsResponse>,
	callback: sendUnaryData<UserDetailsResponse>,
) => {
	try {
		const { userId } = req.request;
		if (!userId) {
			throw new BadRequestError({ error: 'Invalid request. Please provide loginId and userId' });
		}
		const userResponse = await UserModel.findOne(
			{ _id: new mongoose.Types.ObjectId(userId) },
			{
				email: true,
				name: true,
				photoUrl: true,
				createdAt: true,
				publicKey: true,
				updatedAt: true,
				description: true,
			},
		)
			.lean()
			.exec();

		if (!userResponse || isEmptyEntity(userResponse)) throw new NotFoundError({ error: 'user not found' });

		const bulkAesDecryptData = await bulkAesDecrypt<
			Pick<IUser, 'name' | 'email' | 'photoUrl' | 'publicKey' | 'description'>
		>(
			{
				name: userResponse.name,
				email: userResponse.email,
				photoUrl: userResponse.photoUrl ?? '',
				publicKey: userResponse.publicKey,
				description: userResponse.description ?? '',
			},
			process.env.ENCRYPT_KEY,
		);

		return callback(null, {
			responseStatus: 'SUCCESS',
			data: {
				user: {
					createdAt: userResponse.createdAt,
					updatedAt: userResponse.updatedAt,
					userId: userResponse._id.toString(),
					...bulkAesDecryptData,
				},
			},
		});
	} catch (error) {
		return errorCallback(callback, error);
	}
};
