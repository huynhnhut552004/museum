const { Queue } = require('bullmq');
const Redis = require('ioredis');
const REDIS_URL = process.env.REDIS_URI;
const redisConnection = new Redis(REDIS_URL, { maxRetriesPerRequest: null, tls: { rejectUnauthorized: false } });

const aiQueue = new Queue('artwork-ai-processing', { connection: redisConnection });

module.exports = aiQueue;