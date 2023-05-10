import { Router } from 'express';
import uploadRouter from './upload';
import authRouter from './auth'
import userRouter from './user'
import reminderRouter from './reminder'

const router = Router();

router.use('/upload', uploadRouter);
router.use('/auth', authRouter)
router.use('/user', userRouter)
router.use('/reminder', reminderRouter)

export default router;
