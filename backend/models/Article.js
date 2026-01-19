import pool from '../config/database.js';

class Article {
  static async findAll(filters = {}) {
    let query = `
      SELECT 
        a.*,
        u.email as author_email,
        u.role as author_role,
        ac.political_bias
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      LEFT JOIN article_classifications ac ON a.id = ac.article_id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (filters.status) {
      query += ` AND a.status = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
    }

    if (filters.published === true) {
      query += ` AND a.status = 'published' AND a.published_at IS NOT NULL`;
    }

    if (filters.tag) {
      query += ` AND EXISTS (
        SELECT 1 FROM article_tags at 
        INNER JOIN tags t ON at.tag_id = t.id 
        WHERE at.article_id = a.id AND t.slug = $${paramCount}
      )`;
      params.push(filters.tag);
      paramCount++;
    }

    if (filters.location) {
      query += ` AND a.location ILIKE $${paramCount}`;
      params.push(`%${filters.location}%`);
      paramCount++;
    }

    query += ` ORDER BY a.created_at DESC`;

    if (filters.limit) {
      query += ` LIMIT $${paramCount}`;
      params.push(filters.limit);
      paramCount++;
    }

    if (filters.offset) {
      query += ` OFFSET $${paramCount}`;
      params.push(filters.offset);
    }

    const result = await pool.query(query, params);
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query(
      `SELECT 
        a.*,
        u.email as author_email,
        u.role as author_role
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      WHERE a.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async findBySlug(slug) {
    const result = await pool.query(
      `SELECT 
        a.*,
        u.email as author_email,
        u.role as author_role
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      WHERE a.slug = $1`,
      [slug]
    );
    return result.rows[0];
  }

  static async create(data) {
    const { title, slug, content, editor_content, cover_image, author_id, status, location, excerpt } = data;
    const result = await pool.query(
      `INSERT INTO articles (title, slug, content, editor_content, cover_image, author_id, status, published_at, location, excerpt)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        title,
        slug,
        content,
        editor_content || null,
        cover_image || null,
        author_id,
        status || 'draft',
        status === 'published' ? new Date() : null,
        location || null,
        excerpt || null,
      ]
    );
    return result.rows[0];
  }

  static async update(id, data) {
    const { title, slug, content, editor_content, cover_image, status, location, excerpt } = data;
    const updates = [];
    const params = [];
    let paramCount = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      params.push(title);
    }
    if (slug !== undefined) {
      updates.push(`slug = $${paramCount++}`);
      params.push(slug);
    }
    if (content !== undefined) {
      updates.push(`content = $${paramCount++}`);
      params.push(content);
    }
    if (editor_content !== undefined) {
      updates.push(`editor_content = $${paramCount++}`);
      params.push(editor_content);
    }
    if (cover_image !== undefined) {
      updates.push(`cover_image = $${paramCount++}`);
      params.push(cover_image);
    }
    if (location !== undefined) {
      updates.push(`location = $${paramCount++}`);
      params.push(location);
    }
    if (excerpt !== undefined) {
      updates.push(`excerpt = $${paramCount++}`);
      params.push(excerpt);
    }
    if (status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      params.push(status);
      if (status === 'published') {
        updates.push(`published_at = COALESCE(published_at, CURRENT_TIMESTAMP)`);
      }
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    params.push(id);
    const result = await pool.query(
      `UPDATE articles SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount} RETURNING *`,
      params
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM articles WHERE id = $1 RETURNING id', [id]);
    return result.rows[0];
  }

  static async slugExists(slug, excludeId = null) {
    let query = 'SELECT EXISTS(SELECT 1 FROM articles WHERE slug = $1';
    const params = [slug];
    if (excludeId) {
      query += ' AND id != $2';
      params.push(excludeId);
    }
    query += ')';
    const result = await pool.query(query, params);
    return result.rows[0].exists;
  }
}

export default Article;
