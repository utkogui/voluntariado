# Performance Tests

This directory contains performance and load tests for the volunteer application.

## Test Types

### 1. Load Tests (`load-test.js`)
- **Purpose**: Test application under normal and high load conditions
- **Tools**: autocannon
- **Metrics**: Response time, throughput, error rate
- **Thresholds**:
  - Max average response time: 500ms
  - Min success rate: 95%
  - Min requests per second: 10

### 2. Performance Tests (`performance-test.js`)
- **Purpose**: Measure API and database performance
- **Metrics**: Response time, memory usage, CPU usage
- **Thresholds**:
  - Max response time: 500ms
  - Max memory usage: 100MB
  - Max CPU usage: 80%

### 3. Benchmark Tests (`benchmark.js`)
- **Purpose**: Compare performance of different operations
- **Metrics**: Execution time, success rate, variance
- **Operations**: API calls, database queries, JSON serialization, password hashing, JWT generation

### 4. Memory Tests (`memory-test.js`)
- **Purpose**: Detect memory leaks and analyze memory usage
- **Metrics**: Memory growth, fragmentation, allocation efficiency
- **Thresholds**:
  - Max memory growth: 50%
  - Max memory usage: 100MB
  - Max fragmentation: 10MB

## Running Tests

### Prerequisites
```bash
# Install dependencies
npm install

# Install performance testing tools
npm install --save-dev autocannon

# Start the application
npm run dev
```

### Run All Performance Tests
```bash
# Run all performance tests
npm run test:performance

# Run specific test types
npm run test:load
npm run test:benchmark
npm run test:memory
```

### Individual Test Files
```bash
# Load test
node tests/performance/load-test.js

# Performance test
node tests/performance/performance-test.js

# Benchmark test
node tests/performance/benchmark.js

# Memory test
node tests/performance/memory-test.js
```

## Test Configuration

### Load Test Configuration
```javascript
const config = {
  url: 'http://localhost:3000',
  connections: 10,        // Number of concurrent connections
  pipelining: 1,          // Number of pipelined requests
  duration: 30,           // Test duration in seconds
  requests: [             // Request patterns
    { method: 'GET', path: '/api/opportunities' },
    { method: 'POST', path: '/api/auth/login', body: {...} },
  ],
};
```

### Performance Test Configuration
```javascript
const config = {
  iterations: 100,        // Number of test iterations
  warmupIterations: 10,   // Warmup iterations
  timeout: 30000,         // Test timeout in milliseconds
  thresholds: {
    maxMemoryUsage: 100 * 1024 * 1024,  // 100MB
    maxCpuUsage: 80,                     // 80%
    maxResponseTime: 500,                // 500ms
    maxConcurrentRequests: 1000,
  },
};
```

### Memory Test Configuration
```javascript
const config = {
  iterations: 1000,       // Number of iterations
  warmupIterations: 100,  // Warmup iterations
  timeout: 60000,         // Test timeout in milliseconds
  memoryThreshold: 100 * 1024 * 1024,  // 100MB
  leakThreshold: 50,      // 50% growth threshold
};
```

## Test Results

### Output Files
- `quality-reports/performance-report.json` - Performance test results
- `quality-reports/benchmark-report.json` - Benchmark test results
- `quality-reports/memory-report.json` - Memory test results
- `coverage/` - Coverage reports

### Metrics Explained

#### Response Time
- **Average**: Mean response time across all requests
- **Min/Max**: Minimum and maximum response times
- **95th/99th Percentile**: Response time thresholds for 95% and 99% of requests

#### Throughput
- **Requests per Second**: Number of requests processed per second
- **Concurrent Requests**: Number of simultaneous requests

#### Memory Usage
- **RSS**: Resident Set Size - total memory used
- **Heap Used**: Memory used by JavaScript objects
- **Heap Total**: Total heap memory allocated
- **External**: Memory used by C++ objects

#### Error Rate
- **Success Rate**: Percentage of successful requests
- **Error Rate**: Percentage of failed requests
- **Error Types**: Categorization of different error types

## Performance Optimization

### Common Issues
1. **Slow Database Queries**
   - Add database indexes
   - Optimize query patterns
   - Use connection pooling

2. **Memory Leaks**
   - Review event listeners
   - Clear timers and intervals
   - Properly dispose of resources

3. **High CPU Usage**
   - Optimize algorithms
   - Use caching
   - Implement rate limiting

4. **Slow API Responses**
   - Add response caching
   - Optimize data serialization
   - Use compression

### Best Practices
1. **Regular Testing**
   - Run performance tests in CI/CD
   - Monitor performance metrics
   - Set up alerts for performance degradation

2. **Load Testing**
   - Test with realistic data volumes
   - Simulate peak usage patterns
   - Test failure scenarios

3. **Memory Management**
   - Monitor memory usage patterns
   - Implement memory limits
   - Use memory profiling tools

4. **Database Optimization**
   - Regular query analysis
   - Index optimization
   - Connection pool tuning

## Troubleshooting

### Common Issues

#### Test Failures
```bash
# Check if application is running
curl http://localhost:3000/api/opportunities

# Check test configuration
node -e "console.log(require('./tests/performance/load-test.js').config)"

# Run with verbose output
DEBUG=* node tests/performance/load-test.js
```

#### Memory Issues
```bash
# Run with garbage collection
node --expose-gc tests/performance/memory-test.js

# Check memory usage
node -e "console.log(process.memoryUsage())"

# Profile memory usage
node --inspect tests/performance/memory-test.js
```

#### Performance Issues
```bash
# Profile CPU usage
node --prof tests/performance/performance-test.js

# Analyze profile
node --prof-process isolate-*.log > profile.txt
```

## Continuous Integration

### GitHub Actions
```yaml
name: Performance Tests
on: [push, pull_request]
jobs:
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run test:performance
```

### Jenkins Pipeline
```groovy
pipeline {
  agent any
  stages {
    stage('Performance Tests') {
      steps {
        sh 'npm install'
        sh 'npm run test:performance'
      }
    }
  }
}
```

## Monitoring

### Real-time Monitoring
- Use APM tools (New Relic, DataDog, etc.)
- Monitor key performance indicators
- Set up alerts for performance thresholds

### Logging
- Log performance metrics
- Track slow queries
- Monitor error rates

### Dashboards
- Create performance dashboards
- Track trends over time
- Compare performance across versions
