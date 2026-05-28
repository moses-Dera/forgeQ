/**
 * Integration Test Script
 * Tests all core components can connect and communicate
 */

const axios = require('axios');
require('dotenv').config();

const API_URL = `http://localhost:${process.env.PORT || 3000}/api`;

async function runTests() {
  console.log('🧪 ForgeQ Integration Tests\n');
  
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  // Test 1: Health Check
  try {
    const response = await axios.get(`${API_URL}/health`);
    console.log('✅ Test 1: API Health Check');
    results.tests.push({ name: 'Health Check', status: 'PASS' });
    results.passed++;
  } catch (error) {
    console.log('❌ Test 1: API Health Check - ', error.message);
    results.tests.push({ name: 'Health Check', status: 'FAIL' });
    results.failed++;
  }

  // Test 2: Submit Task
  let taskId;
  try {
    const response = await axios.post(`${API_URL}/tasks`, {
      data: { test: true, timestamp: new Date().toISOString() }
    });
    taskId = response.data.taskId;
    console.log(`✅ Test 2: Submit Task (ID: ${taskId.slice(0, 8)})`);
    results.tests.push({ name: 'Submit Task', status: 'PASS', taskId });
    results.passed++;
  } catch (error) {
    console.log('❌ Test 2: Submit Task - ', error.message);
    results.tests.push({ name: 'Submit Task', status: 'FAIL' });
    results.failed++;
  }

  // Test 3: Get System Status
  try {
    const response = await axios.get(`${API_URL}/status`);
    const status = response.data;
    console.log('✅ Test 3: Get System Status');
    console.log(`   - Queued: ${status.queue.queued}`);
    console.log(`   - Processing: ${status.queue.active}`);
    console.log(`   - Completed: ${status.queue.completed}`);
    results.tests.push({ name: 'System Status', status: 'PASS' });
    results.passed++;
  } catch (error) {
    console.log('❌ Test 3: Get System Status - ', error.message);
    results.tests.push({ name: 'System Status', status: 'FAIL' });
    results.failed++;
  }

  // Test 4: Get Task Details (if taskId was created)
  if (taskId) {
    try {
      const response = await axios.get(`${API_URL}/tasks/${taskId}`);
      console.log('✅ Test 4: Get Task Details');
      console.log(`   - Status: ${response.data.status}`);
      results.tests.push({ name: 'Task Details', status: 'PASS' });
      results.passed++;
    } catch (error) {
      console.log('❌ Test 4: Get Task Details - ', error.message);
      results.tests.push({ name: 'Task Details', status: 'FAIL' });
      results.failed++;
    }
  }

  // Test 5: List Tasks
  try {
    const response = await axios.get(`${API_URL}/tasks?limit=10`);
    console.log(`✅ Test 5: List Tasks (${response.data.length} recent)`);
    results.tests.push({ name: 'List Tasks', status: 'PASS' });
    results.passed++;
  } catch (error) {
    console.log('❌ Test 5: List Tasks - ', error.message);
    results.tests.push({ name: 'List Tasks', status: 'FAIL' });
    results.failed++;
  }

  // Test 6: Action - Load Test (light)
  try {
    const response = await axios.post(`${API_URL}/actions/load-test`, {
      count: 5
    });
    console.log('✅ Test 6: Load Test Action (5 tasks)');
    results.tests.push({ name: 'Load Test', status: 'PASS' });
    results.passed++;
  } catch (error) {
    console.log('❌ Test 6: Load Test Action - ', error.message);
    results.tests.push({ name: 'Load Test', status: 'FAIL' });
    results.failed++;
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Summary');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
  
  console.log('\n' + '='.repeat(50));
  console.log('🎯 System Status:');
  console.log('='.repeat(50));
  
  if (results.failed === 0) {
    console.log('✅ All systems operational!');
    console.log('\n📖 Next Steps:');
    console.log('1. Open dashboard: http://localhost:5173');
    console.log('2. Click "Load Test (100)" to see tasks flowing');
    console.log('3. Monitor worker output in terminal');
    console.log('4. Try control actions (pause, resume, clear)');
  } else {
    console.log('⚠️  Some tests failed. Check error messages above.');
    console.log('\nTroubleshooting:');
    console.log('- Ensure API server is running: npm start');
    console.log('- Ensure Redis is running: redis-server');
    console.log('- Ensure PostgreSQL is running: psql --version');
    console.log('- Check .env file configuration');
  }

  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error('Test runner error:', error);
  process.exit(1);
});
