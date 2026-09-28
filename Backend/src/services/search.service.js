const redis = require('../config/redis');

const getISOWeekString = (date) => {
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  const weekNumber = 1 + Math.ceil((firstThursday - target) / 604800000);
  return `${target.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
};

const getTimeBuckets = (layout) => {
  const validLayouts = ['classic', 'digital'];
  const currentLayout = validLayouts.includes(layout) ? layout : 'classic';
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(now);
  const year = parts.find(p => p.type === "year").value;
  const month = parts.find(p => p.type === "month").value;
  const day = parts.find(p => p.type === "day").value;
  const date = `${year}-${month}-${day}`;
  const monthKey = `${year}-${month}`;
  const weekKey = getISOWeekString(now);
  const base = `search:trends:${currentLayout}`;
  return {
    allTime: base,
    daily: `${base}:day:${date}`,
    weekly: `${base}:week:${weekKey}`,
    monthly: `${base}:month:${monthKey}`,
    yearly: `${base}:year:${year}`
  };
};

const getPreviousKey = (layout, timeframe) => {
  const validLayouts = ['classic', 'digital'];
  const currentLayout = validLayouts.includes(layout) ? layout : 'classic';
  const base = `search:trends:${currentLayout}`;
  const now = new Date();
  if (timeframe === 'monthly') {
    now.setMonth(now.getMonth() - 1);
    const prevMonth = now.toISOString().slice(0, 7);
    return `${base}:month:${prevMonth}`;
  }
  if (timeframe === 'yearly') {
    const prevYear = now.getFullYear() - 1;
    return `${base}:year:${prevYear}`;
  }
  if (timeframe === 'weekly') {
    const prevDate = new Date(now);
    prevDate.setDate(prevDate.getDate() - 7);
    const prevWeekKey = getISOWeekString(prevDate);
    return `${base}:week:${prevWeekKey}`;
  }
  return null;
};

const SearchService = {
  trackSearchClick: async (keyword, layout) => {
    if (!keyword || typeof keyword !== 'string') return;
    const normalizedKeyword = keyword.trim();
    const buckets = getTimeBuckets(layout);
    const pipeline = redis.pipeline();
    pipeline.zincrby(buckets.allTime, 1, normalizedKeyword);
    pipeline.zincrby(buckets.daily, 1, normalizedKeyword);
    pipeline.zincrby(buckets.weekly, 1, normalizedKeyword);
    pipeline.zincrby(buckets.monthly, 1, normalizedKeyword);
    pipeline.zincrby(buckets.yearly, 1, normalizedKeyword);
    pipeline.expire(buckets.daily, 86400 * 30);
    pipeline.expire(buckets.weekly, 86400 * 90);
    pipeline.expire(buckets.monthly, 86400 * 365);
    await pipeline.exec();
  },

  getTrendingKeywords: async (layout, timeframe = 'allTime', limit = 10) => {
    const buckets = getTimeBuckets(layout);
    const targetKey = buckets[timeframe] || buckets.allTime;
    const prevKey = getPreviousKey(layout, timeframe);
    const rawResults = await redis.zrevrange(targetKey, 0, limit - 1, 'WITHSCORES');
    const pipeline = redis.pipeline();
    const currentKeywords = [];
    for (let i = 0; i < rawResults.length; i += 2) {
      const keyword = rawResults[i];
      currentKeywords.push(keyword);
      if (prevKey) pipeline.zrevrank(prevKey, keyword);
    }
    const prevRanksRaw = prevKey ? await pipeline.exec() : [];
    const results = [];
    for (let i = 0; i < currentKeywords.length; i++) {
      const keyword = currentKeywords[i];
      const currentRank = i + 1;
      const score = parseInt(rawResults[i * 2 + 1], 10);
      let previousRank = null;
      let isNew = true;
      let movement = 0;
      if (prevKey && prevRanksRaw[i] && prevRanksRaw[i][1] !== null) {
        previousRank = prevRanksRaw[i][1] + 1;
        isNew = false;
        movement = previousRank - currentRank;
      }
      results.push({ keyword, score, rank: currentRank, previousRank, movement, isNew });
    }
    return results;
  }
};

module.exports = SearchService;