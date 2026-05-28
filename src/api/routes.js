const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { taskQueue, getQueueStats, deadLetterQueue } = require('../utils/queue');
const { query } = require('../db');
const router = express.Router();

// Submit a new task
router.post('/tasks', async (req, res) => {
  try {
    const { data, priority = 'normal' } = req.body;
    const taskId = uuidv4();

    // Store in database
    await query(
      `INSERT INTO tasks (task_id, status, data) 
       VALUES ($1, $2, $3)`,
      [taskId, 'queued', JSON.stringify(data || {})]
    );

    // Add to queue
    const job = await taskQueue.add(
      { taskId, data },
      { priority: priority === 'high' ? 1 : 0 }
    );

    // Record in history
    await query(
      `INSERT INTO task_history (task_id, status) VALUES ($1, $2)`,
      [taskId, 'queued']
    );

    res.json({
      success: true,
      taskId,
      jobId: job.id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get system status
router.get('/status', async (req, res) => {
  try {
    const stats = await getQueueStats();
    const tasksResult = await query(
      `SELECT status, COUNT(*) as count FROM tasks GROUP BY status`
    );

    const tasksByStatus = {};
    tasksResult.rows.forEach(row => {
      tasksByStatus[row.status] = row.count;
    });

    res.json({
      queue: stats,
      database: tasksByStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get task details
router.get('/tasks/:taskId', async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM tasks WHERE task_id = $1`,
      [req.params.taskId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get recent tasks
router.get('/tasks', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const result = await query(
      `SELECT task_id, status, created_at, started_at, completed_at 
       FROM tasks ORDER BY created_at DESC LIMIT $1`,
      [limit]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get task history
router.get('/tasks/:taskId/history', async (req, res) => {
  try {
    const result = await query(
      `SELECT status, timestamp FROM task_history 
       WHERE task_id = $1 ORDER BY timestamp ASC`,
      [req.params.taskId]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

module.exports = router;
