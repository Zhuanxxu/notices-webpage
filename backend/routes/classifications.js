import express from 'express';
import { body, validationResult, param } from 'express-validator';
import ArticleClassification from '../models/ArticleClassification.js';
import Article from '../models/Article.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// GET /api/classifications/article/:articleId - Get classification for an article
router.get(
  '/article/:articleId',
  [param('articleId').isInt()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const classification = await ArticleClassification.findByArticleId(req.params.articleId);
      if (!classification) {
        return res.status(404).json({ error: 'Classification not found' });
      }
      res.json(classification);
    } catch (error) {
      console.error('Error fetching classification:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// POST /api/classifications - Create or update classification (requires auth)
router.post(
  '/',
  authenticate,
  [
    body('article_id').isInt(),
    body('political_bias').isIn(['left', 'center', 'right']),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Check if article exists and user has permission
      const article = await Article.findById(req.body.article_id);
      if (!article) {
        return res.status(404).json({ error: 'Article not found' });
      }

      if (article.author_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized' });
      }

      const classification = await ArticleClassification.createOrUpdate(
        req.body.article_id,
        req.body.political_bias
      );
      res.json(classification);
    } catch (error) {
      console.error('Error creating/updating classification:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// DELETE /api/classifications/article/:articleId - Delete classification (requires auth)
router.delete(
  '/article/:articleId',
  authenticate,
  [param('articleId').isInt()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Check if article exists and user has permission
      const article = await Article.findById(req.params.articleId);
      if (!article) {
        return res.status(404).json({ error: 'Article not found' });
      }

      if (article.author_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized' });
      }

      await ArticleClassification.delete(req.params.articleId);
      res.json({ message: 'Classification deleted' });
    } catch (error) {
      console.error('Error deleting classification:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

export default router;
