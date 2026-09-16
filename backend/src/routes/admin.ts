import { Router } from 'express';
import { pool } from '../config/db';

const router = Router();

// Basic admin auth middleware (In production, use proper auth like JWT/Supabase Auth)
const adminAuth = (req: any, res: any, next: any) => {
  const adminSecret = req.headers['x-admin-secret'];
  if (adminSecret !== (process.env.ADMIN_SECRET || 'supersecret')) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  next();
};

router.get('/pending', adminAuth, async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM bhajans WHERE status = 'pending' ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pending bhajans' });
  }
});

router.put('/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'
    const { id } = req.params;
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const { rows } = await pool.query(
      "UPDATE bhajans SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );

    if (rows.length === 0) return res.status(404).json({ error: 'Bhajan not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});

export default router;
