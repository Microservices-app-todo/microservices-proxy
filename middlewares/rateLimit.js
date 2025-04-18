const Redis = require('ioredis');
const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});
redis.on('connect', () => console.log('✅ Connected to Redis for rate limiting'));
redis.on('error', err => console.error('❌ Redis error:', err));

module.exports = async (req, res, next) => {
  const ip = req.ip;
  const limit = 10;
  const windowInSeconds = 60;

  const key = `ratelimit:${ip}`;

  const current = await redis.incr(key);
  if (current === 1) await redis.expire(key, windowInSeconds);

  if (current > limit) {
    return res.status(429).json({ error: 'Too many requests. Please wait.' });
  }

  next();
};
