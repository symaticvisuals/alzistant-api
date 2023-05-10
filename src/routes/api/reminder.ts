import { Router } from 'express';
import { RequestHandler } from 'express-serve-static-core';
import { verifyJwtToken } from '../../utils/utils';
import { create, getByUserId } from '../../controllers/pillReminder';

const router = Router();

router.route('/')
    .get(verifyJwtToken, getByUserId as RequestHandler)
    .post(verifyJwtToken, create as RequestHandler)

export default router;