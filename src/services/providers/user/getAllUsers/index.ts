import {
	GetAllUsersRequest,
	GetAllUsersResponse,
	ResponseStatusEnum,
} from '@adarsh-mishra/connects_you_services/services/user';
import { isEmptyEntity } from '@adarsh-mishra/node-utils/commonHelpers';
import { BadRequestError, NotFoundError } from '@adarsh-mishra/node-utils/httpResponses';
import { MongoObjectId } from '@adarsh-mishra/node-utils/mongoHelpers';
import { sendUnaryData, ServerUnaryCall } from '@grpc/grpc-js';

import { UserModel } from '../../../../models';
import { errorCallback } from '../../../../utils';

import { prepareResponseForUser } from './prepareResponseForUser';

export const getAllUsers = async (
	req: ServerUnaryCall<GetAllUsersRequest, GetAllUsersResponse>,
	callback: sendUnaryData<GetAllUsersResponse>,
) => {
	try {
		const { exceptUserId } = req.request;

		const exceptUserObjectId = MongoObjectId(exceptUserId);

		if (exceptUserId && !exceptUserObjectId) throw new BadRequestError({ error: 'ExpectUserId is invalid.' });

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
