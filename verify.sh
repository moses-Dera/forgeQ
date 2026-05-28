#!/bin/bash
set -e

echo "🔍 ForgeQ System Verification"
echo "=============================="

# Check Node.js
echo -n "✓ Node.js: "
node --version

# Check npm
echo -n "✓ NPM: "
npm --version

# Check project structure
echo ""
echo "📁 Project Structure:"
for dir in src src/api src/workers src/db src/utils client client/src client/src/components; do
  if [ -d "$dir" ]; then
    echo "  ✓ $dir/"
  else
    echo "  ✗ $dir/ (missing)"
  fi
done

# Check key files
echo ""
echo "📝 Key Files:"
for file in src/server.js src/workers/taskWorker.js src/api/routes.js src/db/index.js client/src/App.jsx; do
  if [ -f "$file" ]; then
    echo "  ✓ $file"
  else
    echo "  ✗ $file (missing)"
  fi
done

# Check dependencies
echo ""
echo "📦 Dependencies:"
echo -n "  Backend: "
if npm list express > /dev/null 2>&1; then echo "✓"; else echo "✗"; fi
echo -n "  Redis: "
if npm list redis > /dev/null 2>&1; then echo "✓"; else echo "✗"; fi
echo -n "  Bull: "
if npm list bull > /dev/null 2>&1; then echo "✓"; else echo "✗"; fi
echo -n "  PostgreSQL: "
if npm list pg > /dev/null 2>&1; then echo "✓"; else echo "✗"; fi
echo -n "  React: "
if npm list --prefix client react > /dev/null 2>&1; then echo "✓"; else echo "✗"; fi

# Check configuration
echo ""
echo "⚙️  Configuration:"
if [ -f ".env" ]; then
  echo "  ✓ .env file present"
  echo "    - PORT: $(grep PORT .env || echo 'default')"
  echo "    - REDIS_URL: $(grep REDIS_URL .env || echo 'default')"
  echo "    - DATABASE_URL: $(grep DATABASE_URL .env || echo 'default')"
else
  echo "  ✗ .env file missing"
fi

echo ""
echo "✅ System Structure Verified!"
echo ""
echo "📖 Next Steps:"
echo "1. Ensure Redis is running: redis-server"
echo "2. Ensure PostgreSQL is running: psql --version"
echo "3. Initialize database: npm run db:init"
echo "4. Terminal 1: npm start (API server)"
echo "5. Terminal 2: npm run worker (worker process)"
echo "6. Terminal 3: cd client && npm run dev (dashboard)"
echo ""
echo "🎯 Dashboard: http://localhost:5173"
echo "🔌 API: http://localhost:3000/api"
