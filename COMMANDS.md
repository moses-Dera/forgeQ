# 🚀 ForgeQ - Command Reference Guide

## Installation Commands

```bash
# Install all backend dependencies
npm install

# Install all frontend dependencies
npm install --prefix client

# Initialize PostgreSQL database
npm run db:init
```

## Running the System

### Start API Server (Port 3000)
```bash
npm start
# or with auto-reload:
npm run dev
```

### Start Worker Process
```bash
npm run worker
```

### Start Multiple Workers
```bash
npm run worker:multi
# or manually:
npm run worker &
npm run worker &
npm run worker &
```

### Start React Dashboard (Port 5173)
```bash
cd client
npm run dev
```

## Testing Commands

### Run Integration Tests
```bash
npm test
```

### Verify System Setup
```bash
./verify.sh
```

## Database Commands

### Initialize Database (Create tables)
```bash
npm run db:init
```

### Connect to Database Directly
```bash
psql -U postgres -d forgeq
```

### View Tables
```bash
psql -U postgres -d forgeq -c "\dt"
```

### Query Recent Tasks
```bash
psql -U postgres -d forgeq -c "SELECT task_id, status, created_at FROM tasks ORDER BY created_at DESC LIMIT 10;"
```

### Query Worker Status
```bash
psql -U postgres -d forgeq -c "SELECT worker_id, status, last_heartbeat FROM worker_status;"
```

## Redis Commands

### Check Redis Connection
```bash
redis-cli ping
# Should return: PONG
```

### View Queue Info
```bash
redis-cli INFO
```

### Monitor Redis Activity
```bash
redis-cli MONITOR
```

### Clear Redis Cache (WARNING: deletes all data)
```bash
redis-cli FLUSHALL
```

## API Endpoints

### Submit a Task
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"data": {"test": true}}'
```

### Get System Status
```bash
curl http://localhost:3000/api/status
```

### Get Recent Tasks
```bash
curl http://localhost:3000/api/tasks?limit=20
```

### Get Task Details
```bash
curl http://localhost:3000/api/tasks/{taskId}
```

### Get Task History
```bash
curl http://localhost:3000/api/tasks/{taskId}/history
```

### Health Check
```bash
curl http://localhost:3000/api/health
```

### Load Test (submit 100 tasks)
```bash
curl -X POST http://localhost:3000/api/actions/load-test \
  -H "Content-Type: application/json" \
  -d '{"count": 100}'
```

### Pause Queue
```bash
curl -X POST http://localhost:3000/api/actions/pause-queue
```

### Resume Queue
```bash
curl -X POST http://localhost:3000/api/actions/resume-queue
```

### Clear Failed Tasks
```bash
curl -X POST http://localhost:3000/api/actions/clear-failed
```

## Development Commands

### Watch Mode (auto-reload on changes)
```bash
npm run dev
```

### Build Frontend for Production
```bash
cd client
npm run build
```

### Preview Production Build
```bash
cd client
npm run preview
```

## Troubleshooting Commands

### Check if Redis is Running
```bash
redis-cli ping
ps aux | grep redis
```

### Check if PostgreSQL is Running
```bash
psql --version
psql -l
```

### Check if Node processes are Running
```bash
ps aux | grep node
lsof -i :3000  # API server
lsof -i :5173  # Dashboard
```

### View API Server Logs
```bash
npm start 2>&1 | tee api.log
```

### View Worker Logs
```bash
npm run worker 2>&1 | tee worker.log
```

### Check Node Package Versions
```bash
npm list express bull redis pg
npm list --prefix client react axios
```

## Useful One-Liners

### Submit 100 Tasks and Show Queue Status
```bash
curl -X POST http://localhost:3000/api/actions/load-test -H "Content-Type: application/json" -d '{"count": 100}' && sleep 2 && curl http://localhost:3000/api/status
```

### Count Tasks by Status in Database
```bash
psql -U postgres -d forgeq -c "SELECT status, COUNT(*) FROM tasks GROUP BY status;"
```

### Real-time Check of Worker Status
```bash
psql -U postgres -d forgeq -c "SELECT worker_id, status, last_heartbeat, processed_count FROM worker_status;"
```

### Check Memory Usage
```bash
ps aux | grep node | grep -v grep
free -h
```

## Complete System Startup

Run each in a separate terminal:

**Terminal 1: API Server**
```bash
npm start
```

**Terminal 2: Worker**
```bash
npm run worker
```

**Terminal 3: Dashboard**
```bash
cd client && npm run dev
```

---

## Quick Reference Table

| Task | Command |
|------|---------|
| Install All | `npm install && npm install --prefix client` |
| Setup DB | `npm run db:init` |
| Start API | `npm start` |
| Start Worker | `npm run worker` |
| Start Dashboard | `cd client && npm run dev` |
| Run Tests | `npm test` |
| Verify System | `./verify.sh` |
| Load Test | `curl -X POST http://localhost:3000/api/actions/load-test -d '{"count": 100}'` |
| Get Status | `curl http://localhost:3000/api/status` |
| Check Redis | `redis-cli ping` |
| Check DB | `psql -U postgres -d forgeq -c "\dt"` |
