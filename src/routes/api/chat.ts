import { RequestHandler, Router } from 'express';
import { verifyJwtToken } from '../../utils/utils';
import { createUserChat, getUserChats } from '../../controllers/chat';


const router = Router();

router.route('/')
    .get(verifyJwtToken, getUserChats as RequestHandler)
    .post(verifyJwtToken, createUserChat as RequestHandler)


export default router;