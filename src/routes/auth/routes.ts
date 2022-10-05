import { Router } from 'express';

import { Endpoints } from '../endpoints';

import { v1Authenticate } from './v1.authenticate';
import { v1RefreshToken } from './v1.refreshToken';
import { v1Signout } from './v1.signout';
import { v1UpdateFcmToken } from './v1.updateFcmToken';

const router = Router();

router.post(Endpoints.auth.authenticate.endpoint, v1Authenticate);
router.post(Endpoints.auth.signout.endpoint, v1Signout);
router.post(Endpoints.auth.refreshToken.endpoint, v1RefreshToken);
router.post(Endpoints.auth.updateFcmToken.endpoint, v1UpdateFcmToken);

export { router as authRouter };
