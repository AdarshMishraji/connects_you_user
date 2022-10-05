import { Router } from 'express';

import { Endpoints } from '../endpoints';

const router = Router();

router.post(Endpoints.users.list.endpoint, (req, res) => {
	// TODO implement
});
router.get(Endpoints.users.userId.endpoint, (req, res) => {
	// TODO implement
});

export { router as usersRouter };
