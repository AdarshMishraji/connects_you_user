import { mongoose } from '@adarsh-mishra/node-utils';

export interface IUserRefreshToken {
	loginId: mongoose.Types.ObjectId;
	loginMetaData: string;
	createdAt?: string;
}
