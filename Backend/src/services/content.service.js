const { pool } = require('../config/postgres');
const redis = require('../config/redis');
const { deleteFromCloudinary } = require('../utils/cloudinaryHelper');

const ContentService = {
  getPageBlocks: async (page, lang = 'vi') => {
    const cacheKey = `page:${page}:${lang}`;
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
    const query = `
      SELECT id, block_type, content, display_order
      FROM web_contents 
      WHERE page = $1 AND language = $2 AND is_hidden = FALSE
      ORDER BY display_order ASC
    `;
    const { rows } = await pool.query(query, [page, lang]);
    await redis.set(cacheKey, JSON.stringify(rows), 'EX', 3600);
    return rows;
  },

  saveBlock: async ({ id, page, block_type, language, data, file, display_order }) => {
    const client = await pool.connect();
    let oldImageToDelete = null; 
    try {
      await client.query('BEGIN');
      const isUpdate = id && id !== 'new';
      let finalContent = { ...data };
      if (isUpdate) {
        const oldRes = await client.query('SELECT content FROM web_contents WHERE id=$1 FOR UPDATE', [id]);
        const oldData = oldRes.rows[0]?.content || {};
        if (file) {
          if (oldData.public_id) {
             oldImageToDelete = { id: oldData.public_id, type: oldData.media_type || 'image' };
          }
          finalContent.media_url = file.path;
          finalContent.public_id = file.filename;
          finalContent.media_type = file.mimetype.startsWith('video') ? 'video' : 'image';
        } else {
          finalContent.media_url = oldData.media_url;
          finalContent.public_id = oldData.public_id;
          finalContent.media_type = oldData.media_type;
        }
      } else {
        if (file) {
          finalContent.media_url = file.path;
          finalContent.public_id = file.filename;
          finalContent.media_type = file.mimetype.startsWith('video') ? 'video' : 'image';
        }
      }
      let res;
      if (isUpdate) {
        const query = `
          UPDATE web_contents 
          SET 
            content = $1, 
            display_order = COALESCE($2, display_order), 
            updated_at = NOW() 
          WHERE id = $3
          RETURNING *;
        `;
        res = await client.query(query, [finalContent, display_order, id]);
      } else {
        let finalOrder = display_order;
        if (!finalOrder) {
            const orderRes = await client.query(
                `SELECT COALESCE(MAX(display_order), 0) + 1 as next_order FROM web_contents WHERE page = $1`, 
                [page]
            );
            finalOrder = orderRes.rows[0].next_order;
        }
        const query = `
          INSERT INTO web_contents (page, block_type, language, content, display_order, updated_at)
          VALUES ($1, $2, $3, $4, $5, NOW())
          RETURNING *;
        `;
        res = await client.query(query, [page, block_type, language, finalContent, finalOrder]);
      }
      await redis.del(`page:${page}:${language}`);
      await client.query('COMMIT');
      if (oldImageToDelete) {
        deleteFromCloudinary(oldImageToDelete.id, oldImageToDelete.type).catch(err => 
            console.error('Lỗi xóa ảnh cũ Cloudinary:', err)
        );
      }
      return { message: 'Saved successfully', data: res.rows[0] };
    } catch (error) {
      await client.query('ROLLBACK'); 
      if (file && file.filename) {
         deleteFromCloudinary(file.filename, file.mimetype.startsWith('video') ? 'video' : 'image').catch(() => {});
      }
      throw error;
    } finally {
      client.release();
    }
},

  deleteBlock: async (id) => {
    const client = await pool.connect();
    try {
        const res = await client.query('SELECT page, language, content FROM web_contents WHERE id = $1', [id]);
        const row = res.rows[0];
        if (row) {
            await client.query('DELETE FROM web_contents WHERE id = $1', [id]);
            if (row.content.public_id) {
                await deleteFromCloudinary(row.content.public_id, row.content.media_type);
            }
            await redis.del(`page:${row.page}:${row.language}`);
        }
        return true;
    } finally {
        client.release();
    }
  },

  reorderBlocks: async (page, language, orderedIds) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        for (let i = 0; i < orderedIds.length; i++) {
            await client.query('UPDATE web_contents SET display_order = $1 WHERE id = $2', [i, orderedIds[i]]);
        }
        await client.query('COMMIT');
        await redis.del(`page:${page}:${language}`);
        return true;
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
  }
};
module.exports = ContentService;