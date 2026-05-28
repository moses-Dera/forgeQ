# 🚀 ForgeQ - Distributed Task Processing System

A production-grade distributed task-processing system with real-time dashboard demonstrating resilience, scalability, and observability.

## 📋 Features

- **Queue-Based Architecture**: Decoupled API, Queue, Workers, and Database
- **Automatic Retries**: Exponential backoff with configurable attempts
- **Dead-Letter Queue**: Capture tasks that fail after all retries
- **Real-Time Dashboard**: Live WebSocket updates on queue status
- **Worker Pool**: Scalable worker processes with heartbeat monitoring
- **Comprehensive Metrics**: Queued, Processing, Completed, Failed task counts
- **Control Panel**: Load testing, pause/resume, clear failed tasks
- **Database Persistence**: PostgreSQL for durable task history

## 🏗️ Architecture

```
Client/UI
    ↓
Express API (Port 3000)
    ↓
Redis Queue (Bull)
    ↓
Worker Pool (Node.js processes)
    ↓
PostgreSQL Database
```

## 📦 Prerequisites

- Node.js 18+
- Docker & Docker Compose (e.g., Docker Desktop)

## 🚀 Setup & Execution

### 1. Start Databases (Postgres & Redis)
Bring up the database and cache containers in the background:
```bash
docker compose up -d
```

### 2. Install Dependencies
Install Node modules for the backend and the frontend dashboard:
```bash
npm install && npm install --prefix client
```

### 3. Initialize Database Schema
Create the required PostgreSQL tables and indexes:
```bash
npm run db:init
```

### 4. Run the System
Launch the API server, worker, and React dashboard concurrently with a single command:
```bash
npm run dev:all
```
Once started, open **`http://localhost:5173`** in your browser to interact with the dashboard.

### (Alternative) Multi-Terminal Running
If you prefer to run services in separate terminals:
- **Start Backend**: `npm run dev` (Runs Express API on `http://localhost:3000`)
- **Start Worker**: `npm run worker` (Processes queue tasks)
- **Start Dashboard**: `npm run --prefix client dev` (Serves React frontend on `http://localhost:5173`)

## 🎮 Control Panel Features

**Load Test**: Submit 100 tasks to the queue  
**Pause Queue**: Stop processing temporarily  
**Resume Queue**: Continue processing  
**Clear Failed**: Remove failed tasks  

## 📊 API Endpoints

- `POST /api/tasks` - Submit a new task
- `GET /api/status` - Get system status
- `GET /api/tasks` - List recent tasks
- `GET /api/tasks/:taskId` - Get task details
- `GET /api/tasks/:taskId/history` - Get task history
- `POST /api/actions/load-test` - Submit load test
- `POST /api/actions/pause-queue` - Pause queue
- `POST /api/actions/resume-queue` - Resume queue
- `POST /api/actions/clear-failed` - Clear failed tasks

## 💡 How It Works

### 1. Submit Task
User submits task → API stores in DB → Pushes to Redis Queue

### 2. Worker Processing
Worker pulls from queue → Processes (simulated work) → Updates DB → Success/Failure

### 3. Failure Handling
- Task fails → Retry (exponential backoff)
- All retries exhausted → Move to Dead-Letter Queue
- New tasks from DLQ can be reprocessed

### 4. Dashboard Updates
WebSocket sends real-time metrics → Browser updates live

## 🧪 Demo Scenarios

### Scenario 1: Normal Load
1. Click "Load Test (100)"
2. Watch tasks flow through: Queued → Processing → Completed
3. Observe worker processing in terminal

### Scenario 2: Backpressure
1. Click "Load Test (100)" multiple times
2. Queue builds up (backpressure)
3. Workers catch up automatically

### Scenario 3: Failure Simulation
1. Kill one worker (`Ctrl+C`)
2. Watch queue build up
3. Restart worker (`npm run worker`)
4. System automatically recovers

## 📈 What You're Demonstrating

✅ **Decoupling**: API → Queue → Workers (independent scaling)  
✅ **Resilience**: Automatic retries, no task loss  
✅ **Observability**: Real-time metrics, worker status  
✅ **Scalability**: Add workers without stopping system  
✅ **Fault Tolerance**: Worker failures don't cascade  

## 🛠️ Production Considerations

- Add authentication for API endpoints
- Implement rate limiting
- Add more detailed error logging
- Use Redis persistence (RDB/AOF)
- Set up monitoring alerts
- Implement graceful shutdown
- Add distributed tracing

## 📝 Project Structure

```
forgeQ/
├── src/
│   ├── api/         # Express routes
│   ├── workers/     # Worker processes
│   ├── db/          # Database utilities
│   ├── utils/       # Queue, helpers
│   └── server.js    # Main API server
├── client/          # React dashboard
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx
│   │   │   └── ControlPanel.jsx
│   │   ├── App.jsx
│   │   └── index.jsx
│   ├── index.html
│   └── vite.config.js
├── .env             # Environment variables
└── package.json
```

## 📚 Learn More

- [Bull Queue Documentation](https://github.com/OptimalBits/bull)
- [Express.js Guide](https://expressjs.com/)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

Built to demonstrate production engineering principles: resilience, scalability, and observability.
