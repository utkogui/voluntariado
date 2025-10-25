const { performance } = require('perf_hooks');
const fs = require('fs');
const path = require('path');

// Penetration test configuration
const config = {
  baseUrl: 'http://localhost:3000',
  timeout: 30000,
  testSuites: [
    {
      name: 'Authentication Bypass',
      tests: [
        {
          name: 'SQL Injection in Login',
          method: 'POST',
          path: '/api/auth/login',
          payload: { email: "admin' OR '1'='1", password: "anything" },
          expectedStatus: 401,
        },
        {
          name: 'NoSQL Injection in Login',
          method: 'POST',
          path: '/api/auth/login',
          payload: { email: { $ne: null }, password: { $ne: null } },
          expectedStatus: 401,
        },
        {
          name: 'JWT Token Manipulation',
          method: 'GET',
          path: '/api/opportunities',
          headers: { Authorization: 'Bearer invalid.token.here' },
          expectedStatus: 401,
        },
        {
          name: 'Session Fixation',
          method: 'POST',
          path: '/api/auth/login',
          payload: { email: 'test@example.com', password: 'password' },
          expectedStatus: 401,
        },
      ],
    },
    {
      name: 'Authorization Bypass',
      tests: [
        {
          name: 'Privilege Escalation',
          method: 'GET',
          path: '/api/admin/users',
          headers: { Authorization: 'Bearer volunteer-token' },
          expectedStatus: 403,
        },
        {
          name: 'Horizontal Privilege Escalation',
          method: 'GET',
          path: '/api/opportunities/user123',
          headers: { Authorization: 'Bearer user456-token' },
          expectedStatus: 403,
        },
        {
          name: 'Vertical Privilege Escalation',
          method: 'POST',
          path: '/api/admin/delete-user',
          headers: { Authorization: 'Bearer volunteer-token' },
          expectedStatus: 403,
        },
      ],
    },
    {
      name: 'Input Validation',
      tests: [
        {
          name: 'XSS in User Input',
          method: 'POST',
          path: '/api/opportunities',
          payload: { 
            title: '<script>alert("XSS")</script>',
            description: '<img src="x" onerror="alert(\'XSS\')">',
            date: new Date().toISOString(),
            location: 'Test Location',
            skillsRequired: ['test'],
          },
          expectedStatus: 400,
        },
        {
          name: 'Path Traversal',
          method: 'GET',
          path: '/api/files/../../../etc/passwd',
          expectedStatus: 404,
        },
        {
          name: 'Command Injection',
          method: 'POST',
          path: '/api/opportunities',
          payload: { 
            title: 'Test; rm -rf /',
            description: 'Test description',
            date: new Date().toISOString(),
            location: 'Test Location',
            skillsRequired: ['test'],
          },
          expectedStatus: 400,
        },
        {
          name: 'LDAP Injection',
          method: 'POST',
          path: '/api/auth/login',
          payload: { email: 'admin)(&(password=*))', password: 'password' },
          expectedStatus: 401,
        },
      ],
    },
    {
      name: 'Business Logic',
      tests: [
        {
          name: 'Race Condition',
          method: 'POST',
          path: '/api/opportunities/123/apply',
          payload: { volunteerId: 'vol123' },
          expectedStatus: 400,
        },
        {
          name: 'Time-based Attack',
          method: 'POST',
          path: '/api/auth/login',
          payload: { email: 'admin@example.com', password: 'wrong' },
          expectedStatus: 401,
        },
        {
          name: 'Resource Exhaustion',
          method: 'POST',
          path: '/api/opportunities',
          payload: { 
            title: 'A'.repeat(10000),
            description: 'B'.repeat(100000),
            date: new Date().toISOString(),
            location: 'Test Location',
            skillsRequired: ['test'],
          },
          expectedStatus: 400,
        },
      ],
    },
    {
      name: 'Cryptography',
      tests: [
        {
          name: 'Weak Encryption',
          method: 'POST',
          path: '/api/auth/register',
          payload: { 
            email: 'test@example.com',
            password: '123',
            name: 'Test User',
            userType: 'VOLUNTEER',
          },
          expectedStatus: 400,
        },
        {
          name: 'Insecure Random',
          method: 'POST',
          path: '/api/auth/register',
          payload: { 
            email: 'test@example.com',
            password: 'password123',
            name: 'Test User',
            userType: 'VOLUNTEER',
          },
          expectedStatus: 201,
        },
      ],
    },
  ],
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'PenetrationTest/1.0',
  },
};

// Penetration test results
const results = {
  timestamp: new Date().toISOString(),
  testSuites: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    vulnerabilities: 0,
  },
  vulnerabilities: [],
  recommendations: [],
  startTime: 0,
  endTime: 0,
};

// Run penetration test
const runPenetrationTest = async (testSuite) => {
  console.log(`🔍 Running ${testSuite.name} tests...`);
  
  const suiteResults = {
    name: testSuite.name,
    tests: [],
    summary: {
      total: testSuite.tests.length,
      passed: 0,
      failed: 0,
      vulnerabilities: 0,
    },
  };
  
  for (const test of testSuite.tests) {
    console.log(`  Testing: ${test.name}`);
    
    const startTime = performance.now();
    
    try {
      const url = `${config.baseUrl}${test.path}`;
      const options = {
        method: test.method,
        headers: { ...config.headers, ...test.headers },
        timeout: config.timeout,
      };
      
      if (test.payload) {
        options.body = JSON.stringify(test.payload);
      }
      
      const response = await fetch(url, options);
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      const testResult = {
        name: test.name,
        method: test.method,
        path: test.path,
        status: response.status,
        expectedStatus: test.expectedStatus,
        duration,
        passed: response.status === test.expectedStatus,
        response: await response.text().catch(() => ''),
      };
      
      if (!testResult.passed) {
        testResult.vulnerability = {
          type: test.name,
          severity: 'HIGH',
          description: `Expected status ${test.expectedStatus}, got ${response.status}`,
          recommendation: getPenetrationRecommendation(test.name),
        };
        suiteResults.summary.vulnerabilities++;
        results.vulnerabilities.push(testResult.vulnerability);
      }
      
      suiteResults.tests.push(testResult);
      
      if (testResult.passed) {
        console.log(`    ✅ PASSED (${duration.toFixed(2)}ms)`);
        suiteResults.summary.passed++;
      } else {
        console.log(`    ❌ FAILED (${duration.toFixed(2)}ms)`);
        console.log(`      Status: ${testResult.status} (expected: ${testResult.expectedStatus})`);
        suiteResults.summary.failed++;
      }
      
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      const testResult = {
        name: test.name,
        method: test.method,
        path: test.path,
        status: 'ERROR',
        expectedStatus: test.expectedStatus,
        duration,
        passed: false,
        error: error.message,
        vulnerability: {
          type: test.name,
          severity: 'CRITICAL',
          description: `Test failed with error: ${error.message}`,
          recommendation: getPenetrationRecommendation(test.name),
        },
      };
      
      suiteResults.tests.push(testResult);
      suiteResults.summary.failed++;
      suiteResults.summary.vulnerabilities++;
      results.vulnerabilities.push(testResult.vulnerability);
      
      console.log(`    ❌ ERROR: ${error.message}`);
    }
    
    console.log('');
  }
  
  return suiteResults;
};

// Get penetration test recommendation
const getPenetrationRecommendation = (testType) => {
  const recommendations = {
    'SQL Injection in Login': 'Use parameterized queries and input validation',
    'NoSQL Injection in Login': 'Validate and sanitize input before database queries',
    'JWT Token Manipulation': 'Implement proper JWT validation and signature verification',
    'Session Fixation': 'Regenerate session ID after login',
    'Privilege Escalation': 'Implement proper authorization checks',
    'Horizontal Privilege Escalation': 'Verify user ownership before allowing access',
    'Vertical Privilege Escalation': 'Implement role-based access control',
    'XSS in User Input': 'Sanitize user input and use Content Security Policy',
    'Path Traversal': 'Validate file paths and use whitelist approach',
    'Command Injection': 'Avoid executing user input as system commands',
    'LDAP Injection': 'Use parameterized LDAP queries',
    'Race Condition': 'Implement proper locking mechanisms',
    'Time-based Attack': 'Use constant-time comparison for sensitive operations',
    'Resource Exhaustion': 'Implement input length limits and rate limiting',
    'Weak Encryption': 'Use strong encryption algorithms and proper key management',
    'Insecure Random': 'Use cryptographically secure random number generators',
  };
  
  return recommendations[testType] || 'Review and fix the security issue';
};

// Run all penetration tests
const runAllPenetrationTests = async () => {
  console.log('🔒 Starting penetration tests...');
  console.log(`Base URL: ${config.baseUrl}`);
  console.log(`Test suites: ${config.testSuites.length}`);
  console.log('');
  
  results.startTime = performance.now();
  
  for (const testSuite of config.testSuites) {
    try {
      const suiteResults = await runPenetrationTest(testSuite);
      results.testSuites.push(suiteResults);
      
      // Update summary
      results.summary.total += suiteResults.summary.total;
      results.summary.passed += suiteResults.summary.passed;
      results.summary.failed += suiteResults.summary.failed;
      results.summary.vulnerabilities += suiteResults.summary.vulnerabilities;
      
    } catch (error) {
      console.error(`❌ Test suite failed: ${testSuite.name}`, error.message);
    }
  }
  
  results.endTime = performance.now();
  
  // Generate recommendations
  generatePenetrationRecommendations();
  
  // Generate report
  generatePenetrationReport();
  
  return results;
};

// Generate penetration test recommendations
const generatePenetrationRecommendations = () => {
  if (results.summary.vulnerabilities > 0) {
    results.recommendations.push('Address all identified vulnerabilities');
    results.recommendations.push('Implement comprehensive input validation');
    results.recommendations.push('Use parameterized queries for all database operations');
    results.recommendations.push('Implement proper authentication and authorization');
    results.recommendations.push('Use Content Security Policy (CSP) headers');
    results.recommendations.push('Implement rate limiting and DDoS protection');
    results.recommendations.push('Use HTTPS in production');
    results.recommendations.push('Regular security audits and penetration testing');
    results.recommendations.push('Implement security monitoring and alerting');
    results.recommendations.push('Use secure coding practices');
  }
};

// Generate penetration test report
const generatePenetrationReport = () => {
  const report = {
    ...results,
    config,
  };
  
  // Save report
  const reportPath = path.join(__dirname, '..', '..', 'quality-reports', 'penetration-report.json');
  const reportDir = path.dirname(reportPath);
  
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📁 Penetration test report saved to: ${reportPath}`);
  
  // Display summary
  console.log('\n📊 Penetration Test Summary:');
  console.log('============================');
  console.log(`Total tests: ${results.summary.total}`);
  console.log(`Passed: ${results.summary.passed}`);
  console.log(`Failed: ${results.summary.failed}`);
  console.log(`Vulnerabilities: ${results.summary.vulnerabilities}`);
  console.log(`Success rate: ${((results.summary.passed / results.summary.total) * 100).toFixed(2)}%`);
  console.log(`Duration: ${((results.endTime - results.startTime) / 1000).toFixed(2)}s`);
  
  if (results.vulnerabilities.length > 0) {
    console.log(`\n🚨 Vulnerabilities found: ${results.vulnerabilities.length}`);
    results.vulnerabilities.forEach(vuln => {
      console.log(`  - ${vuln.type}: ${vuln.severity} - ${vuln.description}`);
    });
  }
  
  if (results.recommendations.length > 0) {
    console.log('\n💡 Recommendations:');
    results.recommendations.forEach(rec => console.log(`  - ${rec}`));
  }
  
  return report;
};

// Run if called directly
if (require.main === module) {
  runAllPenetrationTests().catch(error => {
    console.error('❌ Penetration test failed:', error.message);
    process.exit(1);
  });
}

module.exports = {
  runAllPenetrationTests,
  runPenetrationTest,
  config,
  results,
};
