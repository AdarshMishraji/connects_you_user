import { mongoose } from '@adarsh-mishra/node-utils/mongoHelpers';

export interface IUserRefreshToken {
	loginId: mongoose.Types.ObjectId;
	loginMetaData: string;
	createdAt?: string;
}
