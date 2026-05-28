const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
require('dotenv').config();

const { initializeDatabase, query } = require('./db');
const { connectRedis, getQueueStats, taskQueue } = require('./utils/queue');
const apiRoutes = require('./api/routes');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', apiRoutes);

// WebSocket connection
const clients = new Set();

wss.on('connection', (ws) => {
  console.log('📡 WebSocket client connected');
  clients.add(ws);

  ws.on('close', () => {
    console.log('📡 WebSocket client disconnected');
    clients.delete(ws);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Broadcast updates to all connected clients
async function broadcastStatus() {
  if (clients.size === 0) return;

  try {
    const stats = await getQueueStats();
    const tasksResult = await query(
      `SELECT status, COUNT(*) as count FROM tasks GROUP BY status`
    );

    const tasksByStatus = {};
    tasksResult.rows.forEach(row => {
      tasksByStatus[row.status] = row.count;
    });

    // Get recent tasks
    const recentResult = await query(
      `SELECT task_id, status, created_at, started_at, completed_at 
       FROM tasks ORDER BY created_at DESC LIMIT 20`
    );

    // Get worker status
    const workersResult = await query(
      `SELECT worker_id, status, last_heartbeat, processed_count 
       FROM worker_status ORDER BY last_heartbeat DESC`
    );

    const message = JSON.stringify({
      type: 'status_update',
      queue: stats,
      database: tasksByStatus,
      recentTasks: recentResult.rows,
      workers: workersResult.rows,
      timestamp: new Date().toISOString(),
    });

    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  } catch (error) {
    console.error('Broadcast error:', error);
  }
}

// Action endpoints for control panel
app.post('/api/actions/load-test', async (req, res) => {
  try {
    const { count = 100 } = req.body;
    console.log(`🔥 Starting load test with ${count} tasks`);

    for (let i = 0; i < count; i++) {
      const taskId = require('uuid').v4();
      const data = { index: i, test: true };
      
      // Insert into the database first to satisfy foreign key constraints
      await query(
        `INSERT INTO tasks (task_id, status, data) VALUES ($1, $2, $3)`,
        [taskId, 'queued', JSON.stringify(data)]
      );

      await taskQueue.add({
        taskId,
        data,
      });
    }

    res.json({ success: true, tasksAdded: count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/actions/clear-failed', async (req, res) => {
  try {
    await query(`DELETE FROM tasks WHERE status = 'failed'`);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/actions/pause-queue', async (req, res) => {
  try {
    await taskQueue.pause();
    res.json({ success: true, message: 'Queue paused' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/actions/resume-queue', async (req, res) => {
  try {
    await taskQueue.resume();
    res.json({ success: true, message: 'Queue resumed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Initialize and start
async function start() {
  try {
    console.log('🔧 Initializing...');
    await initializeDatabase();
    await connectRedis();

    const PORT = process.env.PORT || 3000;

    server.listen(PORT, () => {
      console.log(`✅ API Server running on http://localhost:${PORT}`);
    });

    // Broadcast status every 1 second
    setInterval(broadcastStatus, 1000);

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();

module.exports = { app, server, wss };
