import { pool } from '../config/db';
import { Bhajan, LyricParagraph } from '@bhagi-geet/shared';

export class BhajansService {
  static async getAllBhajans(search?: string, lang?: string): Promise<Bhajan[]> {
    let query = 'SELECT * FROM bhajans';
    const params: any[] = [];

    if (search) {
      query += ` WHERE title ILIKE $1`;
      params.push(`%${search}%`);
      if (lang && lang !== 'all') {
        query += ` AND language = $2`;
        params.push(lang);
      }
    } else if (lang && lang !== 'all') {
      query += ` WHERE language = $1`;
      params.push(lang);
    }

    query += ' ORDER BY created_at DESC';

    const { rows } = await pool.query(query, params);
    return rows;
  }

  static async getBhajanById(id: string): Promise<Bhajan | null> {
    const { rows } = await pool.query('SELECT * FROM bhajans WHERE id = $1', [id]);
    return rows[0] || null;
  }

  static async addBhajan(title: string, language: string, lyrics: LyricParagraph[], addedBy?: string): Promise<Bhajan> {
    const { rows } = await pool.query(
      `INSERT INTO bhajans (title, language, lyrics, added_by) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [title, language, JSON.stringify(lyrics), addedBy || null]
    );
    return rows[0];
  }
}
