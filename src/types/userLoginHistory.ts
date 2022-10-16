import { mongoose } from '@adarsh-mishra/node-utils/mongoHelpers';

export interface IUserLoginHistory {
	userId: mongoose.Types.ObjectId;
	loginMetaData: string;
	createdAt?: string;
	isValid: boolean;
}
