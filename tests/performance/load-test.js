const autocannon = require('autocannon');
const { performance } = require('perf_hooks');

// Test configuration
const config = {
  url: 'http://localhost:3000',
  connections: 10,
  pipelining: 1,
  duration: 30,
  requests: [
    {
      method: 'GET',
      path: '/api/opportunities',
    },
    {
      method: 'GET',
      path: '/api/opportunities/search?keyword=test',
    },
    {
      method: 'POST',
      path: '/api/auth/login',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    },
  ],
};

// Performance metrics
const metrics = {
  startTime: 0,
  endTime: 0,
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  averageResponseTime: 0,
  minResponseTime: Infinity,
  maxResponseTime: 0,
  requestsPerSecond: 0,
  errors: [],
};

// Run load test
const runLoadTest = async () => {
  console.log('🚀 Starting load test...');
  console.log(`Target: ${config.url}`);
  console.log(`Connections: ${config.connections}`);
  console.log(`Duration: ${config.duration}s`);
  console.log('');

  const startTime = performance.now();
  metrics.startTime = startTime;

  try {
    const result = await autocannon(config);
    
    const endTime = performance.now();
    metrics.endTime = endTime;
    metrics.totalRequests = result.requests.total;
    metrics.successfulRequests = result.requests.total - result.non2xx;
    metrics.failedRequests = result.non2xx;
    metrics.averageResponseTime = result.latency.average;
    metrics.minResponseTime = result.latency.min;
    metrics.maxResponseTime = result.latency.max;
    metrics.requestsPerSecond = result.requests.average;

    // Display results
    console.log('📊 Load Test Results:');
    console.log('====================');
    console.log(`Total Requests: ${metrics.totalRequests}`);
    console.log(`Successful: ${metrics.successfulRequests}`);
    console.log(`Failed: ${metrics.failedRequests}`);
    console.log(`Success Rate: ${((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(2)}%`);
    console.log(`Average Response Time: ${metrics.averageResponseTime.toFixed(2)}ms`);
    console.log(`Min Response Time: ${metrics.minResponseTime}ms`);
    console.log(`Max Response Time: ${metrics.maxResponseTime}ms`);
    console.log(`Requests/Second: ${metrics.requestsPerSecond.toFixed(2)}`);
    console.log(`Total Duration: ${((endTime - startTime) / 1000).toFixed(2)}s`);

    // Performance thresholds
    const thresholds = {
      maxAverageResponseTime: 500, // 500ms
      minSuccessRate: 95, // 95%
      minRequestsPerSecond: 10, // 10 req/s
    };

    console.log('\n🎯 Performance Thresholds:');
    console.log('==========================');
    
    const responseTimePassed = metrics.averageResponseTime <= thresholds.maxAverageResponseTime;
    const successRatePassed = (metrics.successfulRequests / metrics.totalRequests) * 100 >= thresholds.minSuccessRate;
    const rpsPassed = metrics.requestsPerSecond >= thresholds.minRequestsPerSecond;

    console.log(`Response Time: ${responseTimePassed ? '✅' : '❌'} ${metrics.averageResponseTime.toFixed(2)}ms <= ${thresholds.maxAverageResponseTime}ms`);
    console.log(`Success Rate: ${successRatePassed ? '✅' : '❌'} ${((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(2)}% >= ${thresholds.minSuccessRate}%`);
    console.log(`Requests/Second: ${rpsPassed ? '✅' : '❌'} ${metrics.requestsPerSecond.toFixed(2)} >= ${thresholds.minRequestsPerSecond}`);

    const allPassed = responseTimePassed && successRatePassed && rpsPassed;
    console.log(`\nOverall: ${allPassed ? '✅ PASSED' : '❌ FAILED'}`);

    return {
      passed: allPassed,
      metrics,
      thresholds,
    };

  } catch (error) {
    console.error('❌ Load test failed:', error.message);
    return {
      passed: false,
      error: error.message,
    };
  }
};

// Run stress test
const runStressTest = async () => {
  console.log('🔥 Starting stress test...');
  
  const stressConfig = {
    ...config,
    connections: 50,
    duration: 60,
  };

  const result = await autocannon(stressConfig);
  
  console.log('📊 Stress Test Results:');
  console.log('======================');
  console.log(`Total Requests: ${result.requests.total}`);
  console.log(`Failed Requests: ${result.non2xx}`);
  console.log(`Success Rate: ${(((result.requests.total - result.non2xx) / result.requests.total) * 100).toFixed(2)}%`);
  console.log(`Average Response Time: ${result.latency.average.toFixed(2)}ms`);
  console.log(`Max Response Time: ${result.latency.max}ms`);
  console.log(`Requests/Second: ${result.requests.average.toFixed(2)}`);

  return result;
};

// Run spike test
const runSpikeTest = async () => {
  console.log('⚡ Starting spike test...');
  
  const spikeConfig = {
    ...config,
    connections: 100,
    duration: 10,
  };

  const result = await autocannon(spikeConfig);
  
  console.log('📊 Spike Test Results:');
  console.log('=====================');
  console.log(`Total Requests: ${result.requests.total}`);
  console.log(`Failed Requests: ${result.non2xx}`);
  console.log(`Success Rate: ${(((result.requests.total - result.non2xx) / result.requests.total) * 100).toFixed(2)}%`);
  console.log(`Average Response Time: ${result.latency.average.toFixed(2)}ms`);
  console.log(`Max Response Time: ${result.latency.max}ms`);
  console.log(`Requests/Second: ${result.requests.average.toFixed(2)}`);

  return result;
};

// Main function
const main = async () => {
  try {
    // Run load test
    const loadResult = await runLoadTest();
    
    if (loadResult.passed) {
      console.log('\n✅ Load test passed! Running stress test...');
      await runStressTest();
      
      console.log('\n✅ Stress test completed! Running spike test...');
      await runSpikeTest();
      
      console.log('\n🎉 All performance tests completed!');
    } else {
      console.log('\n❌ Load test failed! Skipping stress and spike tests.');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Performance test failed:', error.message);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  runLoadTest,
  runStressTest,
  runSpikeTest,
  config,
  metrics,
};
