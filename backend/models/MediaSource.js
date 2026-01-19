import pool from '../config/database.js';

class MediaSource {
  static async findAll() {
    const result = await pool.query(
      'SELECT * FROM media_sources ORDER BY name ASC'
    );
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query(
      'SELECT * FROM media_sources WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async create(data) {
    const { name, url, bias_rating, logo_url } = data;
    const result = await pool.query(
      'INSERT INTO media_sources (name, url, bias_rating, logo_url) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, url, bias_rating, logo_url || null]
    );
    return result.rows[0];
  }

  static async update(id, data) {
    const { name, url, bias_rating, logo_url } = data;
    const updates = [];
    const params = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      params.push(name);
    }
    if (url !== undefined) {
      updates.push(`url = $${paramCount++}`);
      params.push(url);
    }
    if (bias_rating !== undefined) {
      updates.push(`bias_rating = $${paramCount++}`);
      params.push(bias_rating);
    }
    if (logo_url !== undefined) {
      updates.push(`logo_url = $${paramCount++}`);
      params.push(logo_url);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    params.push(id);
    const result = await pool.query(
      `UPDATE media_sources SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      params
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM media_sources WHERE id = $1 RETURNING id', [id]);
    return result.rows[0];
  }
}

export default MediaSource;
