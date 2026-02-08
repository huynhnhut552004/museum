const redis = require('../config/redis');

const KEY_TRENDING = 'search:trends';

const SearchService = {
  trackSearchClick: async (keyword) => {
    if (!keyword || typeof keyword !== 'string') return;
    const normalizedKeyword = keyword.trim().toLowerCase();
    await redis.zincrby(KEY_TRENDING, 1, normalizedKeyword);
  },

  getTrendingKeywords: async (limit = 10) => {
    const results = await redis.zrevrange(KEY_TRENDING, 0, limit - 1);
    return results; 
  }
};
module.exports = SearchService;