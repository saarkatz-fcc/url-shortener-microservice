import { Router } from 'express';
import shortener_view from './shortener_service';

const router = Router();


router.get('/api/shorturl', shortener_view)


export default router;
