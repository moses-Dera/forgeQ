const { taskQueue, deadLetterQueue } = require('../utils/queue');
const { query } = require('../db');
const { v4: uuidv4 } = require('uuid');

const workerId = `worker-${uuidv4().slice(0, 8)}`;
const startTime = Date.now();

async function processTask(job) {
  const { taskId, data } = job.data;

  try {
    // Mark as started
    await query(
      `UPDATE tasks SET status = $1, started_at = NOW() WHERE task_id = $2`,
      ['processing', taskId]
    );

    await query(
      `INSERT INTO task_history (task_id, status) VALUES ($1, $2)`,
      [taskId, 'processing']
    );

    console.log(`[${workerId}] Processing task ${taskId}`, data);

    // Simulate work with random duration (500ms - 3s)
    const duration = Math.random() * 2500 + 500;
    await new Promise(resolve => setTimeout(resolve, duration));

    // Simulate occasional failures (5% failure rate)
    if (Math.random() < 0.05) {
      throw new Error('Simulated processing failure');
    }

    const result = {
      processedAt: new Date().toISOString(),
      duration: duration.toFixed(2),
      workerId,
      data,
    };

    // Mark as completed
    await query(
      `UPDATE tasks SET status = $1, result = $2, completed_at = NOW() 
       WHERE task_id = $3`,
      ['completed', JSON.stringify(result), taskId]
    );

    await query(
      `INSERT INTO task_history (task_id, status) VALUES ($1, $2)`,
      [taskId, 'completed']
    );

    console.log(`✅ Task ${taskId} completed in ${duration.toFixed(2)}ms`);
    return result;
  } catch (error) {
    console.error(`❌ Task ${taskId} error:`, error.message);

    // Update task status
    await query(
      `UPDATE tasks SET status = $1, error_message = $2, retry_count = retry_count + 1, failed_at = NOW() 
       WHERE task_id = $3`,
      ['failed', error.message, taskId]
    );

    await query(
      `INSERT INTO task_history (task_id, status, metadata) VALUES ($1, $2, $3)`,
      [taskId, 'failed', JSON.stringify({ error: error.message, attempt: job.attemptsMade })]
    );

    throw error;
  }
}

async function startWorker() {
  try {
    // Register worker
    await query(
      `INSERT INTO worker_status (worker_id, status) VALUES ($1, $2)
       ON CONFLICT (worker_id) DO UPDATE SET status = $2, last_heartbeat = NOW()`,
      [workerId, 'alive']
    );

    console.log(`🚀 Worker ${workerId} started`);

    // Process jobs
    taskQueue.process(4, processTask); // 4 concurrent jobs per worker

    // Heartbeat every 5 seconds
    setInterval(async () => {
      await query(
        `UPDATE worker_status SET last_heartbeat = NOW() WHERE worker_id = $1`,
        [workerId]
      );
    }, 5000);

    // Listen to queue events
    taskQueue.on('active', (job) => {
      console.log(`[${workerId}] Job ${job.id} started`);
    });

    taskQueue.on('completed', (job) => {
      console.log(`[${workerId}] Job ${job.id} completed`);
    });

    taskQueue.on('failed', (job, err) => {
      console.error(`[${workerId}] Job ${job.id} failed:`, err.message);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log(`\n🛑 Worker ${workerId} shutting down...`);
      await taskQueue.close();
      await query(
        `UPDATE worker_status SET status = $1 WHERE worker_id = $2`,
        ['dead', workerId]
      );
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      console.log(`\n🛑 Worker ${workerId} shutting down...`);
      await taskQueue.close();
      await query(
        `UPDATE worker_status SET status = $1 WHERE worker_id = $2`,
        ['dead', workerId]
      );
      process.exit(0);
    });

  } catch (error) {
    console.error('Worker startup failed:', error);
    process.exit(1);
  }
}

// Start worker if this file is run directly
if (require.main === module) {
  require('dotenv').config();
  const { initializeDatabase } = require('../db');
  
  (async () => {
    try {
      await initializeDatabase();
      await startWorker();
    } catch (error) {
      console.error('Fatal error:', error);
      process.exit(1);
    }
  })();
}

module.exports = { startWorker, workerId };
