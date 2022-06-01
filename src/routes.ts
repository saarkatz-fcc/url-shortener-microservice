import { Router } from 'express';
import { create_shorturl, redirect_shorturl } from './shortener_service';

const router = Router();


router.post('/api/shorturl', create_shorturl)
router.get('/api/shorturl/:shorturl', redirect_shorturl)


export default router;
