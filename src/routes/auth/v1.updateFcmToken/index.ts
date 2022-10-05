import { BadRequestError, mongoose, NotFoundError } from '@adarsh-mishra/node-utils';
import { Request, Response } from 'express';

import { UserModel } from '../../../models';

export const v1UpdateFcmToken = async (req: Request, res: Response) => {
	try {
		if (!req.body.fcmToken || !req.body.userId) {
			throw new BadRequestError<string>({ error: 'Invalid request. Please provide fcmToken and userId' });
		}

		const updatedUser = await UserModel.updateOne(
			{ _id: new mongoose.Types.ObjectId(req.body.userId) },
			{ fcmToken: req.body.fcmToken },
		).exec();

		if (updatedUser.modifiedCount === 0) {
			throw new NotFoundError<string>({ error: 'userId not found' });
		}
		return res.create?.().success().send();
	} catch (error) {
		if (error instanceof BadRequestError) {
			res.create<undefined, typeof error.error>?.().badRequest(error.error).send();
		} else if (error instanceof NotFoundError) {
			res.create<undefined, typeof error.error>?.().notFound(error.error).send();
		}
		return res.create?.().internalServerError(error).send();
	}
};
