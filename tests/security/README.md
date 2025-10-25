# Security Tests

This directory contains security tests and vulnerability scans for the volunteer application.

## Test Types

### 1. Security Tests (`security-test.js`)
- **Purpose**: Test for common security vulnerabilities
- **Tests**: SQL injection, XSS, NoSQL injection, path traversal, command injection, etc.
- **Thresholds**: All tests should return expected status codes

### 2. Vulnerability Scans (`vulnerability-scan.js`)
- **Purpose**: Scan for known vulnerabilities in dependencies
- **Tools**: npm audit, Snyk, Retire.js, Safety, Bandit, Semgrep
- **Severity Levels**: CRITICAL, HIGH, MODERATE, LOW

### 3. Penetration Tests (`penetration-test.js`)
- **Purpose**: Simulate real-world attacks
- **Test Suites**: Authentication bypass, authorization bypass, input validation, business logic, cryptography
- **Focus**: Business logic flaws and advanced attack vectors

## Running Tests

### Prerequisites
```bash
# Install dependencies
npm install

# Install security testing tools
npm install --save-dev snyk retire safety bandit semgrep

# Start the application
npm run dev
```

### Run All Security Tests
```bash
# Run all security tests
npm run test:security

# Run specific test types
npm run test:security:basic
npm run test:security:vulnerability
npm run test:security:penetration
```

### Individual Test Files
```bash
# Basic security tests
node tests/security/security-test.js

# Vulnerability scans
node tests/security/vulnerability-scan.js

# Penetration tests
node tests/security/penetration-test.js
```

## Test Configuration

### Security Test Configuration
```javascript
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
    // ... more test cases
  ],
};
```

### Vulnerability Scan Configuration
```javascript
const config = {
  scanTypes: [
    'npm-audit',
    'snyk',
    'retire',
    'safety',
    'bandit',
    'semgrep',
  ],
  severityLevels: ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'],
  excludePatterns: [
    'node_modules/**',
    'coverage/**',
    'dist/**',
    'build/**',
  ],
};
```

### Penetration Test Configuration
```javascript
const config = {
  baseUrl: 'http://localhost:3000',
  timeout: 30000,
  testSuites: [
    {
      name: 'Authentication Bypass',
      tests: [
        // ... test cases
      ],
    },
    // ... more test suites
  ],
};
```

## Test Results

### Output Files
- `quality-reports/security-report.json` - Basic security test results
- `quality-reports/vulnerability-report.json` - Vulnerability scan results
- `quality-reports/penetration-report.json` - Penetration test results

### Metrics Explained

#### Security Test Metrics
- **Total Tests**: Number of security tests run
- **Passed**: Number of tests that passed (vulnerability not found)
- **Failed**: Number of tests that failed (vulnerability found)
- **Success Rate**: Percentage of tests that passed

#### Vulnerability Scan Metrics
- **Total Vulnerabilities**: Total number of vulnerabilities found
- **Critical**: Number of critical severity vulnerabilities
- **High**: Number of high severity vulnerabilities
- **Moderate**: Number of moderate severity vulnerabilities
- **Low**: Number of low severity vulnerabilities

#### Penetration Test Metrics
- **Test Suites**: Number of penetration test suites
- **Vulnerabilities**: Number of vulnerabilities found
- **Attack Vectors**: Types of attacks tested
- **Success Rate**: Percentage of tests that passed

## Security Best Practices

### Input Validation
1. **Validate all input** on both client and server side
2. **Sanitize user input** before processing
3. **Use whitelist approach** for allowed values
4. **Implement length limits** for all input fields

### Authentication & Authorization
1. **Use strong passwords** with complexity requirements
2. **Implement multi-factor authentication** where possible
3. **Use JWT tokens** with proper expiration
4. **Implement role-based access control**

### Database Security
1. **Use parameterized queries** to prevent SQL injection
2. **Implement proper indexing** for performance
3. **Use connection pooling** for security
4. **Encrypt sensitive data** at rest

### API Security
1. **Use HTTPS** for all communications
2. **Implement rate limiting** to prevent abuse
3. **Use CORS** properly configured
4. **Implement proper error handling**

### Infrastructure Security
1. **Keep dependencies updated** regularly
2. **Use security headers** (CSP, HSTS, etc.)
3. **Implement logging and monitoring**
4. **Use secure configuration** for all services

## Common Vulnerabilities

### OWASP Top 10
1. **Injection** - SQL, NoSQL, LDAP, etc.
2. **Broken Authentication** - Weak passwords, session management
3. **Sensitive Data Exposure** - Unencrypted data, weak encryption
4. **XML External Entities (XXE)** - XML processing vulnerabilities
5. **Broken Access Control** - Authorization bypass
6. **Security Misconfiguration** - Default settings, unnecessary features
7. **Cross-Site Scripting (XSS)** - Client-side code injection
8. **Insecure Deserialization** - Object deserialization vulnerabilities
9. **Using Components with Known Vulnerabilities** - Outdated dependencies
10. **Insufficient Logging & Monitoring** - Lack of security visibility

### Additional Vulnerabilities
- **Race Conditions** - Concurrent access issues
- **Time-based Attacks** - Timing attack vulnerabilities
- **Resource Exhaustion** - DoS through resource consumption
- **Business Logic Flaws** - Application-specific vulnerabilities
- **Cryptographic Failures** - Weak encryption, poor key management

## Security Tools

### Static Analysis
- **ESLint Security Plugin** - JavaScript security rules
- **SonarQube** - Code quality and security analysis
- **Semgrep** - Static analysis for security issues

### Dynamic Analysis
- **OWASP ZAP** - Web application security scanner
- **Burp Suite** - Web vulnerability scanner
- **Nessus** - Network vulnerability scanner

### Dependency Scanning
- **npm audit** - Node.js dependency vulnerabilities
- **Snyk** - Comprehensive vulnerability scanning
- **Retire.js** - JavaScript library vulnerabilities
- **Safety** - Python dependency vulnerabilities

### Penetration Testing
- **Metasploit** - Exploitation framework
- **Nmap** - Network discovery and security auditing
- **Wireshark** - Network protocol analyzer

## Continuous Security

### CI/CD Integration
```yaml
name: Security Tests
on: [push, pull_request]
jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run test:security
      - run: npm audit --audit-level moderate
```

### Monitoring
- **Security alerts** for critical vulnerabilities
- **Dependency updates** with security patches
- **Log analysis** for suspicious activities
- **Performance monitoring** for anomalies

### Incident Response
1. **Identify** the security incident
2. **Contain** the threat
3. **Eradicate** the vulnerability
4. **Recover** from the incident
5. **Learn** from the experience

## Troubleshooting

### Common Issues

#### Test Failures
```bash
# Check if application is running
curl http://localhost:3000/api/opportunities

# Check test configuration
node -e "console.log(require('./tests/security/security-test.js').config)"

# Run with verbose output
DEBUG=* node tests/security/security-test.js
```

#### Vulnerability Scans
```bash
# Update npm audit database
npm audit fix

# Check Snyk status
snyk test

# Update dependencies
npm update
```

#### Penetration Tests
```bash
# Check authentication
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Check authorization
curl -H "Authorization: Bearer token" http://localhost:3000/api/opportunities
```

## Security Checklist

### Development
- [ ] Input validation implemented
- [ ] Authentication secure
- [ ] Authorization proper
- [ ] Data encrypted
- [ ] Dependencies updated
- [ ] Security headers set
- [ ] Error handling secure
- [ ] Logging implemented

### Testing
- [ ] Security tests written
- [ ] Vulnerability scans run
- [ ] Penetration tests performed
- [ ] Code review completed
- [ ] Security audit done

### Deployment
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Monitoring set up
- [ ] Backup secured
- [ ] Access controlled
- [ ] Updates automated
