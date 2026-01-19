import pool from '../config/database.js';

class ArticleClassification {
  static async findByArticleId(articleId) {
    const result = await pool.query(
      'SELECT * FROM article_classifications WHERE article_id = $1',
      [articleId]
    );
    return result.rows[0];
  }

  static async createOrUpdate(articleId, politicalBias) {
    // Try to update first
    const updateResult = await pool.query(
      `UPDATE article_classifications 
       SET political_bias = $1, updated_at = CURRENT_TIMESTAMP
       WHERE article_id = $2
       RETURNING *`,
      [politicalBias, articleId]
    );

    if (updateResult.rows.length > 0) {
      return updateResult.rows[0];
    }

    // If no row exists, create it
    const insertResult = await pool.query(
      `INSERT INTO article_classifications (article_id, political_bias)
       VALUES ($1, $2)
       RETURNING *`,
      [articleId, politicalBias]
    );
    return insertResult.rows[0];
  }

  static async delete(articleId) {
    const result = await pool.query(
      'DELETE FROM article_classifications WHERE article_id = $1 RETURNING id',
      [articleId]
    );
    return result.rows[0];
  }
}

export default ArticleClassification;
