/* eslint-disable @typescript-eslint/naming-convention */

import { TUser } from './user';

export * from './user';
export * from './userLoginHistory';
export * from './userRefreshToken';

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			PORT: number;
			GOOGLE_CLIENT_ID: string;
			SECRET: string;
			ENCRYPT_KEY: string;
			HASH_KEY: string;
			API_KEY: string;
			ENV: 'dev' | 'prod';
			DEV_MONGO_URL: string;
			DEV_REDIS_HOST: string;
			DEV_REDIS_PORT: number;
			DEV_REDIS_DB: number;
			PROD_MONGO_URL: string;
			PROD_REDIS_HOST: string;
			PROD_REDIS_PORT: number;
			PROD_REDIS_DB: number;
			IP_INFO_TOKEN: string;
		}
	}

	namespace Express {
		interface Request {
			user?: TUser;
		}
	}
}
