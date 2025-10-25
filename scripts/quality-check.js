#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

// Quality check results
const results = {
  eslint: { passed: false, output: '' },
  prettier: { passed: false, output: '' },
  tests: { passed: false, output: '' },
  coverage: { passed: false, output: '' },
  security: { passed: false, output: '' },
};

// Helper functions
const log = (message, color = colors.white) => {
  console.log(`${color}${message}${colors.reset}`);
};

const runCommand = (command, description) => {
  try {
    log(`\n${colors.blue}Running ${description}...${colors.reset}`);
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    log(`${colors.green}✓ ${description} passed${colors.reset}`);
    return { success: true, output };
  } catch (error) {
    log(`${colors.red}✗ ${description} failed${colors.reset}`);
    return { success: false, output: error.stdout || error.stderr || error.message };
  }
};

const checkCoverage = () => {
  try {
    const coveragePath = path.join(__dirname, '..', 'coverage', 'coverage-summary.json');
    if (!fs.existsSync(coveragePath)) {
      return { success: false, output: 'Coverage report not found. Run tests first.' };
    }

    const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
    const total = coverage.total;
    
    const thresholds = {
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80,
    };

    const failed = [];
    for (const [metric, threshold] of Object.entries(thresholds)) {
      const percentage = total[metric].pct;
      if (percentage < threshold) {
        failed.push(`${metric}: ${percentage}% < ${threshold}%`);
      }
    }

    if (failed.length > 0) {
      return { success: false, output: `Coverage thresholds not met:\n${failed.join('\n')}` };
    }

    return { success: true, output: `Coverage thresholds met:\n${Object.entries(total).map(([k, v]) => `${k}: ${v.pct}%`).join('\n')}` };
  } catch (error) {
    return { success: false, output: error.message };
  }
};

const checkSecurity = () => {
  try {
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Check for known vulnerable packages
    const vulnerablePackages = [
      'lodash',
      'moment',
      'jquery',
      'express',
      'mongoose',
    ];

    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    const found = Object.keys(dependencies).filter(dep => vulnerablePackages.includes(dep));
    
    if (found.length > 0) {
      return { success: false, output: `Potentially vulnerable packages found: ${found.join(', ')}` };
    }

    return { success: true, output: 'No known vulnerable packages found' };
  } catch (error) {
    return { success: false, output: error.message };
  }
};

const generateReport = () => {
  const reportPath = path.join(__dirname, '..', 'quality-reports', 'quality-report.json');
  const reportDir = path.dirname(reportPath);
  
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const report = {
    timestamp: new Date().toISOString(),
    results,
    summary: {
      total: Object.keys(results).length,
      passed: Object.values(results).filter(r => r.passed).length,
      failed: Object.values(results).filter(r => !r.passed).length,
    },
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`\n${colors.cyan}Quality report saved to: ${reportPath}${colors.reset}`);
};

const main = async () => {
  log(`${colors.magenta}🔍 Running Quality Checks...${colors.reset}`);

  // Run ESLint
  const eslintResult = runCommand('npm run lint', 'ESLint');
  results.eslint = { passed: eslintResult.success, output: eslintResult.output };

  // Run Prettier check
  const prettierResult = runCommand('npm run format:check', 'Prettier');
  results.prettier = { passed: prettierResult.success, output: prettierResult.output };

  // Run tests
  const testResult = runCommand('npm run test:unit', 'Unit Tests');
  results.tests = { passed: testResult.success, output: testResult.output };

  // Check coverage
  const coverageResult = checkCoverage();
  results.coverage = { passed: coverageResult.success, output: coverageResult.output };

  // Check security
  const securityResult = checkSecurity();
  results.security = { passed: securityResult.success, output: securityResult.output };

  // Generate report
  generateReport();

  // Summary
  const total = Object.keys(results).length;
  const passed = Object.values(results).filter(r => r.passed).length;
  const failed = total - passed;

  log(`\n${colors.magenta}📊 Quality Check Summary:${colors.reset}`);
  log(`Total checks: ${total}`);
  log(`Passed: ${colors.green}${passed}${colors.reset}`);
  log(`Failed: ${colors.red}${failed}${colors.reset}`);

  if (failed > 0) {
    log(`\n${colors.red}❌ Quality check failed!${colors.reset}`);
    process.exit(1);
  } else {
    log(`\n${colors.green}✅ All quality checks passed!${colors.reset}`);
  }
};

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    log(`${colors.red}Error: ${error.message}${colors.reset}`);
    process.exit(1);
  });
}

module.exports = { main, results };
