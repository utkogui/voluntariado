#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

const log = (message, color = colors.white) => {
  console.log(`${color}${message}${colors.reset}`);
};

const generateCoverageReport = () => {
  try {
    log(`${colors.blue}Generating coverage report...${colors.reset}`);
    
    // Run tests with coverage
    execSync('npm run test:coverage', { stdio: 'inherit' });
    
    // Check if coverage directory exists
    const coverageDir = path.join(__dirname, '..', 'coverage');
    if (!fs.existsSync(coverageDir)) {
      throw new Error('Coverage directory not found');
    }

    // Read coverage summary
    const summaryPath = path.join(coverageDir, 'coverage-summary.json');
    if (!fs.existsSync(summaryPath)) {
      throw new Error('Coverage summary not found');
    }

    const coverage = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
    const total = coverage.total;

    // Display coverage summary
    log(`\n${colors.magenta}📊 Coverage Summary:${colors.reset}`);
    log(`Statements: ${total.statements.pct}% (${total.statements.covered}/${total.statements.total})`);
    log(`Branches: ${total.branches.pct}% (${total.branches.covered}/${total.branches.total})`);
    log(`Functions: ${total.functions.pct}% (${total.functions.covered}/${total.functions.total})`);
    log(`Lines: ${total.lines.pct}% (${total.lines.covered}/${total.lines.total})`);

    // Check thresholds
    const thresholds = {
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80,
    };

    let allPassed = true;
    for (const [metric, threshold] of Object.entries(thresholds)) {
      const percentage = total[metric].pct;
      const status = percentage >= threshold ? '✓' : '✗';
      const color = percentage >= threshold ? colors.green : colors.red;
      log(`${status} ${metric}: ${color}${percentage}%${colors.reset} (threshold: ${threshold}%)`);
      
      if (percentage < threshold) {
        allPassed = false;
      }
    }

    // Generate HTML report
    log(`\n${colors.blue}Generating HTML report...${colors.reset}`);
    const htmlReportPath = path.join(coverageDir, 'lcov-report', 'index.html');
    if (fs.existsSync(htmlReportPath)) {
      log(`${colors.green}HTML report generated: ${htmlReportPath}${colors.reset}`);
    }

    // Generate LCOV report
    const lcovPath = path.join(coverageDir, 'lcov.info');
    if (fs.existsSync(lcovPath)) {
      log(`${colors.green}LCOV report generated: ${lcovPath}${colors.reset}`);
    }

    // Generate Cobertura report
    const coberturaPath = path.join(coverageDir, 'cobertura-coverage.xml');
    if (fs.existsSync(coberturaPath)) {
      log(`${colors.green}Cobertura report generated: ${coberturaPath}${colors.reset}`);
    }

    // Generate Clover report
    const cloverPath = path.join(coverageDir, 'clover.xml');
    if (fs.existsSync(cloverPath)) {
      log(`${colors.green}Clover report generated: ${cloverPath}${colors.reset}`);
    }

    // Summary
    if (allPassed) {
      log(`\n${colors.green}✅ All coverage thresholds met!${colors.reset}`);
    } else {
      log(`\n${colors.red}❌ Some coverage thresholds not met!${colors.reset}`);
      process.exit(1);
    }

  } catch (error) {
    log(`${colors.red}Error generating coverage report: ${error.message}${colors.reset}`);
    process.exit(1);
  }
};

const main = () => {
  log(`${colors.magenta}🔍 Generating Coverage Report...${colors.reset}`);
  generateCoverageReport();
};

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { generateCoverageReport };
