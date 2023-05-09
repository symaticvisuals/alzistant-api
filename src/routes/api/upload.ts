import { Router } from 'express';
import { RequestHandler } from 'express-serve-static-core';
import { addImage, verifyImage } from '../../controllers/upload';

const router = Router();

router.route('/')
    .post(addImage as RequestHandler)
router.route('/verify')
    .post(verifyImage as RequestHandler)

export default router;
