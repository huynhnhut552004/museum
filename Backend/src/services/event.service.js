const { pool } = require('../config/postgres');
const redis = require('../config/redis');
const { deleteFromCloudinary } = require('../utils/cloudinaryHelper');
const slugify = require('../utils/slugify');
const { clearCachePattern } = require('../utils/redisHelper');
const createError = require('../utils/createError');
const { ERROR_MESSAGES } = require('../constants/message');
const {HTTP_STATUS} = require('../constants/httpStatus');

const EventService = {
    getEvents: async ({ type = 'all', page = 1, limit = 10 }) => {
        const cacheKey = `events:list:${type}:${page}:${limit}`;
        const cachedData = await redis.get(cacheKey);
        if (cachedData) return JSON.parse(cachedData);
        const offset = (page - 1) * limit;
        const now = new Date().toISOString();
        const params = [limit, offset];
        let whereClause = '';
        if (type === 'happening') {
            whereClause = `WHERE start_time <= $3 AND end_time >= $3`;
            params.push(now);
        } else if (type === 'upcoming') {
            whereClause = `WHERE start_time > $3`;
            params.push(now);
        } else if (type === 'ended') {
            whereClause = `WHERE end_time < $3`;
            params.push(now);
        }
        const query = `
      SELECT *
      FROM events
      ${whereClause}
      ORDER BY start_time ${type === 'upcoming' ? 'ASC' : 'DESC'} 
      LIMIT $1 OFFSET $2
    `;
        const res = await pool.query(query, params);
        const events = res.rows.map(ev => {
            const currentTime = new Date();
            let status = 'ended';
            if (new Date(ev.start_time) > currentTime) status = 'upcoming';
            else if (new Date(ev.end_time) >= currentTime) status = 'happening';
            return { ...ev, computed_status: status };
        });
        await redis.setex(cacheKey, 60, JSON.stringify(events));
        return events;
    },

    getEventDetail: async (slug) => {
        const query = 'SELECT * FROM events WHERE slug = $1';
        const res = await pool.query(query, [slug]);
        if(res.rows.length === 0) throw createError(ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
        return res.rows[0];
    },

    createEvent: async (data) => {
        let slug = data.slug ? slugify(data.slug) : slugify(data.title);
        if (new Date(data.start_time) >= new Date(data.end_time)) throw createError(ERROR_MESSAGES.ERR_TIME, HTTP_STATUS.BAD_REQUEST)
        const query = `
      INSERT INTO events (
        title, slug, description, content, 
        banner_url, public_id, 
        start_time, end_time
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
        const values = [
            data.title,
            slug,
            data.description,
            data.content,
            data.banner_url,
            data.public_id,
            data.start_time,
            data.end_time
        ];
        const res = await pool.query(query, values);
        await clearCachePattern('events:list:*');
        return res.rows[0];
    },

    updateEvent: async (id, data) => {
        const client = await pool.connect();
        let oldImageToDelete = null;
        try {
            await client.query('BEGIN');
            const oldRes = await client.query('SELECT * FROM events WHERE id = $1 FOR UPDATE', [id]);
            const oldEvent = oldRes.rows[0];
            if (!oldEvent) throw createError(ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
            let newBanner = oldEvent.banner_url;
            let newPublicId = oldEvent.public_id;

            if (data.file) {
                newBanner = data.file.path;
                newPublicId = data.file.filename;
                if (oldEvent.public_id) {
                    oldImageToDelete = oldEvent.public_id;
                }
            }
            let newSlug = oldEvent.slug;
            if (data.title && data.title !== oldEvent.title) {
                newSlug = slugify(data.title);
            }
            if (data.slug) {
                newSlug = slugify(data.slug);
            }
            const query = `
            UPDATE events SET
                title = COALESCE($1, title),
                slug = $2, 
                description = COALESCE($3, description),
                content = COALESCE($4, content),
                start_time = COALESCE($5, start_time),
                end_time = COALESCE($6, end_time),
                banner_url = $7, 
                public_id = $8,
                updated_at = NOW()
            WHERE id = $9 RETURNING *;
        `;
            const res = await client.query(query, [
                data.title,
                newSlug,
                data.description,
                data.content,
                data.start_time,
                data.end_time,
                newBanner,
                newPublicId,
                id
            ]);
            await client.query('COMMIT');
            await clearCachePattern('events:list:*');
            if (oldEvent.slug) await redis.del(`events:detail:${oldEvent.slug}`);
            if (newSlug !== oldEvent.slug) await redis.del(`events:detail:${newSlug}`);
            if (oldImageToDelete) {
                deleteFromCloudinary(oldImageToDelete, 'image').catch(console.error);
            }
            return res.rows[0];
        } catch (e) {
            await client.query('ROLLBACK');
            if (data.file && data.file.filename) {
                deleteFromCloudinary(data.file.filename, 'image').catch(() => { });
            }
            throw e;
        } finally {
            client.release();
        }
    },

    deleteEvent: async (id) => {
        const res = await pool.query('SELECT public_id, slug FROM events WHERE id = $1', [id]);
        if (res.rows[0]) {
            await pool.query('DELETE FROM events WHERE id = $1', [id]);
            if (res.rows[0].public_id) await deleteFromCloudinary(res.rows[0].public_id, 'image');
            await clearCachePattern('events:list:*');
            await redis.del(`events:detail:${res.rows[0].slug}`);
        }
        return true;
    },
};

module.exports = EventService;