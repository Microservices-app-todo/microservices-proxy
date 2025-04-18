const Redis = require('ioredis');
const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});

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
