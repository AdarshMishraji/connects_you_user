import { UserModel } from '../models';

type TQueryType = Partial<Record<'userId' | 'emailHash', unknown>>;

export const fetchUserDetails = (query: TQueryType) => {
	return UserModel.findOne(query).lean().exec();
};
