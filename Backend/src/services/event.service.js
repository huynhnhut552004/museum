const { pool } = require('../config/postgres');
const redis = require('../config/redis');
const { deleteFromCloudinary } = require('../utils/cloudinaryHelper');
const slugify = require('../utils/slugify');
const { clearCachePattern } = require('../utils/redisHelper');
const createError = require('../utils/createError');
const { ERROR_MESSAGES } = require('../constants/message');
const { HTTP_STATUS } = require('../constants/httpStatus');

const EventService = {
    getEvents: async ({ type = 'all', page = 1, limit = 20 }) => {
        const cacheKey = `events:list:${type}:${page}:${limit}`;
        const cachedData = await redis.get(cacheKey);
        let events = [];
        let totalItems = 0;
        if (cachedData) {
            const cached = JSON.parse(cachedData);
            events = cached.data;
            totalItems = cached.totalItems;
        } else {
            const offset = (page - 1) * limit;
            const now = new Date().toISOString();
            let whereClause = '';
            let mainParams = [limit, offset];
            let countParams = [];
            if (type === 'happening') {
                whereClause = `WHERE start_time <= $3 AND end_time >= $3`;
                mainParams.push(now);
                countParams.push(now);
            } else if (type === 'upcoming') {
                whereClause = `WHERE start_time > $3`;
                mainParams.push(now);
                countParams.push(now);
            } else if (type === 'ended') {
                whereClause = `WHERE end_time < $3`;
                mainParams.push(now);
                countParams.push(now);
            }
            const query =
                `SELECT e.*,
                COALESCE(
                    (
                        SELECT COUNT(*)
                        FROM comments c
                        WHERE c.event_id = e.id
                    ),
                    0
                )::int AS comment_count
            FROM events e
            ${whereClause}
            ORDER BY start_time ${type === 'upcoming' ? 'ASC' : 'DESC'}
            LIMIT $1
            OFFSET $2`;
            let countQuery = `SELECT COUNT(*) FROM events e`;
            if (type === 'happening') {
                countQuery += ` WHERE start_time <= $1 AND end_time >= $1`;
            } else if (type === 'upcoming') {
                countQuery += ` WHERE start_time > $1`;
            } else if (type === 'ended') {
                countQuery += ` WHERE end_time < $1`;
            }
            const [dataRes, countRes] = await Promise.all([
                pool.query(query, mainParams),
                pool.query(countQuery, countParams)
            ]);
            totalItems = parseInt(countRes.rows[0].count, 10);
            events = dataRes.rows.map(ev => {
                const currentTime = new Date();
                let status = 'ended';
                if (new Date(ev.start_time) > currentTime) {
                    status = 'upcoming';
                } else if (new Date(ev.end_time) >= currentTime) {
                    status = 'happening';
                }
                return { ...ev, computed_status: status };
            });
            await redis.setex(cacheKey, 60, JSON.stringify({ data: events, totalItems }));
        }
        const eventsWithDynamicData = await Promise.all(
            events.map(async ev => {
                const viewerStr = await redis.get(`event_watchers:${ev.id}`);
                return { ...ev, viewer_count: viewerStr ? parseInt(viewerStr, 10) : 0 };
            })
        );
        return {
            data: eventsWithDynamicData,
            pagination: {
                page: parseInt(page, 10),
                limit: parseInt(limit, 10),
                totalItems,
                totalPages: Math.ceil(totalItems / limit)
            }
        };
    },

    searchEventsForAdmin: async ({ type = 'all', page = 1, limit = 20, keyword = '' }) => {
        const offset = (page - 1) * limit;
        const now = new Date().toISOString();
        const params = [];
        let paramIndex = 1;
        let conditions = [];
        if (type === 'happening') {
            conditions.push(`e.start_time <= $${paramIndex} AND e.end_time >= $${paramIndex}`);
            params.push(now);
            paramIndex++;
        } else if (type === 'upcoming') {
            conditions.push(`e.start_time > $${paramIndex}`);
            params.push(now);
            paramIndex++;
        } else if (type === 'ended') {
            conditions.push(`e.end_time < $${paramIndex}`);
            params.push(now);
            paramIndex++;
        }
        if (keyword) {
            conditions.push(`e.title ILIKE $${paramIndex} OR e.slug ILIKE $${paramIndex}`);
            params.push(`%${keyword}%`);
            paramIndex++;
        }
        let whereClause = '';
        if (conditions.length > 0) whereClause = ` WHERE ` + conditions.join(' AND ');
        const query =
            `SELECT e.*, 
        COALESCE((SELECT COUNT(*) FROM comments c WHERE c.event_id = e.id), 0)::int AS comment_count
      FROM events e
      ${whereClause}
      ORDER BY e.start_time ${type === 'upcoming' ? 'ASC' : 'DESC'} 
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        const countQuery =
            `SELECT COUNT(e.id) FROM events e
      ${whereClause}`;
        const queryParams = [...params, limit, offset];
        const countParams = [...params];
        const [dataRes, countRes] = await Promise.all([
            pool.query(query, queryParams),
            pool.query(countQuery, countParams)
        ]);
        const totalItems = parseInt(countRes.rows[0].count, 10);
        const events = dataRes.rows.map(ev => {
            const currentTime = new Date();
            let status = 'ended';
            if (new Date(ev.start_time) > currentTime) status = 'upcoming';
            else if (new Date(ev.end_time) >= currentTime) status = 'happening';
            return { ...ev, computed_status: status };
        });
        const eventsWithDynamicData = await Promise.all(events.map(async (ev) => {
            const viewerStr = await redis.get(`event_watchers:${ev.id}`);
            const viewer_count = viewerStr ? parseInt(viewerStr, 10) : 0;
            return { ...ev, viewer_count };
        }));
        return {
            data: eventsWithDynamicData,
            pagination: {
                page: parseInt(page, 10),
                limit: parseInt(limit, 10),
                totalItems,
                totalPages: Math.ceil(totalItems / limit)
            }
        };
    },

    getEventDetail: async (slug) => {
        const cacheKey = `events:${slug}`;
        const cachedData = await redis.get(cacheKey);
        if (cachedData) return JSON.parse(cachedData);
        const query = 'SELECT * FROM events WHERE slug = $1';
        const res = await pool.query(query, [slug]);
        if (res.rows.length === 0) throw createError(ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
        return res.rows[0];
    },

    createEvent: async (data) => {
        let slug = data.slug ? slugify(data.slug) : slugify(data.title);
        let slugArtwork = data.slugArtwork ? slugify(data.slugArtwork) : null;
        if (new Date(data.start_time) >= new Date(data.end_time)) throw createError(ERROR_MESSAGES.ERR_TIME, HTTP_STATUS.BAD_REQUEST)
        const query =
            `INSERT INTO events (
        title, slug, slug_artwork, description, content, 
        banner_url, public_id, 
        start_time, end_time
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;`;
        const values = [
            data.title,
            slug,
            slugArtwork,
            data.description,
            data.content,
            data.banner_url,
            data.public_id,
            data.start_time,
            data.end_time];
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
                if (oldEvent.public_id) oldImageToDelete = oldEvent.public_id;
            }
            let newSlug = oldEvent.slug;
            if (data.title && data.title !== oldEvent.title) newSlug = slugify(data.title);
            if (data.slug) newSlug = slugify(data.slug);
            let newSlugArtwork = null;
            if (data.slugArtwork) newSlugArtwork = slugify(data.slugArtwork);
            const query =
                `UPDATE events SET
                title = COALESCE($1, title),
                slug = $2, 
                slug_artwork= COALESCE($3, slug_artwork),
                description = COALESCE($4, description),
                content = COALESCE($5, content),
                start_time = COALESCE($6, start_time),
                end_time = COALESCE($7, end_time),
                banner_url = $8, 
                public_id = $9,
                updated_at = NOW()
            WHERE id = $10 RETURNING *;`;
            const res = await client.query(query, [
                data.title,
                newSlug,
                newSlugArtwork,
                data.description,
                data.content,
                data.start_time,
                data.end_time,
                newBanner,
                newPublicId,
                id]);
            await client.query('COMMIT');
            await clearCachePattern('events:list:*');
            if (oldEvent.slug) await redis.del(`events:detail:${oldEvent.slug}`);
            if (newSlug !== oldEvent.slug) await redis.del(`events:detail:${newSlug}`);
            if (oldImageToDelete) deleteFromCloudinary(oldImageToDelete, 'image').catch(console.error);
            return res.rows[0];
        } catch (e) {
            await client.query('ROLLBACK');
            if (data.file && data.file.filename) deleteFromCloudinary(data.file.filename, 'image').catch(() => { });
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