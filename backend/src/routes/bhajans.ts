import { Router } from 'express';
import { BhajansService } from '../services/bhajansService';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { search, lang } = req.query;
    const bhajans = await BhajansService.getAllBhajans(
      search as string, 
      lang as string
    );
    res.json(bhajans);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch bhajans' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const bhajan = await BhajansService.getBhajanById(req.params.id);
    if (!bhajan) return res.status(404).json({ error: 'Bhajan not found' });
    res.json(bhajan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch bhajan' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, language, lyrics, addedBy } = req.body;
    if (!title || !lyrics || !Array.isArray(lyrics) || lyrics.length === 0) {
      return res.status(400).json({ error: 'Invalid bhajan data' });
    }
    const bhajan = await BhajansService.addBhajan(title, language || 'hi', lyrics, addedBy);
    res.status(201).json(bhajan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create bhajan' });
  }
});

export default router;
