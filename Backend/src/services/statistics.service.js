const { pool } = require('../config/postgres');

const StatisticsService = {
  artwork: {
    getArtworkOverview: async () => {
      const query =
        `SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE layout_type = 'classic') AS classic,
        COUNT(*) FILTER (WHERE layout_type = 'digital') AS digital,
        COUNT(*) FILTER (WHERE layout_type = 'both') AS both,
        COUNT(*) FILTER (WHERE artist_id IS NOT NULL) AS user_artworks,
        COUNT(*) FILTER (WHERE artist_id IS NULL) AS non_user_artworks
      FROM artworks`;
      const { rows } = await pool.query(query);
      const result = rows[0];
      return {
        total: parseInt(result.total, 10),
        classic: parseInt(result.classic, 10),
        digital: parseInt(result.digital, 10),
        both: parseInt(result.both, 10),
        userArtworks: parseInt(result.user_artworks, 10),
        nonUserArtworks: parseInt(result.non_user_artworks, 10)
      };
    },

    getArtworkGrowth: async (period = 'month') => {
      const validPeriods = ['week', 'month', 'year'];
      if (!validPeriods.includes(period)) throw new Error('Lỗi định dạng!');
      let query;
      if (period === 'week') {
        query =
          `WITH 
          time_series AS (SELECT generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, INTERVAL '1 day')::date AS period)
        SELECT TO_CHAR(time_series.period, 'YYYY-MM-DD') AS date, COUNT(artworks.id) AS count
        FROM time_series
        LEFT JOIN artworks
          ON (artworks.created_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date = time_series.period
        GROUP BY time_series.period
        ORDER BY time_series.period ASC`;
      }
      if (period === 'month') {
        query =
          `WITH time_series AS (
        SELECT generate_series(
          DATE_TRUNC('month', CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh')::date, CURRENT_DATE, INTERVAL '1 day')::date AS period)
        SELECT TO_CHAR(time_series.period, 'YYYY-MM-DD') AS date, COUNT(artworks.id) AS count FROM time_series
        LEFT JOIN artworks
          ON ( artworks.created_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date = time_series.period
        GROUP BY time_series.period
        ORDER BY time_series.period ASC`;
      }
      if (period === 'year') {
        query =
          `WITH time_series AS (
        SELECT generate_series(
          DATE_TRUNC('year', CURRENT_DATE)::date, DATE_TRUNC('month', CURRENT_DATE)::date, INTERVAL '1 month')::date AS period)
        SELECT TO_CHAR(time_series.period, 'YYYY-MM') AS date, COUNT(artworks.id) AS count
        FROM time_series
        LEFT JOIN artworks
          ON TO_CHAR(artworks.created_at AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYY-MM') = TO_CHAR(time_series.period, 'YYYY-MM')
        GROUP BY time_series.period
        ORDER BY time_series.period ASC`;
      }
      const { rows } = await pool.query(query);
      return { period, items: rows.map(row => ({ date: row.date, count: parseInt(row.count, 10) })) };
    },

    getArtworkRanking: async (period = 'month') => {
      const validPeriods = ['week', 'month', 'year'];
      if (!validPeriods.includes(period)) throw new Error('Lỗi định dạng!');
      const query =
        `WITH period_bounds AS (
      SELECT
        CASE
          WHEN $1 = 'week' THEN
            (
              (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh')::date - 6)::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh'
          WHEN $1 = 'month' THEN
            DATE_TRUNC('month', CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh') AT TIME ZONE 'Asia/Ho_Chi_Minh'
          WHEN $1 = 'year' THEN
            DATE_TRUNC('year', CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh') AT TIME ZONE 'Asia/Ho_Chi_Minh'
        END AS current_start,
        CASE
          WHEN $1 = 'week' THEN
            (
              (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh')::date + 1)::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh'
          WHEN $1 = 'month' THEN
            (
              (
                CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh')::date + 1)::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh'
          WHEN $1 = 'year' THEN
            (
              (
                CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh')::date + 1)::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh'
        END AS current_end
    ),
    bounds AS (
      SELECT current_start, current_end,
        CASE
          WHEN $1 = 'week'
            THEN current_start - INTERVAL '7 days'
          WHEN $1 = 'month'
            THEN current_start - INTERVAL '1 month'
          WHEN $1 = 'year'
            THEN current_start - INTERVAL '1 year'
        END AS previous_start,
        CASE
          WHEN $1 = 'week'
            THEN current_end - INTERVAL '7 days'
          WHEN $1 = 'month'
            THEN current_start - INTERVAL '1 month'
                 + (current_end - current_start)
          WHEN $1 = 'year'
            THEN current_start - INTERVAL '1 year'
                 + (current_end - current_start)
        END AS previous_end
      FROM period_bounds
    ),
    current_likes AS (
      SELECT artwork_id, COUNT(*) AS likes
      FROM likes, bounds
      WHERE artwork_id IS NOT NULL AND created_at >= current_start AND created_at < current_end
      GROUP BY artwork_id
    ),
    current_comments AS (
      SELECT artwork_id, COUNT(*) AS comments
      FROM comments, bounds
      WHERE artwork_id IS NOT NULL AND parent_id IS NULL AND created_at >= current_start AND created_at < current_end
      GROUP BY artwork_id
    ),
    previous_likes AS (
      SELECT artwork_id, COUNT(*) AS likes
      FROM likes, bounds
      WHERE artwork_id IS NOT NULL AND created_at >= previous_start AND created_at < previous_end
      GROUP BY artwork_id
    ),
    previous_comments AS (
      SELECT artwork_id, COUNT(*) AS comments
      FROM comments, bounds
      WHERE artwork_id IS NOT NULL AND parent_id IS NULL AND created_at >= previous_start AND created_at < previous_end
      GROUP BY artwork_id
    ),
    current_scores AS (
      SELECT
        COALESCE(l.artwork_id, c.artwork_id) AS artwork_id,
        COALESCE(l.likes, 0) AS likes,
        COALESCE(c.comments, 0) AS comments,
        COALESCE(l.likes, 0) + COALESCE(c.comments, 0) AS score
      FROM current_likes l
      FULL OUTER JOIN current_comments c
        ON l.artwork_id = c.artwork_id
    ),
    previous_scores AS (
      SELECT
        COALESCE(l.artwork_id, c.artwork_id) AS artwork_id,
        COALESCE(l.likes, 0) AS likes,
        COALESCE(c.comments, 0) AS comments,
        COALESCE(l.likes, 0) + COALESCE(c.comments, 0) AS score
      FROM previous_likes l
      FULL OUTER JOIN previous_comments c
        ON l.artwork_id = c.artwork_id
    ),
    current_ranking AS (
      SELECT artwork_id, likes, comments, score,
        ROW_NUMBER() OVER (ORDER BY score DESC, likes DESC, comments DESC, artwork_id) AS rank
      FROM current_scores
      WHERE score > 0
    ),
    previous_ranking AS (
      SELECT artwork_id,
        ROW_NUMBER() OVER (ORDER BY score DESC, likes DESC, comments DESC, artwork_id) AS rank
      FROM previous_scores
      WHERE score > 0
    )
    SELECT
      current_ranking.artwork_id,
      artworks.slug,
      artworks.title,
      artworks.title_en,
      artworks.artist_display_name,
      artworks.media_url,
      artworks.media_type,
      artworks.layout_type,
  current_ranking.rank,
  previous_ranking.rank AS previous_rank,
  current_ranking.likes,
  current_ranking.comments,
  current_ranking.score
FROM current_ranking
INNER JOIN artworks ON artworks.id = current_ranking.artwork_id
LEFT JOIN previous_ranking ON previous_ranking.artwork_id = current_ranking.artwork_id
WHERE current_ranking.rank <= 10 AND artworks.status = 'published'
ORDER BY current_ranking.rank ASC`;
      const { rows } = await pool.query(query, [period]);
      return {
        period,
        items: rows.map(row => {
          const rank = parseInt(row.rank, 10);
          const previousRank = row.previous_rank ? parseInt(row.previous_rank, 10) : null;
          return {
            rank, previousRank, movement: previousRank !== null ? previousRank - rank : null,
            isNew: previousRank === null,
            artworkId: row.artwork_id,
            slug: row.slug,
            title: row.title,
            titleEn: row.title_en,
            artistDisplayName: row.artist_display_name,
            mediaUrl: row.media_url,
            mediaType: row.media_type,
            layoutType: row.layout_type,
            likes: parseInt(row.likes, 10),
            comments: parseInt(row.comments, 10),
            score: parseInt(row.score, 10)
          };
        })
      };
    }
  },

  event: {
    getEventOverview: async () => {
      const query =
        `SELECT
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE start_time > CURRENT_TIMESTAMP) AS upcoming,
      COUNT(*) FILTER (WHERE start_time <= CURRENT_TIMESTAMP AND end_time >= CURRENT_TIMESTAMP) AS happening,
      COUNT(*) FILTER (WHERE end_time < CURRENT_TIMESTAMP) AS ended
    FROM events`;
      const { rows } = await pool.query(query);
      const result = rows[0];
      return {
        total: parseInt(result.total, 10),
        upcoming: parseInt(result.upcoming, 10),
        happening: parseInt(result.happening, 10),
        ended: parseInt(result.ended, 10)
      };
    },

    getEventGrowth: async (period = 'month') => {
      const validPeriods = ['week', 'month', 'year'];
      if (!validPeriods.includes(period)) throw new Error('Lỗi định dạng!');
      let query;
      if (period === 'week') {
        query =
          `WITH time_series AS (
      SELECT generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, INTERVAL '1 day')::date AS period)
      SELECT TO_CHAR(time_series.period, 'YYYY-MM-DD') AS date,COUNT(events.id) AS count
      FROM time_series
      LEFT JOIN events
        ON (events.created_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date = time_series.period
      GROUP BY time_series.period
      ORDER BY time_series.period ASC`;
      }
      if (period === 'month') {
        query =
          `WITH time_series AS (
      SELECT generate_series(
        DATE_TRUNC('month', CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh')::date, CURRENT_DATE, INTERVAL '1 day')::date AS period)
      SELECT TO_CHAR(time_series.period, 'YYYY-MM-DD') AS date, COUNT(events.id) AS count
      FROM time_series
      LEFT JOIN events
        ON (events.created_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date = time_series.period
      GROUP BY time_series.period
      ORDER BY time_series.period ASC`;
      }
      if (period === 'year') {
        query =
          `WITH time_series AS (
      SELECT generate_series(
        DATE_TRUNC('year', CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh')::date,
        DATE_TRUNC('month', CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh')::date,
        INTERVAL '1 month')::date AS period)
      SELECT TO_CHAR(time_series.period, 'YYYY-MM') AS date, COUNT(events.id) AS count
      FROM time_series
      LEFT JOIN events
        ON TO_CHAR(events.created_at AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYY-MM') = TO_CHAR(time_series.period, 'YYYY-MM')
      GROUP BY time_series.period
      ORDER BY time_series.period ASC`;
      }
      const { rows } = await pool.query(query);
      return { period, items: rows.map(row => ({ date: row.date, count: parseInt(row.count, 10) })) };
    },

    getEventRanking: async (period = 'month') => {
      const validPeriods = ['week', 'month', 'year'];
      if (!validPeriods.includes(period)) throw new Error('Lỗi định dạng!');
      const query =
        `WITH period_bounds AS (
      SELECT
        CASE
          WHEN $1 = 'week' THEN
            (
              (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh')::date - 6)::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh'
          WHEN $1 = 'month' THEN
            DATE_TRUNC('month', CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh') AT TIME ZONE 'Asia/Ho_Chi_Minh'
          WHEN $1 = 'year' THEN
            DATE_TRUNC('year', CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh') AT TIME ZONE 'Asia/Ho_Chi_Minh'
        END AS current_start,
        CASE
          WHEN $1 = 'week' THEN
            (
              (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh')::date + 1)::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh'
          WHEN $1 = 'month' THEN
            (
              (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh')::date + 1)::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh'
          WHEN $1 = 'year' THEN
            (
              (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh')::date + 1)::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh'
        END AS current_end
    ),
    bounds AS (
      SELECT current_start, current_end,
        CASE
          WHEN $1 = 'week' THEN current_start - INTERVAL '7 days'
          WHEN $1 = 'month' THEN current_start - INTERVAL '1 month'
          WHEN $1 = 'year' THEN current_start - INTERVAL '1 year'
        END AS previous_start,
        CASE
          WHEN $1 = 'week' THEN current_end - INTERVAL '7 days'
          WHEN $1 = 'month' THEN current_start - INTERVAL '1 month' + (current_end - current_start)
          WHEN $1 = 'year' THEN current_start - INTERVAL '1 year' + (current_end - current_start)
        END AS previous_end
      FROM period_bounds
    ),
    current_likes AS (
      SELECT event_id, COUNT(*) AS likes
      FROM likes, bounds
      WHERE event_id IS NOT NULL AND created_at >= current_start AND created_at < current_end
      GROUP BY event_id
    ),
    current_comments AS (
      SELECT event_id, COUNT(*) AS comments
      FROM comments, bounds
      WHERE event_id IS NOT NULL AND parent_id IS NULL AND created_at >= current_start AND created_at < current_end
      GROUP BY event_id
    ),
    previous_likes AS (
      SELECT event_id, COUNT(*) AS likes
      FROM likes, bounds
      WHERE event_id IS NOT NULL AND created_at >= previous_start AND created_at < previous_end
      GROUP BY event_id
    ),
    previous_comments AS (
      SELECT event_id, COUNT(*) AS comments
      FROM comments, bounds
      WHERE event_id IS NOT NULL AND parent_id IS NULL AND created_at >= previous_start AND created_at < previous_end
      GROUP BY event_id
    ),
    current_scores AS (
      SELECT
        COALESCE(l.event_id, c.event_id) AS event_id,
        COALESCE(l.likes, 0) AS likes,
        COALESCE(c.comments, 0) AS comments,
        COALESCE(l.likes, 0) + COALESCE(c.comments, 0) AS score
      FROM current_likes l
      FULL OUTER JOIN current_comments c ON l.event_id = c.event_id
    ),
    previous_scores AS (
      SELECT
        COALESCE(l.event_id, c.event_id) AS event_id,
        COALESCE(l.likes, 0) AS likes,
        COALESCE(c.comments, 0) AS comments,
        COALESCE(l.likes, 0) + COALESCE(c.comments, 0) AS score
      FROM previous_likes l
      FULL OUTER JOIN previous_comments c ON l.event_id = c.event_id
    ),
    current_ranking AS (
      SELECT event_id, likes, comments, score,
        ROW_NUMBER() OVER (ORDER BY score DESC, likes DESC, comments DESC, event_id) AS rank
      FROM current_scores
      WHERE score > 0
    ),
    previous_ranking AS (
      SELECT event_id,
        ROW_NUMBER() OVER (ORDER BY score DESC, likes DESC, comments DESC, event_id) AS rank
      FROM previous_scores
      WHERE score > 0
    )
    SELECT
      current_ranking.event_id,
      events.slug,
      events.title,
      events.banner_url,
      events.start_time,
      events.end_time,
      current_ranking.rank,
      previous_ranking.rank AS previous_rank,
      current_ranking.likes,
      current_ranking.comments,
      current_ranking.score
    FROM current_ranking
    INNER JOIN events ON events.id = current_ranking.event_id
    LEFT JOIN previous_ranking ON previous_ranking.event_id = current_ranking.event_id
    WHERE current_ranking.rank <= 10
    ORDER BY current_ranking.rank ASC`;
      const { rows } = await pool.query(query, [period]);
      return {
        period,
        items: rows.map(row => {
          const rank = parseInt(row.rank, 10);
          const previousRank = row.previous_rank ? parseInt(row.previous_rank, 10) : null;
          return {
            rank, previousRank, movement: previousRank !== null ? previousRank - rank : null,
            isNew: previousRank === null,
            eventId: row.event_id,
            slug: row.slug,
            title: row.title,
            bannerUrl: row.banner_url,
            startTime: row.start_time,
            endTime: row.end_time,
            likes: parseInt(row.likes, 10),
            comments: parseInt(row.comments, 10),
            score: parseInt(row.score, 10)
          };
        })
      };
    },
  },

  user: {
    getUserOverview: async () => {
      const query =
        `SELECT
            COUNT(*) AS total,
            COUNT(*) FILTER (WHERE is_banned = FALSE) AS active,
            COUNT(*) FILTER (WHERE is_banned = TRUE) AS banned
        FROM users
        WHERE role = 'user'`;
      const { rows } = await pool.query(query);
      const result = rows[0];
      const total = parseInt(result.total, 10);
      const active = parseInt(result.active, 10);
      const banned = parseInt(result.banned, 10);
      return {
        total, active, banned,
        activePercentage: total > 0 ? Number(((active / total) * 100).toFixed(1)) : 0,
        bannedPercentage: total > 0 ? Number(((banned / total) * 100).toFixed(1)) : 0
      };
    },

    getUserGrowth: async (period = 'month') => {
      const validPeriods = ['week', 'month', 'year'];
      if (!validPeriods.includes(period)) throw new Error('Lỗi định dạng!');
      let query;
      if (period === 'week') {
        query =
          `WITH time_series AS (
            SELECT generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, INTERVAL '1 day')::date AS period)
            SELECT TO_CHAR(time_series.period, 'YYYY-MM-DD') AS date, COUNT(users.id) AS count
            FROM time_series
            LEFT JOIN users
              ON (users.created_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date = time_series.period AND users.role = 'user'
            GROUP BY time_series.period
            ORDER BY time_series.period ASC`;
      }
      if (period === 'month') {
        query =
          `WITH time_series AS (
            SELECT generate_series(DATE_TRUNC('month', CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh')::date, CURRENT_DATE, INTERVAL '1 day')::date AS period)
            SELECT TO_CHAR(time_series.period, 'YYYY-MM-DD') AS date, COUNT(users.id) AS count
            FROM time_series
            LEFT JOIN users
              ON (users.created_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date = time_series.period AND users.role = 'user'
            GROUP BY time_series.period
            ORDER BY time_series.period ASC`;
      }
      if (period === 'year') {
        query =
          `WITH time_series AS (
            SELECT generate_series(
              DATE_TRUNC('year',CURRENT_DATE)::date,
              DATE_TRUNC('month',CURRENT_DATE)::date,
              INTERVAL '1 month')::date AS period)
            SELECT TO_CHAR(time_series.period, 'YYYY-MM') AS date, COUNT(users.id) AS count
            FROM time_series
            LEFT JOIN users
              ON TO_CHAR(users.created_at AT TIME ZONE 'Asia/Ho_Chi_Minh','YYYY-MM') = TO_CHAR(time_series.period,'YYYY-MM') AND users.role = 'user'
            GROUP BY time_series.period
            ORDER BY time_series.period ASC`;
      }
      const { rows } = await pool.query(query);
      return { period, items: rows.map(row => ({ date: row.date, count: parseInt(row.count, 10) })) };
    },
  },

  submission: {
    getSubmissionOverview: async () => {
      const query =
        `SELECT 
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE is_read = FALSE) AS unread,
          COUNT(*) FILTER (WHERE is_read = TRUE) AS read,
          COUNT(*) FILTER (WHERE status = 'rule') AS rule,
          COUNT(*) FILTER (WHERE status = 'contact') AS contact,
          COUNT(*) FILTER (WHERE status = 'feedback') AS feedback
        FROM submission`;
      const { rows } = await pool.query(query);
      const result = rows[0];
      return {
        total: parseInt(result.total, 10),
        read: parseInt(result.read, 10),
        unRead: parseInt(result.unread, 10),
        rule: parseInt(result.rule, 10),
        contact: parseInt(result.contact, 10),
        feedback: parseInt(result.feedback, 10)
      }
    },

    getSubmissionGrowth: async (period = 'month') => {
      const validPeriods = ['week', 'month', 'year'];
      if (!validPeriods.includes(period)) throw new Error('Lỗi định dạng!');
      let query;
      if (period === 'week') {
        query =
          `WITH time_series AS (
            SELECT generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, INTERVAL '1 day')::date AS period)
            SELECT TO_CHAR(time_series.period, 'YYYY-MM-DD') AS date, COUNT(submission.id) AS count
            FROM time_series
            LEFT JOIN submission
              ON (submission.created_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date = time_series.period
            GROUP BY time_series.period
            ORDER BY time_series.period ASC`;
      }
      if (period === 'month') {
        query =
          `WITH time_series AS (
            SELECT generate_series(DATE_TRUNC('month', CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh')::date, CURRENT_DATE, INTERVAL '1 day')::date AS period)
            SELECT TO_CHAR(time_series.period, 'YYYY-MM-DD') AS date, COUNT(submission.id) AS count
            FROM time_series
            LEFT JOIN submission
              ON (submission.created_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date = time_series.period
            GROUP BY time_series.period
            ORDER BY time_series.period ASC`;
      }
      if (period === 'year') {
        query =
          `WITH time_series AS (
            SELECT generate_series(
              DATE_TRUNC('year',CURRENT_DATE)::date,
              DATE_TRUNC('month',CURRENT_DATE)::date,
              INTERVAL '1 month')::date AS period)
            SELECT TO_CHAR(time_series.period, 'YYYY-MM') AS date, COUNT(submission.id) AS count
            FROM time_series
            LEFT JOIN submission
              ON TO_CHAR(submission.created_at AT TIME ZONE 'Asia/Ho_Chi_Minh','YYYY-MM') = TO_CHAR(time_series.period,'YYYY-MM')
            GROUP BY time_series.period
            ORDER BY time_series.period ASC`;
      }
      const { rows } = await pool.query(query);
      return { period, items: rows.map(row => ({ date: row.date, count: parseInt(row.count, 10) })) };
    }
  }
};

module.exports = StatisticsService;