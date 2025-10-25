const { performance } = require('perf_hooks');
const fs = require('fs');
const path = require('path');

// Security test configuration
const config = {
  baseUrl: 'http://localhost:3000',
  timeout: 30000,
  testCases: [
    {
      name: 'SQL Injection',
      method: 'POST',
      path: '/api/auth/login',
      payload: { email: "admin'; DROP TABLE users; --", password: 'password' },
      expectedStatus: 400,
    },
    {
      name: 'XSS Attack',
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
      name: 'NoSQL Injection',
      method: 'GET',
      path: '/api/opportunities/search?keyword={"$ne": null}',
      expectedStatus: 400,
    },
    {
      name: 'Path Traversal',
      method: 'GET',
      path: '/api/opportunities/../../../etc/passwd',
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
      expectedStatus: 400,
    },
    {
      name: 'XML External Entity (XXE)',
      method: 'POST',
      path: '/api/opportunities',
      payload: { 
        title: 'Test',
        description: '<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><foo>&xxe;</foo>',
        date: new Date().toISOString(),
        location: 'Test Location',
        skillsRequired: ['test'],
      },
      expectedStatus: 400,
    },
    {
      name: 'Server-Side Request Forgery (SSRF)',
      method: 'POST',
      path: '/api/opportunities',
      payload: { 
        title: 'Test',
        description: 'Test description',
        date: new Date().toISOString(),
        location: 'http://localhost:22',
        skillsRequired: ['test'],
      },
      expectedStatus: 400,
    },
    {
      name: 'Insecure Direct Object Reference',
      method: 'GET',
      path: '/api/opportunities/999999',
      expectedStatus: 404,
    },
    {
      name: 'Mass Assignment',
      method: 'POST',
      path: '/api/opportunities',
      payload: { 
        title: 'Test',
        description: 'Test description',
        date: new Date().toISOString(),
        location: 'Test Location',
        skillsRequired: ['test'],
        isAdmin: true,
        role: 'admin',
      },
      expectedStatus: 400,
    },
  ],
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'SecurityTest/1.0',
  },
};

// Security test results
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  vulnerabilities: [],
  recommendations: [],
  startTime: 0,
  endTime: 0,
};

// Run security test
const runSecurityTest = async (testCase) => {
  const startTime = performance.now();
  
  try {
    const url = `${config.baseUrl}${testCase.path}`;
    const options = {
      method: testCase.method,
      headers: config.headers,
      timeout: config.timeout,
    };
    
    if (testCase.payload) {
      options.body = JSON.stringify(testCase.payload);
    }
    
    const response = await fetch(url, options);
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    const result = {
      name: testCase.name,
      method: testCase.method,
      path: testCase.path,
      status: response.status,
      expectedStatus: testCase.expectedStatus,
      duration,
      passed: response.status === testCase.expectedStatus,
      response: await response.text().catch(() => ''),
    };
    
    if (!result.passed) {
      result.vulnerability = {
        type: testCase.name,
        severity: 'HIGH',
        description: `Expected status ${testCase.expectedStatus}, got ${response.status}`,
        recommendation: getRecommendation(testCase.name),
      };
      results.vulnerabilities.push(result.vulnerability);
    }
    
    return result;
    
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    return {
      name: testCase.name,
      method: testCase.method,
      path: testCase.path,
      status: 'ERROR',
      expectedStatus: testCase.expectedStatus,
      duration,
      passed: false,
      error: error.message,
      vulnerability: {
        type: testCase.name,
        severity: 'CRITICAL',
        description: `Test failed with error: ${error.message}`,
        recommendation: getRecommendation(testCase.name),
      },
    };
  }
};

// Get security recommendation
const getRecommendation = (testType) => {
  const recommendations = {
    'SQL Injection': 'Use parameterized queries and input validation',
    'XSS Attack': 'Sanitize user input and use Content Security Policy',
    'NoSQL Injection': 'Validate and sanitize input before database queries',
    'Path Traversal': 'Validate file paths and use whitelist approach',
    'Command Injection': 'Avoid executing user input as system commands',
    'LDAP Injection': 'Use parameterized LDAP queries',
    'XML External Entity (XXE)': 'Disable XML external entity processing',
    'Server-Side Request Forgery (SSRF)': 'Validate and whitelist allowed URLs',
    'Insecure Direct Object Reference': 'Implement proper authorization checks',
    'Mass Assignment': 'Use allowlists for object properties',
  };
  
  return recommendations[testType] || 'Review and fix the security issue';
};

// Run all security tests
const runAllSecurityTests = async () => {
  console.log('🔒 Starting security tests...');
  console.log(`Base URL: ${config.baseUrl}`);
  console.log(`Test cases: ${config.testCases.length}`);
  console.log('');
  
  results.startTime = performance.now();
  results.total = config.testCases.length;
  
  for (const testCase of config.testCases) {
    console.log(`Testing: ${testCase.name}`);
    
    try {
      const result = await runSecurityTest(testCase);
      
      if (result.passed) {
        console.log(`  ✅ PASSED (${result.duration.toFixed(2)}ms)`);
        results.passed++;
      } else {
        console.log(`  ❌ FAILED (${result.duration.toFixed(2)}ms)`);
        console.log(`    Status: ${result.status} (expected: ${result.expectedStatus})`);
        if (result.error) {
          console.log(`    Error: ${result.error}`);
        }
        results.failed++;
      }
      
    } catch (error) {
      console.log(`  ❌ ERROR: ${error.message}`);
      results.failed++;
    }
    
    console.log('');
  }
  
  results.endTime = performance.now();
  
  // Generate report
  generateSecurityReport();
  
  return results;
};

// Generate security report
const generateSecurityReport = () => {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: results.total,
      passed: results.passed,
      failed: results.failed,
      successRate: (results.passed / results.total) * 100,
      duration: results.endTime - results.startTime,
    },
    vulnerabilities: results.vulnerabilities,
    recommendations: results.recommendations,
    config,
  };
  
  // Add general recommendations
  if (results.vulnerabilities.length > 0) {
    report.recommendations.push('Implement input validation and sanitization');
    report.recommendations.push('Use parameterized queries for database operations');
    report.recommendations.push('Implement proper error handling');
    report.recommendations.push('Use Content Security Policy (CSP) headers');
    report.recommendations.push('Implement rate limiting');
    report.recommendations.push('Use HTTPS in production');
    report.recommendations.push('Regular security audits and penetration testing');
  }
  
  // Save report
  const reportPath = path.join(__dirname, '..', '..', 'quality-reports', 'security-report.json');
  const reportDir = path.dirname(reportPath);
  
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📁 Security report saved to: ${reportPath}`);
  
  // Display summary
  console.log('📊 Security Test Summary:');
  console.log('========================');
  console.log(`Total tests: ${results.total}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Success rate: ${((results.passed / results.total) * 100).toFixed(2)}%`);
  console.log(`Duration: ${((results.endTime - results.startTime) / 1000).toFixed(2)}s`);
  
  if (results.vulnerabilities.length > 0) {
    console.log(`\n🚨 Vulnerabilities found: ${results.vulnerabilities.length}`);
    results.vulnerabilities.forEach(vuln => {
      console.log(`  - ${vuln.type}: ${vuln.severity} - ${vuln.description}`);
    });
  }
  
  if (report.recommendations.length > 0) {
    console.log('\n💡 Recommendations:');
    report.recommendations.forEach(rec => console.log(`  - ${rec}`));
  }
  
  return report;
};

// Run if called directly
if (require.main === module) {
  runAllSecurityTests().catch(error => {
    console.error('❌ Security test failed:', error.message);
    process.exit(1);
  });
}

module.exports = {
  runAllSecurityTests,
  runSecurityTest,
  config,
  results,
};
