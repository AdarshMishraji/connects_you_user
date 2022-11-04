import { getServiceProvider } from '@adarsh-mishra/connects_you_services';
import { ProtoGrpcType as AuthProtoGrpcType } from '@adarsh-mishra/connects_you_services/services/auth';
import { ProtoGrpcType as UserProtoGrpcType } from '@adarsh-mishra/connects_you_services/services/user';
import { Redis } from '@adarsh-mishra/node-utils/redisHelpers';
import { Server, ServerCredentials } from '@grpc/grpc-js';

import { handlerWrapper } from '../helpers/grpcHandlersWrapper';

import { authenticate } from './providers/auth/authenticate';
import { refreshToken } from './providers/auth/refreshToken';
import { signout } from './providers/auth/signout';
import { updateFcmToken } from './providers/auth/updateFcmToken';
import { getAllUsers } from './providers/user/getAllUsers';
import { getUserDetails } from './providers/user/getUserDetails';
import { getUserLoginHistory } from './providers/user/getUserLoginHistory';
import { getUserLoginInfo } from './providers/user/getUserLoginInfo';

const port = `0.0.0.0:${process.env.PORT || 1000}`;

const ServiceProviders = {
	auth: (getServiceProvider('auth') as unknown as AuthProtoGrpcType).auth,
	user: (getServiceProvider('user') as unknown as UserProtoGrpcType).user,
};

export const createGRPCServer = ({ redisClient }: { redisClient: Redis }) => {
	const server = new Server({ 'grpc.keepalive_permit_without_calls': 1 });

	server.addService(ServiceProviders.auth.AuthServices.service, {
		authenticate: handlerWrapper(authenticate, { redisClient }),
		refreshToken: handlerWrapper(refreshToken, { redisClient }),
		signout: handlerWrapper(signout, { redisClient }),
		updateFcmToken: handlerWrapper(updateFcmToken, { redisClient }),
	});
	server.addService(ServiceProviders.user.UserServices.service, {
		getUserLoginInfo: handlerWrapper(getUserLoginInfo, { redisClient }),
		getUserDetails: handlerWrapper(getUserDetails, { redisClient }),
		getAllUsers: handlerWrapper(getAllUsers, { redisClient }),
		getUserLoginHistory: handlerWrapper(getUserLoginHistory, { redisClient }),
	});

	server.bindAsync(port.toString(), ServerCredentials.createInsecure(), (error, port) => {
		if (error) {
			throw error;
		}
		// eslint-disable-next-line no-console
		console.log(`Server running at ${port}`);
		server.start();
	});
};
