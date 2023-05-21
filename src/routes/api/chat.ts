import { RequestHandler, Router } from 'express';
import { verifyJwtToken } from '../../utils/utils';
import { createCareTakerChat, createUserChat, getCareTakerChats, getUserChats } from '../../controllers/chat';


const router = Router();

router.route('/')
    .get(verifyJwtToken, getUserChats as RequestHandler)
    .post(verifyJwtToken, createUserChat as RequestHandler)

router.route('/caretaker')
    .post(verifyJwtToken, createCareTakerChat as RequestHandler)

router.route('/patient')
    .get(verifyJwtToken, getCareTakerChats as RequestHandler)


export default router;