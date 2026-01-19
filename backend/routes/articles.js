import express from 'express';
import { body, validationResult, query } from 'express-validator';
import Article from '../models/Article.js';
import ArticleCoverage from '../models/ArticleCoverage.js';
import ArticleClassification from '../models/ArticleClassification.js';
import Tag from '../models/Tag.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Helper to generate slug from title
function generateSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// GET /api/articles - List articles
router.get(
  '/',
  [
    query('status').optional().isIn(['draft', 'published']),
    query('published').optional().isBoolean(),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const filters = {
        status: req.query.status,
        published: req.query.published === 'true',
        tag: req.query.tag,
        location: req.query.location,
        limit: req.query.limit ? parseInt(req.query.limit) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset) : undefined,
      };

      const articles = await Article.findAll(filters);
      
      // Get tags for each article
      for (const article of articles) {
        const tags = await Tag.findByArticleId(article.id);
        article.tags = tags;
      }
      
      res.json(articles);
    } catch (error) {
      console.error('Error fetching articles:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// GET /api/articles/:id - Get article by ID
router.get('/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Get coverages
    const coverages = await ArticleCoverage.findByArticleId(article.id);
    article.coverages = coverages;

    // Get classification
    const classification = await ArticleClassification.findByArticleId(article.id);
    article.classification = classification;

    // Get tags
    const Tag = (await import('../models/Tag.js')).default;
    const tags = await Tag.findByArticleId(article.id);
    article.tags = tags;

    res.json(article);
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/articles/slug/:slug - Get article by slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const article = await Article.findBySlug(req.params.slug);
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Get coverages
    const coverages = await ArticleCoverage.findByArticleId(article.id);
    article.coverages = coverages;

    // Get classification
    const classification = await ArticleClassification.findByArticleId(article.id);
    article.classification = classification;

    // Get tags
    const tags = await Tag.findByArticleId(article.id);
    article.tags = tags;

    res.json(article);
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/articles - Create article (requires auth)
router.post(
  '/',
  authenticate,
  [
    body('title').notEmpty().trim(),
    body('content').notEmpty(),
    body('status').optional().isIn(['draft', 'published']),
    body('political_bias').optional().isIn(['left', 'center', 'right']),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, content, editor_content, status, political_bias, location, tag_ids, cover_image } = req.body;
      let slug = generateSlug(title);

      // Ensure slug is unique
      let slugExists = await Article.slugExists(slug);
      let counter = 1;
      while (slugExists) {
        slug = `${generateSlug(title)}-${counter}`;
        slugExists = await Article.slugExists(slug);
        counter++;
      }

      const article = await Article.create({
        title,
        slug,
        content,
        editor_content,
        cover_image,
        author_id: req.user.id,
        status: status || 'draft',
        location,
      });

      // Create classification if provided
      if (political_bias) {
        await ArticleClassification.createOrUpdate(article.id, political_bias);
      }

      // Add tags if provided
      if (tag_ids && Array.isArray(tag_ids) && tag_ids.length > 0) {
        await Tag.addToArticle(article.id, tag_ids);
      }

      // Fetch tags for response
      const tags = await Tag.findByArticleId(article.id);
      article.tags = tags;

      res.status(201).json(article);
    } catch (error) {
      console.error('Error creating article:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// PUT /api/articles/:id - Update article (requires auth)
router.put(
  '/:id',
  authenticate,
  [
    body('title').optional().notEmpty().trim(),
    body('status').optional().isIn(['draft', 'published']),
    body('political_bias').optional().isIn(['left', 'center', 'right']),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const article = await Article.findById(req.params.id);
      if (!article) {
        return res.status(404).json({ error: 'Article not found' });
      }

      // Check ownership or admin
      if (article.author_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized' });
      }

      const updateData = { ...req.body };
      
      // Generate slug if title changed
      if (updateData.title) {
        let slug = generateSlug(updateData.title);
        const slugExists = await Article.slugExists(slug, article.id);
        if (slugExists) {
          let counter = 1;
          while (await Article.slugExists(`${slug}-${counter}`, article.id)) {
            counter++;
          }
          slug = `${slug}-${counter}`;
        }
        updateData.slug = slug;
      }

      const updatedArticle = await Article.update(req.params.id, updateData);

      // Update classification if provided
      if (updateData.political_bias) {
        await ArticleClassification.createOrUpdate(updatedArticle.id, updateData.political_bias);
      }

      // Update tags if provided
      if (updateData.tag_ids !== undefined) {
        const tagIds = Array.isArray(updateData.tag_ids) ? updateData.tag_ids : [];
        await Tag.addToArticle(updatedArticle.id, tagIds);
      }

      // Fetch tags for response
      const tags = await Tag.findByArticleId(updatedArticle.id);
      updatedArticle.tags = tags;

      res.json(updatedArticle);
    } catch (error) {
      console.error('Error updating article:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// DELETE /api/articles/:id - Delete article (requires auth)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Check ownership or admin
    if (article.author_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await Article.delete(req.params.id);
    res.json({ message: 'Article deleted' });
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
