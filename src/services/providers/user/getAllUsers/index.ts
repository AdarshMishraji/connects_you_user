import { GetAllUsersRequest, ResponseStatusEnum } from '@adarsh-mishra/connects_you_services/services/user';
import { isEmptyEntity } from '@adarsh-mishra/node-utils/commonHelpers';
import { BadRequestError, NotFoundError } from '@adarsh-mishra/node-utils/httpResponses';
import { MongoObjectId } from '@adarsh-mishra/node-utils/mongoHelpers';

import { UserModel } from '../../../../models';

import { prepareResponseForUser } from './prepareResponseForUser';

export const getAllUsers = async (request: GetAllUsersRequest) => {
	const { exceptUserId } = request;

	const exceptUserObjectId = MongoObjectId(exceptUserId);

	if (exceptUserId && !exceptUserObjectId)
		throw new BadRequestError({ error: 'Invalid request. Please provide valid exceptUserId' });

	const filter = exceptUserObjectId ? { _id: { $ne: exceptUserObjectId } } : {};

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

	return {
		responseStatus: ResponseStatusEnum.SUCCESS,
		data: {
			users: usersData,
		},
	};
};
