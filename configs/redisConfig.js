import { createClient } from 'redis';

let redisConnected = false;

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redisClient.on('error', (err) => {
  console.error('Redis client error', err.message);
  redisConnected = false;
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
  redisConnected = true;
});

// Connect to Redis
(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error('Failed to connect to Redis:', err.message);
    redisConnected = false;
  }
})();

export const isRedisConnected = () => redisConnected;

export default redisClient;
