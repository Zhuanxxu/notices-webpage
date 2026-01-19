import express from 'express';
import { body, validationResult, param } from 'express-validator';
import ArticleCoverage from '../models/ArticleCoverage.js';
import Article from '../models/Article.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// GET /api/coverages/article/:articleId - Get coverages for an article
router.get(
  '/article/:articleId',
  [param('articleId').isInt()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const coverages = await ArticleCoverage.findByArticleId(req.params.articleId);
      res.json(coverages);
    } catch (error) {
      console.error('Error fetching coverages:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// POST /api/coverages - Create coverage (requires auth)
router.post(
  '/',
  authenticate,
  [
    body('article_id').isInt(),
    body('media_source_id').isInt(),
    body('coverage_url').isURL(),
    body('coverage_title').notEmpty().trim(),
    body('snippet').optional().trim(),
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

      const coverage = await ArticleCoverage.create(req.body);
      res.status(201).json(coverage);
    } catch (error) {
      console.error('Error creating coverage:', error);
      if (error.code === '23505') {
        // Unique constraint violation
        return res.status(400).json({ error: 'Coverage already exists' });
      }
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// PUT /api/coverages/:id - Update coverage (requires auth)
router.put(
  '/:id',
  authenticate,
  [
    param('id').isInt(),
    body('media_source_id').optional().isInt(),
    body('coverage_url').optional().isURL(),
    body('coverage_title').optional().notEmpty().trim(),
    body('snippet').optional().trim(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const coverage = await ArticleCoverage.findById(req.params.id);
      if (!coverage) {
        return res.status(404).json({ error: 'Coverage not found' });
      }

      // Check if user has permission
      const article = await Article.findById(coverage.article_id);
      if (article.author_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized' });
      }

      const updated = await ArticleCoverage.update(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      console.error('Error updating coverage:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// DELETE /api/coverages/:id - Delete coverage (requires auth)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const coverage = await ArticleCoverage.findById(req.params.id);
    if (!coverage) {
      return res.status(404).json({ error: 'Coverage not found' });
    }

    // Check if user has permission
    const article = await Article.findById(coverage.article_id);
    if (article.author_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await ArticleCoverage.delete(req.params.id);
    res.json({ message: 'Coverage deleted' });
  } catch (error) {
    console.error('Error deleting coverage:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
