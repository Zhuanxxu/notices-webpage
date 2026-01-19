import pool from '../config/database.js';

class ArticleCoverage {
  static async findByArticleId(articleId) {
    const result = await pool.query(
      `SELECT 
        ac.*,
        ms.name as media_name,
        ms.url as media_url,
        ms.bias_rating as media_bias,
        ms.logo_url as media_logo
      FROM article_coverages ac
      LEFT JOIN media_sources ms ON ac.media_source_id = ms.id
      WHERE ac.article_id = $1
      ORDER BY ac.created_at DESC`,
      [articleId]
    );
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query(
      `SELECT 
        ac.*,
        ms.name as media_name,
        ms.url as media_url,
        ms.bias_rating as media_bias,
        ms.logo_url as media_logo
      FROM article_coverages ac
      LEFT JOIN media_sources ms ON ac.media_source_id = ms.id
      WHERE ac.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async create(data) {
    const { article_id, media_source_id, coverage_url, coverage_title, snippet } = data;
    const result = await pool.query(
      `INSERT INTO article_coverages (article_id, media_source_id, coverage_url, coverage_title, snippet)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [article_id, media_source_id, coverage_url, coverage_title, snippet || null]
    );
    return result.rows[0];
  }

  static async update(id, data) {
    const { media_source_id, coverage_url, coverage_title, snippet } = data;
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (media_source_id !== undefined) {
      updates.push(`media_source_id = $${paramCount++}`);
      values.push(media_source_id);
    }
    if (coverage_url !== undefined) {
      updates.push(`coverage_url = $${paramCount++}`);
      values.push(coverage_url);
    }
    if (coverage_title !== undefined) {
      updates.push(`coverage_title = $${paramCount++}`);
      values.push(coverage_title);
    }
    if (snippet !== undefined) {
      updates.push(`snippet = $${paramCount++}`);
      values.push(snippet || null);
    }

    if (updates.length === 0) {
      return await this.findById(id);
    }

    values.push(id);
    const result = await pool.query(
      `UPDATE article_coverages 
       SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM article_coverages WHERE id = $1 RETURNING id', [id]);
    return result.rows[0];
  }
}

export default ArticleCoverage;
