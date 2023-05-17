import { Router } from 'express';
import { verifyJwtToken } from '../../utils/utils';


const router = Router();

router.route('/')
    .post(verifyJwtToken, (req, res) => {
        res.send('hello')
    })


export default router;