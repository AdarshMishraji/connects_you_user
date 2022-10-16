import { getServiceProvider } from '@adarsh-mishra/connects_you_services';
import { ProtoGrpcType as AuthProtoGrpcType } from '@adarsh-mishra/connects_you_services/services/auth';
import { ProtoGrpcType as UserProtoGrpcType } from '@adarsh-mishra/connects_you_services/services/user';
import { Redis } from '@adarsh-mishra/node-utils/redisHelpers';
import { Server, ServerCredentials } from '@grpc/grpc-js';

import { v1Authenticate } from '../handlers/auth/v1.authenticate';
import { v1RefreshToken } from '../handlers/auth/v1.refreshToken';
import { v1Signout } from '../handlers/auth/v1.signout';
import { v1UpdateFcmToken } from '../handlers/auth/v1.updateFcmToken';
import { v1GetAllUsers } from '../handlers/user/v1.getAllUsers';
import { v1GetUserDetails } from '../handlers/user/v1.getUserDetails';
import { v1GetUserLoginHistory } from '../handlers/user/v1.getUserLoginHistory';
import { v1GetUserLoginInfo } from '../handlers/user/v1.getUserLoginInfo';
import { v1SetUserOnlineStatus } from '../handlers/user/v1.setUserOnlineStatus';
import { handlerWrapper } from '../helpers/grpcHandlersWrapper';

const port = `0.0.0.0:${process.env.PORT || 1000}`;

const ServiceProviders = {
	auth: (getServiceProvider('auth') as unknown as AuthProtoGrpcType).auth,
	user: (getServiceProvider('user') as unknown as UserProtoGrpcType).user,
};

export const createGRPCServer = ({ redisClient }: { redisClient: Redis }) => {
	const server = new Server({ 'grpc.keepalive_permit_without_calls': 1 });

	server.addService(ServiceProviders.auth.AuthServices.service, {
		authenticate: handlerWrapper(v1Authenticate, { redisClient }),
		refreshToken: handlerWrapper(v1RefreshToken, { redisClient }),
		signout: handlerWrapper(v1Signout, { redisClient }),
		updateFcmToken: handlerWrapper(v1UpdateFcmToken, { redisClient }),
	});
	server.addService(ServiceProviders.user.UserServices.service, {
		getUserDetails: handlerWrapper(v1GetUserDetails, { redisClient }),
		getAllUsers: handlerWrapper(v1GetAllUsers, { redisClient }),
		getUserLoginInfo: handlerWrapper(v1GetUserLoginInfo, { redisClient }),
		getUserLoginHistory: handlerWrapper(v1GetUserLoginHistory, { redisClient }),
		setUserOnlineStatus: handlerWrapper(v1SetUserOnlineStatus, { redisClient }),
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
