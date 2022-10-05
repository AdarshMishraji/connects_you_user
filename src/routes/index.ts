import { Router } from 'express';

import { validateAccess } from '../middlewares';

import { authRouter } from './auth/routes';
import { Endpoints } from './endpoints';
import { myRouter } from './my/routes';
import { usersRouter } from './users/routes';

const v1Router = Router();

v1Router.use((req, _, next) => {
	// eslint-disable-next-line no-console
	console.log(req.url);
	next();
});
v1Router.use(validateAccess);

// v1Routers
v1Router.use(`/v1${Endpoints.auth.endpoint}`, authRouter);
v1Router.use(`/v1${Endpoints.my.endpoint}`, myRouter);
v1Router.use(`/v1${Endpoints.users.endpoint}`, usersRouter);

export { v1Router };
