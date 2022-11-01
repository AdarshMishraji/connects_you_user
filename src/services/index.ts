import { getServiceProvider } from '@adarsh-mishra/connects_you_services';
import { ProtoGrpcType as AuthProtoGrpcType } from '@adarsh-mishra/connects_you_services/services/auth';
import { ProtoGrpcType as UserProtoGrpcType } from '@adarsh-mishra/connects_you_services/services/user';
import { Redis } from '@adarsh-mishra/node-utils/redisHelpers';
import { Server, ServerCredentials } from '@grpc/grpc-js';

import { authenticate } from '../handlers/auth/authenticate';
import { refreshToken } from '../handlers/auth/refreshToken';
import { signout } from '../handlers/auth/signout';
import { updateFcmToken } from '../handlers/auth/updateFcmToken';
import { getAllUsers } from '../handlers/user/getAllUsers';
import { getUserDetails } from '../handlers/user/getUserDetails';
import { getUserLoginHistory } from '../handlers/user/getUserLoginHistory';
import { getUserLoginInfo } from '../handlers/user/getUserLoginInfo';
import { handlerWrapper } from '../helpers/grpcHandlersWrapper';

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
