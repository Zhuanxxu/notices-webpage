import pool from '../config/database.js';

class Tag {
  static async findAll() {
    const result = await pool.query(
      'SELECT * FROM tags ORDER BY name ASC'
    );
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query(
      'SELECT * FROM tags WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async findBySlug(slug) {
    const result = await pool.query(
      'SELECT * FROM tags WHERE slug = $1',
      [slug]
    );
    return result.rows[0];
  }

  static async findByIds(ids) {
    if (!ids || ids.length === 0) return [];
    const result = await pool.query(
      'SELECT * FROM tags WHERE id = ANY($1::int[])',
      [ids]
    );
    return result.rows;
  }

  static async findByArticleId(articleId) {
    const result = await pool.query(
      `SELECT t.* 
       FROM tags t
       INNER JOIN article_tags at ON t.id = at.tag_id
       WHERE at.article_id = $1
       ORDER BY t.name ASC`,
      [articleId]
    );
    return result.rows;
  }

  static async create(name) {
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const result = await pool.query(
      'INSERT INTO tags (name, slug) VALUES ($1, $2) RETURNING *',
      [name, slug]
    );
    return result.rows[0];
  }

  static async addToArticle(articleId, tagIds) {
    if (!tagIds || tagIds.length === 0) return [];

    // Remove existing tags for this article
    await pool.query(
      'DELETE FROM article_tags WHERE article_id = $1',
      [articleId]
    );

    // Add new tags
    if (tagIds.length > 0) {
      const values = tagIds.map((tagId, index) => 
        `($1, $${index + 2})`
      ).join(', ');
      
      const params = [articleId, ...tagIds];
      await pool.query(
        `INSERT INTO article_tags (article_id, tag_id) VALUES ${values}`,
        params
      );
    }

    return this.findByArticleId(articleId);
  }

  static async removeFromArticle(articleId, tagId) {
    await pool.query(
      'DELETE FROM article_tags WHERE article_id = $1 AND tag_id = $2',
      [articleId, tagId]
    );
  }
}

export default Tag;
