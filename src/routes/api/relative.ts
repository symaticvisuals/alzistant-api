import { RequestHandler, Router } from 'express';
import { verifyJwtToken } from '../../utils/utils';
import { create, getAll } from '../../controllers/relative';


const router = Router();


router.route('/')
    .get(verifyJwtToken, getAll as RequestHandler)
    .post(verifyJwtToken, create as RequestHandler);


export default router;