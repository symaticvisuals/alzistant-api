import { Router } from 'express';
import uploadRouter from './upload';
import authRouter from './auth'
import userRouter from './user'
import reminderRouter from './reminder'
import chatRouter from './chat'
import galleryRouter from './gallery'


const router = Router();

router.use('/upload', uploadRouter);
router.use('/auth', authRouter)
router.use('/user', userRouter)
router.use('/reminder', reminderRouter)
router.use('/chat', chatRouter)
router.use('/gallery', galleryRouter)

export default router;
