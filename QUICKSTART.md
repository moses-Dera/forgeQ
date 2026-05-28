# ForgeQ - Quick Start Guide

## What You've Built

A **production-grade distributed task-processing system** that demonstrates:
- Queue-based architecture with decoupled components
- Automatic fault tolerance and recovery
- Real-time observability via live dashboard
- Scalable worker pool
- Enterprise-level resilience patterns

## File Structure

```
forgeQ/
├── src/
│   ├── server.js              # Express API + WebSocket server
│   ├── api/routes.js          # API endpoints (submit, status, history)
│   ├── workers/taskWorker.js  # Background worker process
│   ├── db/
│   │   ├── index.js           # PostgreSQL connection pool
│   │   └── schema.sql         # Database schema
│   └── utils/queue.js         # Redis + Bull queue setup
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx     # Status cards, task feed, workers
│   │   │   └── ControlPanel.jsx  # Action buttons (load test, pause, etc)
│   │   ├── App.jsx
│   │   └── index.jsx
│   ├── index.html
│   └── vite.config.js
├── .env                  # Environment config
├── package.json          # Backend dependencies
└── README.md             # Full documentation
```

## Core Architecture

**Request Flow:**
```
Browser (React Dashboard)
    ↓ (WebSocket)
Express API Server (3000)
    ↓
Redis Queue (Bull) ← Bull handles retry logic
    ↓
Worker Processes ← Can scale horizontally
    ↓
PostgreSQL Database
    ↓ (WebSocket)
Browser (Live Updates)
```

## What Each Component Does

### 1. `server.js` (API Server)
- Express endpoints for task submission and status
- WebSocket broadcaster for live metrics
- Action endpoints (load-test, pause, resume, clear-failed)
- Runs on port 3000

### 2. `taskWorker.js` (Background Worker)
- Processes tasks from Redis queue
- Automatic retry with exponential backoff
- Updates database with task status
- Heartbeat to track worker health
- Can spawn multiple instances (npm run worker:multi)

### 3. `routes.js` (API Endpoints)
- `POST /api/tasks` - Submit new task
- `GET /api/status` - System metrics (queued, processing, etc)
- `GET /api/tasks` - List recent tasks
- `GET /api/tasks/:taskId` - Get task details
- `POST /api/actions/*` - Control actions

### 4. `Dashboard.jsx` (Frontend)
- Real-time status cards (Queued/Processing/Completed/Failed)
- Worker health panel
- Live task feed
- Connects via WebSocket

### 5. `ControlPanel.jsx` (Engineering Control)
- Load Test button (submit 100 tasks)
- Pause/Resume queue
- Clear failed tasks

## Prerequisites

Make sure these are running:

```bash
# Terminal 1: Redis
redis-server

# Terminal 2: PostgreSQL
# (usually runs as a service)
# Verify: psql -U postgres -d forgeq -c "SELECT 1"
```

If not installed:
```bash
# macOS
brew install redis postgresql

# Ubuntu
sudo apt-get install redis-server postgresql postgresql-contrib

# Start services
brew services start redis
brew services start postgresql
```

## 4-Terminal Setup

**Terminal 1: Initialize Database**
```bash
npm run db:init
```

**Terminal 2: Start API Server**
```bash
npm start
# or with auto-reload: npm run dev
```

**Terminal 3: Start Worker(s)**
```bash
npm run worker
# (in another tab, start a 2nd worker for demo)
npm run worker
```

**Terminal 4: Start Dashboard**
```bash
cd client
npm run dev
# Opens at http://localhost:5173
```

## Demo Scenarios

### Scenario 1: Basic Load
1. Open dashboard at http://localhost:5173
2. Click "Load Test (100)"
3. Watch:
   - Cards update in real-time
   - Tasks flow: Queued → Processing → Completed
   - Workers show current activity

### Scenario 2: Backpressure Handling
1. Click "Load Test (100)" 3 times rapidly
2. Queue builds up (backpressure)
3. Workers keep processing
4. System catches up automatically

### Scenario 3: Fault Tolerance
1. Load test running
2. Kill one worker (Ctrl+C in worker terminal)
3. Queue grows temporarily
4. Restart worker (npm run worker)
5. System automatically recovers

### Scenario 4: Manual Controls
- **Pause**: Stop processing temporarily
- **Resume**: Continue processing
- **Clear Failed**: Remove stuck tasks

## Key Production Concepts

**What You're Demonstrating:**

| Concept | How It Works |
|---------|-------------|
| **Decoupling** | API independent from Workers (queue is the buffer) |
| **Scalability** | Add more workers without restarting API |
| **Resilience** | Failed tasks auto-retry; no data loss |
| **Observability** | Real-time metrics on queue, workers, tasks |
| **Backpressure** | Queue grows under load; workers catch up |
| **Fault Isolation** | Worker crash doesn't cascade |
| **Recovery** | New workers pick up from queue automatically |

## Metrics You Can Monitor

- **Queued**: Tasks waiting to be processed
- **Processing**: Active tasks in workers
- **Completed**: Successfully finished tasks
- **Failed**: Tasks in dead-letter queue
- **Worker Status**: Live/Dead tracking
- **Latency**: Time from submission to completion

## Extending the System

**Add More Workers:**
```bash
npm run worker &
npm run worker &
npm run worker &
```

**Change Task Complexity:**
Edit `src/workers/taskWorker.js` → modify the task simulation duration

**Add Persistence:**
Enable Redis RDB/AOF in production

**Add Monitoring:**
- Prometheus metrics endpoint
- ELK stack integration
- DataDog/New Relic APM

## Troubleshooting

**Redis Connection Error:**
```bash
redis-cli ping  # Should return "PONG"
```

**Database Error:**
```bash
psql -U postgres -d forgeq -c "\dt"  # List tables
```

**WebSocket Not Connecting:**
- Check browser console (F12)
- Verify API server running on :3000
- Check CORS settings in server.js

**Tasks Not Processing:**
- Check worker console output
- Verify Redis connection
- Check database for task record

## Project Goals Met ✅

✅ Production-grade architecture  
✅ Real-time dashboard  
✅ Automatic resilience  
✅ Scalable worker pool  
✅ Comprehensive observability  
✅ Control panel for operations  
✅ Demonstrates core production engineering concepts  

---

**Next Steps:**
1. Run the system
2. Play with load test scenarios
3. Kill workers and watch recovery
4. Review code architecture
5. Consider how you'd extend it (auth, rate limiting, monitoring)

This is the type of system that demonstrates you understand how real systems work under pressure.
