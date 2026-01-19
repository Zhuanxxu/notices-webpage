import express from 'express';
import { body, validationResult, query } from 'express-validator';
import Tag from '../models/Tag.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// GET /api/tags - List all tags
router.get('/', async (req, res) => {
  try {
    const tags = await Tag.findAll();
    res.json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/tags/article/:articleId - Get tags for an article
router.get('/article/:articleId', async (req, res) => {
  try {
    const tags = await Tag.findByArticleId(req.params.articleId);
    res.json(tags);
  } catch (error) {
    console.error('Error fetching article tags:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/tags - Create tag (requires auth)
router.post(
  '/',
  authenticate,
  [
    body('name').notEmpty().trim(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const tag = await Tag.create(req.body.name);
      res.status(201).json(tag);
    } catch (error) {
      console.error('Error creating tag:', error);
      if (error.code === '23505') {
        return res.status(400).json({ error: 'Tag already exists' });
      }
      res.status(500).json({ error: 'Server error' });
    }
  }
);

export default router;
