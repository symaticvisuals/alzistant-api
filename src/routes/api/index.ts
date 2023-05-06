import { Router } from 'express';
import uploadRouter from './upload';
import authRouter from './auth'

const router = Router();

router.use('/upload', uploadRouter);
router.use('/auth', authRouter)

export default router;
