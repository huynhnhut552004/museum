const { pool } = require('../config/postgres');
const redis = require('../config/redis');
const slugify = require('../utils/slugify');
const { clearCachePattern } = require('../utils/redisHelper');
const createError = require('../utils/createError');
const { CATEROGY_MESSAGES } = require('../constants/message');
const { HTTP_STATUS } = require('../constants/httpStatus');
const CategoryDetail = require('../models/mongo/CategoryDetail');
const mongoose = require('mongoose');

const CategoryService = {
  createCategory: async ({ name, layout_type, three_d_config }) => {
    if (!['classic', 'digital', 'both'].includes(layout_type)) {
      throw createError(CATEROGY_MESSAGES.INVALID_LAYOUT, HTTP_STATUS.BAD_REQUEST);
    }
    const client = await pool.connect();
    const mongoSession = await mongoose.startSession();
    try {
      await client.query('BEGIN');
      mongoSession.startTransaction();
      const slug = slugify(name);
      const check = await client.query('SELECT id FROM categories WHERE slug = $1', [slug]);
      if (check.rows.length > 0) throw createError(CATEROGY_MESSAGES.CONFLICT, HTTP_STATUS.CONFLICT);
      const query = `
            INSERT INTO categories (name, slug, layout_type) 
            VALUES ($1, $2, $3) 
            RETURNING *;
        `;
      const result = await client.query(query, [name, slug, layout_type]);
      const newCategoryId = result.rows[0].id;
      await CategoryDetail.create(
        [{
          category_id: newCategoryId.toString(),
          three_d_config: three_d_config || {},
        }],
        { session: mongoSession }
      );
      await client.query('COMMIT');
      await mongoSession.commitTransaction();
      await clearCachePattern('categories:*');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      await mongoSession.abortTransaction();
      throw error;
    } finally {
      client.release();
      mongoSession.endSession();
    }
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
    const rows = res.rows;
    let result = rows;
    if (layout === 'digital' && rows.length > 0) {
      const ids = rows.map(c => c.id.toString());
      const details = await CategoryDetail.find({
        category_id: { $in: ids }
      }).lean();
      const detailMap = new Map(
        details.map(d => [d.category_id, d.three_d_config])
      );
      result = rows.map(cat => ({
        ...cat,
        three_d_config: detailMap.get(cat.id.toString()) || null
      }));
    }
    await redis.set(cacheKey, JSON.stringify(result), 'EX', 3600);
    return result;
  },

  getCategoryBySlug: async (slug) => {
    const cacheKey = `categories:detail:${slug}`;
    const cachedData = await redis.get(cacheKey);
    if (cachedData) return JSON.parse(cachedData);
      const res = await pool.query('SELECT * FROM categories WHERE slug = $1', [slug]);
      const category = res.rows[0];
      if (!category) return null;
      let result = { ...category, three_d_config: null };
      if (category.layout_type === 'digital' || category.layout_type === 'both') {
        const mongoDetail = await CategoryDetail.findOne({
          category_id: category.id.toString()
        }).lean();
        if (mongoDetail) {
          result.three_d_config = mongoDetail.three_d_config;
        }
      }
      await redis.set(cacheKey, JSON.stringify(result), 'EX', 3600);
      return result;
  },


  updateCategory: async (id, { name, layout_type }) => {
    let slugUpdate = null;
    if (name) slugUpdate = slugify(name);
    const query = `
      UPDATE categories 
      SET 
        name = COALESCE($1, name),
        slug = COALESCE($2, slug),
        layout_type = COALESCE($3, layout_type)
      WHERE id = $4
      RETURNING *
    `;
    const result = await pool.query(query, [name, slugUpdate, layout_type, id]);
    if (result.rows.length === 0) throw createError(CATEROGY_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    await clearCachePattern('categories:*');
    return result.rows[0];
  },

  deleteCategory: async (id) => {
    const client = await pool.connect();
    const mongoSession = await mongoose.startSession();
    try {
      await client.query('BEGIN');
      mongoSession.startTransaction();
      const oldCat = await client.query('SELECT slug FROM categories WHERE id = $1', [id]);
      const category = oldCat.rows[0];
      if (!category) {
        await client.query('COMMIT');
        return false;
      }
      await client.query('DELETE FROM categories WHERE id = $1', [id]);
      await CategoryDetail.deleteOne(
        { category_id: id.toString() },
        { session: mongoSession }
      );
      await client.query('COMMIT');
      await mongoSession.commitTransaction();
      await Promise.all([
        clearCachePattern('categories:layout:*'),
        redis.del(`categories:detail:${category.slug}`)
      ]);
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      await mongoSession.abortTransaction();
      throw error;
    } finally {
      client.release();
      mongoSession.endSession();
    }
  },

  update3DConfig: async (categoryId, update3D) => {
    const res = await pool.query('SELECT slug FROM categories WHERE id = $1', [categoryId]);
    const category = res.rows[0];
    if (!category) {
      throw createError(CATEROGY_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }
    const update = await CategoryDetail.findOneAndUpdate(
      { category_id: categoryId.toString() },
      {
        $set: {
          ...update3D,
          updated_at: Date.now()
        }
      },
      { new: true, upsert: true, runValidators: true }
    ).lean();
    await Promise.all([
      redis.del(`categories:detail:${category.slug}`),
      clearCachePattern('categories:layout:*')
    ]);
    return update.three_d_config;
  }
}

module.exports = CategoryService;