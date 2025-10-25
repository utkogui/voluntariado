const { performance } = require('perf_hooks');
const fs = require('fs');
const path = require('path');

// Benchmark configuration
const config = {
  iterations: 1000,
  warmupIterations: 100,
  timeout: 60000, // 60 seconds
  benchmarks: [
    {
      name: 'API Response Time',
      fn: async () => {
        const response = await fetch('http://localhost:3000/api/opportunities');
        return response.json();
      },
    },
    {
      name: 'Database Query',
      fn: async () => {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        try {
          return await prisma.user.findMany({ take: 10 });
        } finally {
          await prisma.$disconnect();
        }
      },
    },
    {
      name: 'JSON Serialization',
      fn: async () => {
        const data = { id: 1, name: 'Test', email: 'test@example.com' };
        return JSON.stringify(data);
      },
    },
    {
      name: 'Password Hashing',
      fn: async () => {
        const bcrypt = require('bcryptjs');
        return await bcrypt.hash('password123', 10);
      },
    },
    {
      name: 'JWT Token Generation',
      fn: async () => {
        const jwt = require('jsonwebtoken');
        return jwt.sign({ userId: 1 }, 'secret', { expiresIn: '1h' });
      },
    },
  ],
};

// Benchmark results
const results = {};

// Run single benchmark
const runBenchmark = async (benchmark) => {
  console.log(`🏃 Running benchmark: ${benchmark.name}`);
  
  const times = [];
  const errors = [];
  
  // Warmup
  for (let i = 0; i < config.warmupIterations; i++) {
    try {
      await benchmark.fn();
    } catch (error) {
      // Ignore warmup errors
    }
  }
  
  // Main benchmark
  for (let i = 0; i < config.iterations; i++) {
    const start = performance.now();
    
    try {
      await benchmark.fn();
      const end = performance.now();
      times.push(end - start);
    } catch (error) {
      errors.push(error.message);
    }
    
    // Progress indicator
    if (i % 100 === 0) {
      console.log(`  Progress: ${i}/${config.iterations}`);
    }
  }
  
  // Calculate statistics
  const sortedTimes = times.sort((a, b) => a - b);
  const stats = {
    name: benchmark.name,
    iterations: config.iterations,
    successful: times.length,
    failed: errors.length,
    successRate: (times.length / config.iterations) * 100,
    times: {
      min: Math.min(...times),
      max: Math.max(...times),
      average: times.reduce((a, b) => a + b, 0) / times.length,
      median: sortedTimes[Math.floor(sortedTimes.length / 2)],
      p95: sortedTimes[Math.floor(sortedTimes.length * 0.95)],
      p99: sortedTimes[Math.floor(sortedTimes.length * 0.99)],
    },
    errors: errors.slice(0, 10), // First 10 errors
  };
  
  results[benchmark.name] = stats;
  
  console.log(`  ✅ Completed: ${stats.successful}/${config.iterations} (${stats.successRate.toFixed(2)}%)`);
  console.log(`  ⏱️  Average: ${stats.times.average.toFixed(2)}ms`);
  console.log(`  📊 95th percentile: ${stats.times.p95.toFixed(2)}ms`);
  
  return stats;
};

// Run all benchmarks
const runAllBenchmarks = async () => {
  console.log('🚀 Starting benchmark suite...');
  console.log(`Iterations per benchmark: ${config.iterations}`);
  console.log(`Warmup iterations: ${config.warmupIterations}`);
  console.log('');
  
  const startTime = performance.now();
  
  for (const benchmark of config.benchmarks) {
    try {
      await runBenchmark(benchmark);
      console.log('');
    } catch (error) {
      console.error(`❌ Benchmark failed: ${benchmark.name}`, error.message);
      results[benchmark.name] = {
        name: benchmark.name,
        error: error.message,
        failed: true,
      };
    }
  }
  
  const endTime = performance.now();
  const totalTime = endTime - startTime;
  
  // Generate summary
  generateSummary(totalTime);
  
  // Save results
  saveResults();
  
  return results;
};

// Generate summary
const generateSummary = (totalTime) => {
  console.log('📊 Benchmark Summary:');
  console.log('====================');
  console.log(`Total time: ${(totalTime / 1000).toFixed(2)}s`);
  console.log('');
  
  // Sort by average time
  const sortedResults = Object.values(results)
    .filter(r => !r.failed)
    .sort((a, b) => a.times.average - b.times.average);
  
  console.log('🏆 Fastest to Slowest:');
  sortedResults.forEach((result, index) => {
    console.log(`${index + 1}. ${result.name}: ${result.times.average.toFixed(2)}ms`);
  });
  
  console.log('');
  console.log('📈 Performance Comparison:');
  if (sortedResults.length > 1) {
    const fastest = sortedResults[0];
    const slowest = sortedResults[sortedResults.length - 1];
    const ratio = slowest.times.average / fastest.times.average;
    
    console.log(`Fastest: ${fastest.name} (${fastest.times.average.toFixed(2)}ms)`);
    console.log(`Slowest: ${slowest.name} (${slowest.times.average.toFixed(2)}ms)`);
    console.log(`Ratio: ${ratio.toFixed(2)}x slower`);
  }
  
  console.log('');
  console.log('🎯 Recommendations:');
  
  // Find slow benchmarks
  const slowBenchmarks = sortedResults.filter(r => r.times.average > 100);
  if (slowBenchmarks.length > 0) {
    console.log('  Slow benchmarks (>100ms):');
    slowBenchmarks.forEach(b => {
      console.log(`    - ${b.name}: ${b.times.average.toFixed(2)}ms`);
    });
  }
  
  // Find benchmarks with high error rates
  const errorBenchmarks = Object.values(results).filter(r => !r.failed && r.successRate < 95);
  if (errorBenchmarks.length > 0) {
    console.log('  High error rate benchmarks:');
    errorBenchmarks.forEach(b => {
      console.log(`    - ${b.name}: ${b.successRate.toFixed(2)}% success rate`);
    });
  }
  
  // Find benchmarks with high variance
  const varianceBenchmarks = sortedResults.filter(r => {
    const variance = r.times.max - r.times.min;
    return variance > r.times.average * 2;
  });
  if (varianceBenchmarks.length > 0) {
    console.log('  High variance benchmarks:');
    varianceBenchmarks.forEach(b => {
      const variance = b.times.max - b.times.min;
      console.log(`    - ${b.name}: ${variance.toFixed(2)}ms variance`);
    });
  }
};

// Save results to file
const saveResults = () => {
  const reportPath = path.join(__dirname, '..', '..', 'quality-reports', 'benchmark-report.json');
  const reportDir = path.dirname(reportPath);
  
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const report = {
    timestamp: new Date().toISOString(),
    config,
    results,
    summary: {
      totalBenchmarks: config.benchmarks.length,
      successfulBenchmarks: Object.values(results).filter(r => !r.failed).length,
      failedBenchmarks: Object.values(results).filter(r => r.failed).length,
    },
  };
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📁 Benchmark report saved to: ${reportPath}`);
};

// Run if called directly
if (require.main === module) {
  runAllBenchmarks().catch(error => {
    console.error('❌ Benchmark suite failed:', error.message);
    process.exit(1);
  });
}

module.exports = {
  runAllBenchmarks,
  runBenchmark,
  config,
  results,
};
