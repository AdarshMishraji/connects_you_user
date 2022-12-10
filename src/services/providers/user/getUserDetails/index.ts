import { GetUserDetailsRequest, ResponseStatusEnum } from '@adarsh-mishra/connects_you_services/services/user';
import { bulkAesDecrypt, isEmptyEntity } from '@adarsh-mishra/node-utils/commonHelpers';
import { BadRequestError, NotFoundError } from '@adarsh-mishra/node-utils/httpResponses';
import { MongoObjectId } from '@adarsh-mishra/node-utils/mongoHelpers';

import { UserModel } from '../../../../models';
import { IUserBase } from '../../../../types';

export const getUserDetails = async (request: GetUserDetailsRequest) => {
	const { userId } = request;
	if (!userId) {
		throw new BadRequestError({ error: 'Invalid request. Please provide userId' });
	}

	const userObjectId = MongoObjectId(userId);

	if (!userObjectId) {
		throw new BadRequestError({ error: 'Invalid request. Please provide valid userId' });
	}

	const userResponse = await UserModel.findOne(
		{ _id: userObjectId },
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

	if (!userResponse || isEmptyEntity(userResponse)) throw new NotFoundError({ error: 'User not found' });

	const bulkAesDecryptData = await bulkAesDecrypt<
		Pick<IUserBase, 'name' | 'email' | 'photoUrl' | 'publicKey' | 'description'>
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

	return {
		responseStatus: ResponseStatusEnum.SUCCESS,
		data: {
			user: {
				createdAt: userResponse.createdAt?.toISOString(),
				updatedAt: userResponse.updatedAt?.toISOString(),
				userId: userResponse._id.toString(),
				...bulkAesDecryptData,
			},
		},
	};
};
