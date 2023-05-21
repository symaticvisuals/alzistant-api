import { Router } from 'express';
import { RequestHandler } from 'express-serve-static-core';
import { verifyCaretakerRole, verifyJwtToken } from '../../utils/utils';
import { create, deleteReminderById, getAll, getByUserId, updateIsTaken, updateReminder } from '../../controllers/pillReminder';

const router = Router();

router.route('/')
    .get(verifyJwtToken, getByUserId as RequestHandler)
    .post(verifyJwtToken, create as RequestHandler)


router.route('/:id')
    .patch(verifyJwtToken, updateReminder as RequestHandler)
    .delete(verifyJwtToken, verifyCaretakerRole, deleteReminderById as RequestHandler)

router.route('/all')
    .get(verifyJwtToken, getAll as RequestHandler)

router.route('/done')
    .post(verifyJwtToken, updateIsTaken as RequestHandler)

export default router;