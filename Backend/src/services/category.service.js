const { pool } = require('../config/postgres');
const redis = require('../config/redis'); 
const slugify = require('../utils/slugify');
const { clearCachePattern } = require('../utils/redisHelper'); 
const createError = require ('../utils/createError');
const { CATEROGY_MESSAGES } = require('../constants/message');
const HTTP_STATUS = require('../constants/httpStatus');

const CategoryService = {
  createCategory: async ({ name, layout_type }) => {
    if (!['classic', 'digital', 'both'].includes(layout_type)) throw createError(CATEROGY_MESSAGES.INVALID_LAYOUT, HTTP_STATUS.BAD_REQUEST);
    const slug = slugify(name);
    const check = await pool.query('SELECT id FROM categories WHERE slug = $1', [slug]);
    if (check.rows.length > 0) throw createError(CATEROGY_MESSAGES.CONFLICT, HTTP_STATUS.CONFLICT);
    const query = `
      INSERT INTO categories (name, slug, layout_type) 
      VALUES ($1, $2, $3) 
      RETURNING *
    `;
    const result = await pool.query(query, [name, slug, layout_type]);
    await clearCachePattern('categories:*');
    return result.rows[0];
  },

  getAllCategories: async () => {
    const query = `SELECT * FROM categories ORDER BY created_at DESC`;
    const result = await pool.query(query);
    return result.rows;
  },
  
  getCategoriesByLayout: async (layout) => {
    const cacheKey = `categories:layout:${layout}`;
    const cachedData = await redis.get(cacheKey);
    if (cachedData) return JSON.parse(cachedData);
    const query = `
        SELECT * FROM categories 
        WHERE layout_type = $1 OR layout_type = 'both'
        ORDER BY name ASC
    `;
    const res = await pool.query(query, [layout]);
    await redis.set(cacheKey, JSON.stringify(res.rows), 'EX', 3600);
    return res.rows;
  },

  getCategoryBySlug: async (slug) => {
    const cacheKey = `categories:detail:${slug}`;
    const cachedData = await redis.get(cacheKey);
    if (cachedData) return JSON.parse(cachedData);
    const res = await pool.query('SELECT * FROM categories WHERE slug = $1', [slug]);
    const category = res.rows[0];
    if (category) {
        await redis.set(cacheKey, JSON.stringify(category), 'EX', 3600);
    }
    return category;
  },

  updateCategory: async (id, { name, layout_type }) => {
    let slugUpdate = null;
    if (name) slugUpdate = slugify(name);
    const query = `
      UPDATE categories 
      SET 
        name = COALESCE($1, name),
        slug = COALESCE($2, slug),
        layout_type = COALESCE($3, layout_type),
      WHERE id = $4
      RETURNING *
    `;
    const result = await pool.query(query, [name, slugUpdate, layout_type, id]);
    if (result.rows.length === 0) throw createError(CATEROGY_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    await clearCachePattern('categories:*');
    return result.rows[0];
  },
  
  deleteCategory: async (id) => {
    const oldCat = await pool.query('SELECT slug FROM categories WHERE id = $1', [id]);
    const slugCat= oldCat.rows[0];
    if(slugCat){
      await pool.query('DELETE FROM categories WHERE id = $1', [id]);
      await clearCachePattern('categories:layout:*');
      await redis.del(`categories:detail:${slugCat.slug}`);
    }
    return true;
  }
};

module.exports = CategoryService;