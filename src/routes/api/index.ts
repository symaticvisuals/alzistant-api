import { Router } from 'express';
import uploadRouter from './upload';
import authRouter from './auth'
import userRouter from './user'

const router = Router();

router.use('/upload', uploadRouter);
router.use('/auth', authRouter)
router.use('/user', userRouter)

export default router;
