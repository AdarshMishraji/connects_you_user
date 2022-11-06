import { UserDetails } from '@adarsh-mishra/connects_you_services/services/user';
import { bulkAesDecrypt } from '@adarsh-mishra/node-utils/commonHelpers';

import { IUserBase, IUserRaw } from '../../../../types';

export const prepareResponseForUser = async (user: IUserRaw): Promise<UserDetails> => {
	const bulkAesDecryptData = await bulkAesDecrypt<
		Pick<IUserBase, 'name' | 'email' | 'photoUrl' | 'publicKey' | 'description'>
	>(
		{
			email: user.email,
			name: user.name,
			photoUrl: user.photoUrl ?? '',
			publicKey: user.publicKey,
			description: user.description ?? '',
		},
		process.env.ENCRYPT_KEY,
	);
	return {
		userId: user._id.toString(),
		createdAt: user.createdAt?.toISOString(),
		updatedAt: user.updatedAt?.toISOString(),
		...bulkAesDecryptData,
	};
};
