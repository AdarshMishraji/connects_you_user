import { mongoose } from '@adarsh-mishra/node-utils/mongoHelpers';

export interface IUserRefreshTokenBase {
	loginId: mongoose.Types.ObjectId;
	loginMetaData: string;
}

export interface IUserRefreshTokenClean extends IUserRefreshTokenBase {
	tokenId: string;
	createdAt?: string;
	updatedAt?: string;
}

export interface IUserRefreshTokenRaw extends IUserRefreshTokenBase {
	_id: mongoose.Types.ObjectId;
	createdAt?: Date;
	updatedAt?: Date;
}
