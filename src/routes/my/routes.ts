import { Router } from 'express';

import { Endpoints } from '../endpoints';

const router = Router();

router.post(Endpoints.my.details.endpoint, (req, res) => {
	// TODO implement
});
router.get(Endpoints.my.appCachingData.endpoint, (req, res) => {
	// TODO implement
});

export { router as myRouter };
