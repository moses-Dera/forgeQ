# Technical Assessment Answers — ForgeQ

This file answers the five required questions for the persistent mini-app technical assessment submission.

---

### 1. How to run

To run **ForgeQ** on a fresh machine, you need **Node.js (v18+)** and **Docker** installed. Follow these steps:

1. **Spin up Infrastructure**: Run the following command at the repo root to start PostgreSQL and Redis in the background:
   ```bash
   docker compose up -d
   ```
2. **Install Dependencies**: Install node modules for both the backend and the frontend:
   ```bash
   npm install && npm install --prefix client
   ```
3. **Initialize Database Schema**: Run the schema creation script to prepare tables and indexes in the Postgres container:
   ```bash
   npm run db:init
   ```
4. **Launch All Services**: Start the API server, worker process, and Vite client concurrently with a single command:
   ```bash
   npm run dev:all
   ```
5. **Access the Dashboard**: Open your browser and navigate to **`http://localhost:5173`**.

---

### 2. Stack choice

I chose the **React, Express, Redis, PostgreSQL, and WebSockets** stack for this distributed task queue project:

* **Node.js/Express**: Fast, single-threaded event loop that handles API routing and WebSocket handshakes efficiently.
* **React (Vite)**: Provides an instant, hot-reloading dev environment. I designed a premium glassmorphic UI using pure CSS to offer an immediate and visually polished dashboard experience.
* **Redis + Bull**: Standard tools for distributed task queues in the Node ecosystem. Bull handles task lifecycles, states, and event hooks natively without rolling a custom scheduling loop.
* **PostgreSQL**: Serves as our persistent audit log, storing task runs, worker status histories, and execution durations reliably.
* **WebSockets**: Ensures real-time state updates. Pushing queue metrics down to the dashboard browser on every status transition is much more efficient than constant client-side polling.

**Worse Choice**: A monolithic stack like Java/Spring Boot combined with a local file-based database (like H2). While compile-heavy stacks have their place, they slow down development feedback loops, complicate multi-process worker structures, and make it difficult to build highly responsive, real-time UI dashboards.

---

### 3. One real edge case

**The Edge Case**: A race condition where a worker tries to process a task before the API server has finished persisting it to the PostgreSQL database.

* **File and Lines**: [src/server.js: L95-104](file:///home/moze/Desktop/forgeQ/src/server.js#L95-L104)
* **Explanation**: In the load testing script (and standard task creation), the task is saved to the database *before* it is pushed to the Bull Redis queue.
* **What would happen without it**: If we added the task to Redis first (`taskQueue.add`), the Bull worker could pick it up immediately (within microseconds) and attempt to run `UPDATE tasks SET status = 'processing' WHERE task_id = ...`. If the API server's database write was delayed, the worker's `UPDATE` would match 0 rows. Later, when the API server finished its insert, it would write the task with status `'queued'`, overwriting the worker's updates and breaking status integrity. Saving to the DB first guarantees the record exists before a worker can process it.

---

### 4. AI usage

* **Which Tool**: Antigravity (a Gemini-based agent).
* **What I Asked**: To launch the project, debug connection errors, and optimize the runner commands.
* **What it Gave**: 
  1. It detected that the local Redis server was running on the host but the PostgreSQL container was stopped. It launched the postgres container and verified connections.
  2. It suggested migrating the entire database to SQLite for a simpler submission.
* **What I Changed and Why**: I rejected the migration to SQLite. I preferred keeping the PostgreSQL and Redis configuration because it demonstrates real-world production engineering principles (distributed worker decoupling, transaction controls). Instead of downgrading the storage, I directed the AI to write a `docker-compose.yml` to orchestrate Postgres and Redis, and to configure `concurrently` so the evaluator can spin up the full production stack with zero manual configuration.

---

### 5. Honest gap

**The Gap**: Zombie worker statuses. 

If a worker process crashes abruptly (e.g. power loss, `kill -9`), it remains marked as `LIVE` in the dashboard list because it never has the chance to trigger its `SIGINT`/`SIGTERM` database cleanup handlers.

**How to Fix It**: 
With another day, I would implement a **Worker Heartbeat Threshold Check** on the Express API. When broadcasting status updates to WebSocket clients, the server should compare the current timestamp against each worker's `last_heartbeat` column. If a worker hasn't reported a heartbeat in the last 10 seconds, the server should automatically update its status to `OFFLINE` and release any tasks locked by that worker.
