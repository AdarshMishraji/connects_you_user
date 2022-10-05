import { BadRequestError, mongoose, NotFoundError } from '@adarsh-mishra/node-utils';
import { Request, Response } from 'express';

import { UserLoginHistoryModel } from '../../../models';

export const v1Signout = async (req: Request, res: Response) => {
	try {
		if (!req.body.userId || !req.body.loginId)
			throw new BadRequestError<string>({ error: 'Invalid request. Please provide loginId and userId' });
		const updatedUserLoginHistory = await UserLoginHistoryModel.updateOne(
			{
				userId: new mongoose.Types.ObjectId(req.body.userId),
				_id: new mongoose.Types.ObjectId(req.body.loginId),
				isValid: true,
			},
			{ isValid: false },
		).exec();
		if (updatedUserLoginHistory.modifiedCount > 0) {
			return res.create?.().success().send();
		} else {
			throw new NotFoundError({ error: 'User not updated' });
		}
	} catch (error) {
		if (error instanceof BadRequestError) {
			return res.create<undefined, typeof error.error>?.().badRequest(error.error).send();
		} else if (error instanceof NotFoundError) {
			return res.create<undefined, typeof error.error>?.().notFound(error.error).send();
		}
		return res.create?.().internalServerError(error).send();
	}
};
