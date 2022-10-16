import { TokenPayload } from 'google-auth-library';

export interface IUser {
	email: string;
	emailHash: string;
	name: string;
	photoUrl?: string;
	description?: string;
	publicKey: string;
	fcmToken: string;
	emailVerified: boolean;
	authProvider: string;
	locale: string;
	createdAt?: string;
	updatedAt?: string;
}

export type TUser = IUser | TokenPayload;
