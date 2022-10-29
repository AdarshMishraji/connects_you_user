import { mongoose } from '@adarsh-mishra/node-utils/mongoHelpers';

export interface IUserLoginHistoryBase {
	userId: mongoose.Types.ObjectId;
	loginMetaData: string;
	isValid: boolean;
}

export interface IUserLoginHistoryClean extends IUserLoginHistoryBase {
	loginId: string;
	createdAt?: string;
	updatedAt?: string;
}

export interface IUserLoginHistoryRaw extends IUserLoginHistoryBase {
	_id: mongoose.Types.ObjectId;
	createdAt?: Date;
	updatedAt?: Date;
}
