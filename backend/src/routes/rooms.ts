import { Router } from 'express';
import { RoomService } from '../services/roomService';
import { pool } from '../config/db';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { creatorName } = req.body;
    if (!creatorName) return res.status(400).json({ error: 'Creator name required' });
    
    const { code, roomId } = await RoomService.createRoom(creatorName);
    res.status(201).json({ code, roomId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

router.get('/:code', async (req, res) => {
  try {
    const roomState = await RoomService.getRoom(req.params.code);
    if (!roomState) return res.status(404).json({ error: 'Room not found or expired' });
    
    res.json(roomState);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch room' });
  }
});

export default router;
