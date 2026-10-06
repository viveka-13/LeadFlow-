import { Router, Request, Response } from 'express';
import { db } from '../storage/db';

const router = Router();

// GET /api/leads
router.get('/', (req: Request, res: Response) => {
  const leads = db.getLeads();
  res.json({ leads });
});

export default router;
