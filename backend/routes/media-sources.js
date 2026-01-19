import express from 'express';
import { body, validationResult } from 'express-validator';
import MediaSource from '../models/MediaSource.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// GET /api/media-sources - List all media sources
router.get('/', async (req, res) => {
  try {
    const mediaSources = await MediaSource.findAll();
    res.json(mediaSources);
  } catch (error) {
    console.error('Error fetching media sources:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/media-sources/:id - Get media source by ID
router.get('/:id', async (req, res) => {
  try {
    const mediaSource = await MediaSource.findById(req.params.id);
    if (!mediaSource) {
      return res.status(404).json({ error: 'Media source not found' });
    }
    res.json(mediaSource);
  } catch (error) {
    console.error('Error fetching media source:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/media-sources - Create media source (requires auth)
router.post(
  '/',
  authenticate,
  [
    body('name').notEmpty().trim(),
    body('url').isURL(),
    body('bias_rating').isIn(['left', 'center', 'right']),
    body('logo_url').optional().isURL(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const mediaSource = await MediaSource.create(req.body);
      res.status(201).json(mediaSource);
    } catch (error) {
      console.error('Error creating media source:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// PUT /api/media-sources/:id - Update media source (requires auth)
router.put(
  '/:id',
  authenticate,
  [
    body('name').optional().notEmpty().trim(),
    body('url').optional().isURL(),
    body('bias_rating').optional().isIn(['left', 'center', 'right']),
    body('logo_url').optional().isURL(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const mediaSource = await MediaSource.findById(req.params.id);
      if (!mediaSource) {
        return res.status(404).json({ error: 'Media source not found' });
      }

      const updated = await MediaSource.update(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      console.error('Error updating media source:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// DELETE /api/media-sources/:id - Delete media source (requires auth)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const mediaSource = await MediaSource.findById(req.params.id);
    if (!mediaSource) {
      return res.status(404).json({ error: 'Media source not found' });
    }

    await MediaSource.delete(req.params.id);
    res.json({ message: 'Media source deleted' });
  } catch (error) {
    console.error('Error deleting media source:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
