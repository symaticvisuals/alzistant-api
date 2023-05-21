import { Router } from 'express';
import { RequestHandler } from 'express-serve-static-core';
import { verifyJwtToken } from '../../utils/utils';
import { createPatient, findCaretakerByPatientEmail, findPatientsCount } from '../../controllers/user';

const router = Router();

router.route('/add-patient')
    .post(verifyJwtToken, createPatient as RequestHandler)

router.route('/find-patients-count')
    .get(verifyJwtToken, findPatientsCount as RequestHandler)

router.route('/caretaker')
    .get(verifyJwtToken, findCaretakerByPatientEmail as RequestHandler)



export default router;