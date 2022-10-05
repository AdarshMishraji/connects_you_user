import { NextFunction, Request, Response } from 'express';

export const validateAccess = (req: Request, res: Response, next: NextFunction) => {
	const apiKey = req.headers['api-key'];
	if (apiKey === process.env.API_KEY) next();
	else res.create<undefined, string>?.().unauthorized('Invalid API key').send();
};
