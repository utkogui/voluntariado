const { performance, PerformanceObserver } = require('perf_hooks');
const fs = require('fs');
const path = require('path');

// Performance test configuration
const config = {
  iterations: 100,
  warmupIterations: 10,
  timeout: 30000, // 30 seconds
  thresholds: {
    maxMemoryUsage: 100 * 1024 * 1024, // 100MB
    maxCpuUsage: 80, // 80%
    maxResponseTime: 500, // 500ms
    maxConcurrentRequests: 1000,
  },
};

// Performance metrics
const metrics = {
  memory: {
    used: [],
    heapUsed: [],
    heapTotal: [],
    external: [],
  },
  cpu: {
    usage: [],
    loadAverage: [],
  },
  response: {
    times: [],
    errors: [],
  },
  concurrent: {
    active: 0,
    max: 0,
  },
};

// Performance observer
const observer = new PerformanceObserver((list) => {
  const entries = list.getEntries();
  entries.forEach((entry) => {
    if (entry.entryType === 'measure') {
      metrics.response.times.push(entry.duration);
    }
  });
});

observer.observe({ entryTypes: ['measure'] });

// Memory usage tracking
const trackMemoryUsage = () => {
  const usage = process.memoryUsage();
  metrics.memory.used.push(usage.rss);
  metrics.memory.heapUsed.push(usage.heapUsed);
  metrics.memory.heapTotal.push(usage.heapTotal);
  metrics.memory.external.push(usage.external);
};

// CPU usage tracking
const trackCpuUsage = () => {
  const usage = process.cpuUsage();
  const loadAvg = require('os').loadavg();
  
  metrics.cpu.usage.push(usage);
  metrics.cpu.loadAverage.push(loadAvg);
};

// Response time measurement
const measureResponseTime = async (fn) => {
  const start = performance.now();
  performance.mark('start');
  
  try {
    const result = await fn();
    performance.mark('end');
    performance.measure('response-time', 'start', 'end');
    
    const end = performance.now();
    const duration = end - start;
    
    metrics.response.times.push(duration);
    return result;
  } catch (error) {
    metrics.response.errors.push(error.message);
    throw error;
  }
};

// Concurrent request simulation
const simulateConcurrentRequests = async (fn, count = 10) => {
  const promises = [];
  
  for (let i = 0; i < count; i++) {
    metrics.concurrent.active++;
    metrics.concurrent.max = Math.max(metrics.concurrent.max, metrics.concurrent.active);
    
    const promise = measureResponseTime(fn)
      .finally(() => {
        metrics.concurrent.active--;
      });
    
    promises.push(promise);
  }
  
  return Promise.allSettled(promises);
};

// API endpoint performance test
const testApiEndpoint = async (endpoint, method = 'GET', body = null) => {
  const url = `http://localhost:3000${endpoint}`;
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  return measureResponseTime(async () => {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  });
};

// Database performance test
const testDatabasePerformance = async () => {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  
  try {
    // Test database connection
    await measureResponseTime(async () => {
      await prisma.$connect();
    });
    
    // Test simple query
    await measureResponseTime(async () => {
      await prisma.user.findMany({ take: 10 });
    });
    
    // Test complex query
    await measureResponseTime(async () => {
      await prisma.opportunity.findMany({
        include: {
          institution: true,
          applications: true,
        },
        take: 10,
      });
    });
    
    // Test write operation
    await measureResponseTime(async () => {
      await prisma.user.create({
        data: {
          email: `test_${Date.now()}@example.com`,
          password: 'test123',
          name: 'Test User',
          userType: 'VOLUNTEER',
        },
      });
    });
    
  } finally {
    await prisma.$disconnect();
  }
};

// Memory leak detection
const detectMemoryLeaks = () => {
  const memoryStats = {
    initial: metrics.memory.used[0] || 0,
    final: metrics.memory.used[metrics.memory.used.length - 1] || 0,
    peak: Math.max(...metrics.memory.used),
    average: metrics.memory.used.reduce((a, b) => a + b, 0) / metrics.memory.used.length,
  };
  
  const memoryGrowth = memoryStats.final - memoryStats.initial;
  const memoryGrowthPercent = (memoryGrowth / memoryStats.initial) * 100;
  
  return {
    ...memoryStats,
    growth: memoryGrowth,
    growthPercent: memoryGrowthPercent,
    hasLeak: memoryGrowthPercent > 50, // More than 50% growth indicates potential leak
  };
};

// Performance analysis
const analyzePerformance = () => {
  const analysis = {
    memory: detectMemoryLeaks(),
    response: {
      average: metrics.response.times.reduce((a, b) => a + b, 0) / metrics.response.times.length,
      min: Math.min(...metrics.response.times),
      max: Math.max(...metrics.response.times),
      p95: calculatePercentile(metrics.response.times, 95),
      p99: calculatePercentile(metrics.response.times, 99),
    },
    errors: {
      count: metrics.response.errors.length,
      rate: (metrics.response.errors.length / metrics.response.times.length) * 100,
    },
    concurrent: {
      max: metrics.concurrent.max,
      average: metrics.concurrent.active,
    },
  };
  
  return analysis;
};

// Calculate percentile
const calculatePercentile = (values, percentile) => {
  const sorted = values.sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[index];
};

// Generate performance report
const generateReport = (analysis) => {
  const report = {
    timestamp: new Date().toISOString(),
    config,
    metrics,
    analysis,
    thresholds: config.thresholds,
    recommendations: [],
  };
  
  // Add recommendations based on analysis
  if (analysis.memory.hasLeak) {
    report.recommendations.push('Memory leak detected. Review code for memory leaks.');
  }
  
  if (analysis.response.average > config.thresholds.maxResponseTime) {
    report.recommendations.push('Response time exceeds threshold. Consider optimization.');
  }
  
  if (analysis.errors.rate > 5) {
    report.recommendations.push('Error rate is high. Review error handling.');
  }
  
  if (analysis.concurrent.max > config.thresholds.maxConcurrentRequests) {
    report.recommendations.push('Concurrent requests exceed threshold. Consider rate limiting.');
  }
  
  // Save report
  const reportPath = path.join(__dirname, '..', '..', 'quality-reports', 'performance-report.json');
  const reportDir = path.dirname(reportPath);
  
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📊 Performance report saved to: ${reportPath}`);
  
  return report;
};

// Main performance test
const runPerformanceTest = async () => {
  console.log('🚀 Starting performance test...');
  console.log(`Iterations: ${config.iterations}`);
  console.log(`Warmup: ${config.warmupIterations}`);
  console.log('');
  
  // Warmup
  console.log('🔥 Warming up...');
  for (let i = 0; i < config.warmupIterations; i++) {
    await testApiEndpoint('/api/opportunities');
    trackMemoryUsage();
    trackCpuUsage();
  }
  
  // Main test
  console.log('📊 Running performance tests...');
  for (let i = 0; i < config.iterations; i++) {
    // Test API endpoints
    await testApiEndpoint('/api/opportunities');
    await testApiEndpoint('/api/opportunities/search?keyword=test');
    
    // Test database performance
    await testDatabasePerformance();
    
    // Test concurrent requests
    await simulateConcurrentRequests(() => testApiEndpoint('/api/opportunities'), 5);
    
    // Track metrics
    trackMemoryUsage();
    trackCpuUsage();
    
    // Progress indicator
    if (i % 10 === 0) {
      console.log(`Progress: ${i}/${config.iterations}`);
    }
  }
  
  // Analyze results
  console.log('📈 Analyzing results...');
  const analysis = analyzePerformance();
  
  // Display results
  console.log('\n📊 Performance Test Results:');
  console.log('============================');
  console.log(`Memory Usage:`);
  console.log(`  Initial: ${(analysis.memory.initial / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Final: ${(analysis.memory.final / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Peak: ${(analysis.memory.peak / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Growth: ${analysis.memory.growthPercent.toFixed(2)}%`);
  console.log(`  Leak: ${analysis.memory.hasLeak ? '❌ Yes' : '✅ No'}`);
  
  console.log(`\nResponse Times:`);
  console.log(`  Average: ${analysis.response.average.toFixed(2)}ms`);
  console.log(`  Min: ${analysis.response.min.toFixed(2)}ms`);
  console.log(`  Max: ${analysis.response.max.toFixed(2)}ms`);
  console.log(`  95th Percentile: ${analysis.response.p95.toFixed(2)}ms`);
  console.log(`  99th Percentile: ${analysis.response.p99.toFixed(2)}ms`);
  
  console.log(`\nErrors:`);
  console.log(`  Count: ${analysis.errors.count}`);
  console.log(`  Rate: ${analysis.errors.rate.toFixed(2)}%`);
  
  console.log(`\nConcurrent Requests:`);
  console.log(`  Max: ${analysis.concurrent.max}`);
  console.log(`  Average: ${analysis.concurrent.average.toFixed(2)}`);
  
  // Generate report
  const report = generateReport(analysis);
  
  // Check thresholds
  const passed = !analysis.memory.hasLeak && 
                 analysis.response.average <= config.thresholds.maxResponseTime &&
                 analysis.errors.rate <= 5;
  
  console.log(`\nOverall: ${passed ? '✅ PASSED' : '❌ FAILED'}`);
  
  if (report.recommendations.length > 0) {
    console.log('\n💡 Recommendations:');
    report.recommendations.forEach(rec => console.log(`  - ${rec}`));
  }
  
  return report;
};

// Run if called directly
if (require.main === module) {
  runPerformanceTest().catch(error => {
    console.error('❌ Performance test failed:', error.message);
    process.exit(1);
  });
}

module.exports = {
  runPerformanceTest,
  testApiEndpoint,
  testDatabasePerformance,
  simulateConcurrentRequests,
  analyzePerformance,
  generateReport,
  config,
  metrics,
};
