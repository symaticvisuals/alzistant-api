import { Router } from 'express';
import { RequestHandler } from 'express-serve-static-core';
import { addImage, deleteAllImages, verifyImage } from '../../controllers/upload';
import { verifyJwtToken } from '../../utils/utils';

const router = Router();

// router.route('/')
//     .post(verifyJwtToken, addImage as RequestHandler)
router.route('/verify')
    .post(verifyImage as RequestHandler)

router.route('/delete')
    .delete(deleteAllImages as RequestHandler)

export default router;
