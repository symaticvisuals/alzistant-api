import { Router } from 'express';
import { RequestHandler } from 'express-serve-static-core';
import { login, sendOtp } from '../../controllers/auth';
const router = Router();

router.route('/')
    .post(login as RequestHandler)

router.route('/sendOtp')
    .post(sendOtp as RequestHandler)

export default router;