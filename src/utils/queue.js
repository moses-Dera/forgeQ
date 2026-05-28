const Redis = require('redis');
const Bull = require('bull');
require('dotenv').config();

const redisClient = Redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  legacyMode: false,
});

redisClient.on('error', (err) => console.error('Redis error:', err));
redisClient.on('connect', () => console.log('✅ Redis connected'));

// Create task queue
const taskQueue = new Bull('task-queue', {
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: false,
    removeOnFail: false,
  },
  redis: process.env.REDIS_URL || 'redis://localhost:6379',
});

// Create dead-letter queue
const deadLetterQueue = new Bull('dead-letter-queue', {
  redis: process.env.REDIS_URL || 'redis://localhost:6379',
});

taskQueue.on('failed', async (job, err) => {
  console.error(`❌ Job ${job.id} failed:`, err.message);
  // Move to DLQ after all retries exhausted
  if (job.attemptsMade >= job.opts.attempts) {
    await deadLetterQueue.add(job.data, {
      original_job_id: job.id,
      error: err.message,
    });
  }
});

taskQueue.on('completed', (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

async function connectRedis() {
  try {
    await redisClient.connect();
    console.log('✅ Redis client connected');
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    throw error;
  }
}

async function getQueueStats() {
  const counts = await taskQueue.getJobCounts();
  return {
    queued: counts.waiting,
    active: counts.active,
    completed: counts.completed,
    failed: counts.failed,
    delayed: counts.delayed,
    dlq: await deadLetterQueue.count(),
  };
}

module.exports = {
  redisClient,
  taskQueue,
  deadLetterQueue,
  connectRedis,
  getQueueStats,
};
