import { aesEncryptData, BadRequestError, jwt, mongoose } from '@adarsh-mishra/node-utils';
import { Request, Response } from 'express';

import { fetchRequestMetaData } from '../../../helpers';
import { UserRefreshTokenModel } from '../../../models/userRefreshToken.model';
import { TokenTypesEnum } from '../types';

export const v1RefreshToken = async (req: Request, res: Response) => {
	try {
		if (!req.body.loginId || !req.body.userId)
			throw new BadRequestError<string>({ error: 'Invalid request. Please provide loginId and userId' });

		const requestMetaData = await fetchRequestMetaData(req);
		const loginMetaData = aesEncryptData(JSON.stringify(requestMetaData), process.env.ENCRYPT_KEY);

		const token = jwt.sign(
			{
				userId: req.body.userId,
				loginId: req.body.loginId,
				type: TokenTypesEnum.REFRESH_TOKEN,
			},
			process.env.SECRET,
			{ expiresIn: '90d' },
		);

		await new UserRefreshTokenModel({
			loginId: new mongoose.Types.ObjectId(req.body.loginId),
			loginMetaData,
		}).save();

		return res.create<{ token: string }>?.({ token }).success().send();
	} catch (error) {
		if (error instanceof BadRequestError) {
			return res.create<undefined, typeof error.error>?.().badRequest(error.error).send();
		}
		return res.create?.().internalServerError(error).send();
	}
};
