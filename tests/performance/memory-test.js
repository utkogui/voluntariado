const { performance } = require('perf_hooks');
const fs = require('fs');
const path = require('path');

// Memory test configuration
const config = {
  iterations: 1000,
  warmupIterations: 100,
  timeout: 60000, // 60 seconds
  memoryThreshold: 100 * 1024 * 1024, // 100MB
  leakThreshold: 50, // 50% growth
};

// Memory test results
const results = {
  initial: null,
  final: null,
  peak: 0,
  samples: [],
  leaks: [],
  gc: {
    before: 0,
    after: 0,
    collected: 0,
  },
};

// Memory sampling
const sampleMemory = () => {
  const usage = process.memoryUsage();
  const sample = {
    timestamp: Date.now(),
    rss: usage.rss,
    heapUsed: usage.heapUsed,
    heapTotal: usage.heapTotal,
    external: usage.external,
    arrayBuffers: usage.arrayBuffers,
  };
  
  results.samples.push(sample);
  results.peak = Math.max(results.peak, usage.rss);
  
  return sample;
};

// Force garbage collection
const forceGC = () => {
  if (global.gc) {
    const before = process.memoryUsage();
    global.gc();
    const after = process.memoryUsage();
    
    results.gc.before = before.heapUsed;
    results.gc.after = after.heapUsed;
    results.gc.collected = before.heapUsed - after.heapUsed;
    
    return results.gc;
  }
  return null;
};

// Memory leak detection
const detectMemoryLeaks = () => {
  if (results.samples.length < 2) {
    return { hasLeak: false, reason: 'Insufficient samples' };
  }
  
  const first = results.samples[0];
  const last = results.samples[results.samples.length - 1];
  
  const growth = last.rss - first.rss;
  const growthPercent = (growth / first.rss) * 100;
  
  const hasLeak = growthPercent > config.leakThreshold;
  
  return {
    hasLeak,
    growth,
    growthPercent,
    initial: first.rss,
    final: last.rss,
    peak: results.peak,
  };
};

// Memory stress test
const runMemoryStressTest = async () => {
  console.log('🧠 Running memory stress test...');
  
  // Initial memory sample
  results.initial = sampleMemory();
  console.log(`Initial memory: ${(results.initial.rss / 1024 / 1024).toFixed(2)} MB`);
  
  // Create memory-intensive operations
  const memoryIntensiveOperations = [
    // Large array creation
    () => {
      const arr = new Array(1000000).fill(0).map((_, i) => ({ id: i, data: 'x'.repeat(100) }));
      return arr;
    },
    
    // Large object creation
    () => {
      const obj = {};
      for (let i = 0; i < 100000; i++) {
        obj[`key_${i}`] = { data: 'x'.repeat(100), timestamp: Date.now() };
      }
      return obj;
    },
    
    // String concatenation
    () => {
      let str = '';
      for (let i = 0; i < 100000; i++) {
        str += `line_${i}_${'x'.repeat(100)}\n`;
      }
      return str;
    },
    
    // Buffer creation
    () => {
      const buffers = [];
      for (let i = 0; i < 1000; i++) {
        buffers.push(Buffer.alloc(1024 * 1024)); // 1MB each
      }
      return buffers;
    },
  ];
  
  // Run operations
  for (let i = 0; i < config.iterations; i++) {
    const operation = memoryIntensiveOperations[i % memoryIntensiveOperations.length];
    
    try {
      const result = operation();
      
      // Sample memory every 10 iterations
      if (i % 10 === 0) {
        sampleMemory();
      }
      
      // Force GC every 100 iterations
      if (i % 100 === 0) {
        forceGC();
      }
      
      // Progress indicator
      if (i % 100 === 0) {
        const current = process.memoryUsage();
        console.log(`  Progress: ${i}/${config.iterations} - Memory: ${(current.rss / 1024 / 1024).toFixed(2)} MB`);
      }
      
    } catch (error) {
      console.error(`  Error at iteration ${i}:`, error.message);
      results.leaks.push({
        iteration: i,
        error: error.message,
        memory: process.memoryUsage(),
      });
    }
  }
  
  // Final memory sample
  results.final = sampleMemory();
  console.log(`Final memory: ${(results.final.rss / 1024 / 1024).toFixed(2)} MB`);
  
  // Analyze results
  const leakAnalysis = detectMemoryLeaks();
  
  console.log('\n📊 Memory Analysis:');
  console.log('==================');
  console.log(`Initial: ${(leakAnalysis.initial / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Final: ${(leakAnalysis.final / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Peak: ${(leakAnalysis.peak / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Growth: ${(leakAnalysis.growth / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Growth %: ${leakAnalysis.growthPercent.toFixed(2)}%`);
  console.log(`Leak detected: ${leakAnalysis.hasLeak ? '❌ Yes' : '✅ No'}`);
  
  if (results.gc.collected > 0) {
    console.log(`\n🗑️  Garbage Collection:`);
    console.log(`Before GC: ${(results.gc.before / 1024 / 1024).toFixed(2)} MB`);
    console.log(`After GC: ${(results.gc.after / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Collected: ${(results.gc.collected / 1024 / 1024).toFixed(2)} MB`);
  }
  
  return leakAnalysis;
};

// Memory allocation test
const runMemoryAllocationTest = async () => {
  console.log('📦 Running memory allocation test...');
  
  const allocationSizes = [1024, 10240, 102400, 1024000]; // 1KB, 10KB, 100KB, 1MB
  const allocationResults = {};
  
  for (const size of allocationSizes) {
    console.log(`  Testing allocation size: ${size} bytes`);
    
    const startMemory = process.memoryUsage();
    const allocations = [];
    
    // Allocate memory
    for (let i = 0; i < 100; i++) {
      allocations.push(Buffer.alloc(size));
    }
    
    const endMemory = process.memoryUsage();
    const allocated = endMemory.heapUsed - startMemory.heapUsed;
    
    allocationResults[size] = {
      requested: size * 100,
      allocated,
      efficiency: (allocated / (size * 100)) * 100,
    };
    
    console.log(`    Requested: ${(size * 100 / 1024 / 1024).toFixed(2)} MB`);
    console.log(`    Allocated: ${(allocated / 1024 / 1024).toFixed(2)} MB`);
    console.log(`    Efficiency: ${allocationResults[size].efficiency.toFixed(2)}%`);
    
    // Clear allocations
    allocations.length = 0;
  }
  
  return allocationResults;
};

// Memory fragmentation test
const runMemoryFragmentationTest = async () => {
  console.log('🧩 Running memory fragmentation test...');
  
  const initialMemory = process.memoryUsage();
  const allocations = [];
  
  // Allocate and deallocate memory in different patterns
  for (let i = 0; i < 1000; i++) {
    // Allocate
    const size = Math.floor(Math.random() * 10000) + 1000;
    allocations.push(Buffer.alloc(size));
    
    // Randomly deallocate
    if (Math.random() < 0.3 && allocations.length > 0) {
      const index = Math.floor(Math.random() * allocations.length);
      allocations.splice(index, 1);
    }
    
    // Sample memory every 100 iterations
    if (i % 100 === 0) {
      sampleMemory();
    }
  }
  
  // Clear all allocations
  allocations.length = 0;
  forceGC();
  
  const finalMemory = process.memoryUsage();
  const fragmentation = finalMemory.heapUsed - initialMemory.heapUsed;
  
  console.log(`  Initial heap: ${(initialMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Final heap: ${(finalMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Fragmentation: ${(fragmentation / 1024 / 1024).toFixed(2)} MB`);
  
  return {
    initial: initialMemory.heapUsed,
    final: finalMemory.heapUsed,
    fragmentation,
  };
};

// Generate memory report
const generateMemoryReport = (stressResults, allocationResults, fragmentationResults) => {
  const report = {
    timestamp: new Date().toISOString(),
    config,
    results: {
      stress: stressResults,
      allocation: allocationResults,
      fragmentation: fragmentationResults,
      samples: results.samples,
      leaks: results.leaks,
      gc: results.gc,
    },
    analysis: {
      hasLeak: stressResults.hasLeak,
      memoryGrowth: stressResults.growthPercent,
      peakMemory: results.peak,
      fragmentation: fragmentationResults.fragmentation,
    },
    recommendations: [],
  };
  
  // Add recommendations
  if (stressResults.hasLeak) {
    report.recommendations.push('Memory leak detected. Review code for memory leaks.');
  }
  
  if (stressResults.growthPercent > 100) {
    report.recommendations.push('High memory growth. Consider memory optimization.');
  }
  
  if (fragmentationResults.fragmentation > 10 * 1024 * 1024) { // 10MB
    report.recommendations.push('High memory fragmentation. Consider memory pooling.');
  }
  
  if (results.peak > config.memoryThreshold) {
    report.recommendations.push('Peak memory usage exceeds threshold. Consider memory limits.');
  }
  
  // Save report
  const reportPath = path.join(__dirname, '..', '..', 'quality-reports', 'memory-report.json');
  const reportDir = path.dirname(reportPath);
  
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📁 Memory report saved to: ${reportPath}`);
  
  return report;
};

// Main memory test
const runMemoryTest = async () => {
  console.log('🧠 Starting memory test suite...');
  console.log(`Iterations: ${config.iterations}`);
  console.log(`Memory threshold: ${(config.memoryThreshold / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Leak threshold: ${config.leakThreshold}%`);
  console.log('');
  
  try {
    // Run stress test
    const stressResults = await runMemoryStressTest();
    
    // Run allocation test
    const allocationResults = await runMemoryAllocationTest();
    
    // Run fragmentation test
    const fragmentationResults = await runMemoryFragmentationTest();
    
    // Generate report
    const report = generateMemoryReport(stressResults, allocationResults, fragmentationResults);
    
    // Summary
    console.log('\n📊 Memory Test Summary:');
    console.log('======================');
    console.log(`Memory leak: ${stressResults.hasLeak ? '❌ Detected' : '✅ None'}`);
    console.log(`Memory growth: ${stressResults.growthPercent.toFixed(2)}%`);
    console.log(`Peak memory: ${(results.peak / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Fragmentation: ${(fragmentationResults.fragmentation / 1024 / 1024).toFixed(2)} MB`);
    
    if (report.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      report.recommendations.forEach(rec => console.log(`  - ${rec}`));
    }
    
    return report;
    
  } catch (error) {
    console.error('❌ Memory test failed:', error.message);
    throw error;
  }
};

// Run if called directly
if (require.main === module) {
  runMemoryTest().catch(error => {
    console.error('❌ Memory test failed:', error.message);
    process.exit(1);
  });
}

module.exports = {
  runMemoryTest,
  runMemoryStressTest,
  runMemoryAllocationTest,
  runMemoryFragmentationTest,
  detectMemoryLeaks,
  generateMemoryReport,
  config,
  results,
};
