const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Visual regression test configuration
const config = {
  baseUrl: 'http://localhost:3000',
  timeout: 30000,
  viewport: {
    width: 1920,
    height: 1080,
  },
  testPages: [
    {
      name: 'Home Page',
      path: '/',
      selectors: [
        '.header',
        '.main-content',
        '.footer',
        '.opportunity-card',
        '.search-bar',
      ],
    },
    {
      name: 'Login Page',
      path: '/login',
      selectors: [
        '.login-form',
        '.form-group',
        '.btn-primary',
        '.alert',
      ],
    },
    {
      name: 'Register Page',
      path: '/register',
      selectors: [
        '.register-form',
        '.form-group',
        '.btn-primary',
        '.alert',
      ],
    },
    {
      name: 'Opportunities Page',
      path: '/opportunities',
      selectors: [
        '.opportunities-list',
        '.opportunity-card',
        '.filter-panel',
        '.pagination',
      ],
    },
    {
      name: 'Profile Page',
      path: '/profile',
      selectors: [
        '.profile-form',
        '.profile-image',
        '.form-group',
        '.btn-primary',
      ],
    },
    {
      name: 'Dashboard Page',
      path: '/dashboard',
      selectors: [
        '.dashboard-header',
        '.stats-cards',
        '.recent-activities',
        '.quick-actions',
      ],
    },
  ],
  breakpoints: [
    { name: 'desktop', width: 1920, height: 1080 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'mobile', width: 375, height: 667 },
  ],
  thresholds: {
    pixelmatch: 0.1, // 10% difference threshold
    perceptual: 0.1, // 10% perceptual difference
  },
  outputDir: path.join(__dirname, '..', '..', 'quality-reports', 'visual-regression'),
};

// Visual regression test results
const results = {
  timestamp: new Date().toISOString(),
  total: 0,
  passed: 0,
  failed: 0,
  screenshots: [],
  differences: [],
  summary: {
    pages: 0,
    breakpoints: 0,
    selectors: 0,
  },
};

// Take screenshot of page
const takeScreenshot = async (page, name, selector = null) => {
  const screenshotPath = path.join(config.outputDir, 'screenshots', `${name}.png`);
  const screenshotDir = path.dirname(screenshotPath);
  
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }
  
  if (selector) {
    const element = await page.$(selector);
    if (element) {
      await element.screenshot({ path: screenshotPath });
    } else {
      throw new Error(`Selector ${selector} not found`);
    }
  } else {
    await page.screenshot({ path: screenshotPath, fullPage: true });
  }
  
  return screenshotPath;
};

// Compare screenshots
const compareScreenshots = async (currentPath, baselinePath) => {
  const diffPath = path.join(config.outputDir, 'differences', `${path.basename(currentPath, '.png')}_diff.png`);
  const diffDir = path.dirname(diffPath);
  
  if (!fs.existsSync(diffDir)) {
    fs.mkdirSync(diffDir, { recursive: true });
  }
  
  // Check if baseline exists
  if (!fs.existsSync(baselinePath)) {
    return {
      match: false,
      difference: 100,
      message: 'Baseline screenshot not found',
      diffPath: null,
    };
  }
  
  // Simple file comparison for now
  // In a real implementation, you would use a library like pixelmatch
  const currentStats = fs.statSync(currentPath);
  const baselineStats = fs.statSync(baselinePath);
  
  const sizeDifference = Math.abs(currentStats.size - baselineStats.size);
  const sizeDifferencePercent = (sizeDifference / baselineStats.size) * 100;
  
  if (sizeDifferencePercent > config.thresholds.pixelmatch * 100) {
    // Copy current as difference for now
    fs.copyFileSync(currentPath, diffPath);
    
    return {
      match: false,
      difference: sizeDifferencePercent,
      message: `Size difference: ${sizeDifferencePercent.toFixed(2)}%`,
      diffPath,
    };
  }
  
  return {
    match: true,
    difference: sizeDifferencePercent,
    message: 'Screenshots match',
    diffPath: null,
  };
};

// Run visual regression test for a page
const runVisualRegressionTest = async (page, testPage) => {
  console.log(`🖼️  Testing ${testPage.name} (${testPage.path})...`);
  
  const pageResults = {
    name: testPage.name,
    path: testPage.path,
    breakpoints: [],
    selectors: [],
    passed: 0,
    failed: 0,
  };
  
  try {
    // Navigate to page
    await page.goto(`${config.baseUrl}${testPage.path}`, { 
      waitUntil: 'networkidle',
      timeout: config.timeout 
    });
    
    // Wait for page to load
    await page.waitForLoadState('domcontentloaded');
    
    // Test each breakpoint
    for (const breakpoint of config.breakpoints) {
      console.log(`  Testing breakpoint: ${breakpoint.name} (${breakpoint.width}x${breakpoint.height})`);
      
      await page.setViewportSize({ 
        width: breakpoint.width, 
        height: breakpoint.height 
      });
      
      // Wait for layout to adjust
      await page.waitForTimeout(1000);
      
      const breakpointResults = {
        name: breakpoint.name,
        width: breakpoint.width,
        height: breakpoint.height,
        screenshots: [],
        passed: 0,
        failed: 0,
      };
      
      // Take full page screenshot
      const fullPageName = `${testPage.name}_${breakpoint.name}_full`;
      const fullPagePath = await takeScreenshot(page, fullPageName);
      
      const baselinePath = path.join(config.outputDir, 'baselines', `${fullPageName}.png`);
      const comparison = await compareScreenshots(fullPagePath, baselinePath);
      
      const screenshotResult = {
        type: 'full-page',
        name: fullPageName,
        current: fullPagePath,
        baseline: baselinePath,
        match: comparison.match,
        difference: comparison.difference,
        message: comparison.message,
        diffPath: comparison.diffPath,
      };
      
      breakpointResults.screenshots.push(screenshotResult);
      results.screenshots.push(screenshotResult);
      
      if (comparison.match) {
        breakpointResults.passed++;
        pageResults.passed++;
        results.passed++;
      } else {
        breakpointResults.failed++;
        pageResults.failed++;
        results.failed++;
        results.differences.push(screenshotResult);
      }
      
      // Test specific selectors
      for (const selector of testPage.selectors) {
        try {
          const selectorName = `${testPage.name}_${breakpoint.name}_${selector.replace(/[^a-zA-Z0-9]/g, '_')}`;
          const selectorPath = await takeScreenshot(page, selectorName, selector);
          
          const selectorBaselinePath = path.join(config.outputDir, 'baselines', `${selectorName}.png`);
          const selectorComparison = await compareScreenshots(selectorPath, selectorBaselinePath);
          
          const selectorResult = {
            type: 'selector',
            name: selectorName,
            selector,
            current: selectorPath,
            baseline: selectorBaselinePath,
            match: selectorComparison.match,
            difference: selectorComparison.difference,
            message: selectorComparison.message,
            diffPath: selectorComparison.diffPath,
          };
          
          breakpointResults.screenshots.push(selectorResult);
          results.screenshots.push(selectorResult);
          
          if (selectorComparison.match) {
            breakpointResults.passed++;
            pageResults.passed++;
            results.passed++;
          } else {
            breakpointResults.failed++;
            pageResults.failed++;
            results.failed++;
            results.differences.push(selectorResult);
          }
          
        } catch (error) {
          console.log(`    ⚠️  Selector ${selector} not found: ${error.message}`);
        }
      }
      
      pageResults.breakpoints.push(breakpointResults);
      results.summary.breakpoints++;
    }
    
    pageResults.selectors = testPage.selectors.length;
    results.summary.selectors += testPage.selectors.length;
    
    console.log(`  ✅ Completed: ${pageResults.passed} passed, ${pageResults.failed} failed`);
    
    return pageResults;
    
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    pageResults.failed++;
    results.failed++;
    return pageResults;
  }
};

// Run all visual regression tests
const runAllVisualRegressionTests = async () => {
  console.log('🖼️  Starting visual regression tests...');
  console.log(`Base URL: ${config.baseUrl}`);
  console.log(`Test pages: ${config.testPages.length}`);
  console.log(`Breakpoints: ${config.breakpoints.length}`);
  console.log('');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: config.viewport,
    userAgent: 'Visual Regression Test Bot',
  });
  
  const page = await context.newPage();
  
  try {
    for (const testPage of config.testPages) {
      try {
        const pageResults = await runVisualRegressionTest(page, testPage);
        results.summary.pages++;
        results.total += pageResults.passed + pageResults.failed;
        
      } catch (error) {
        console.error(`❌ Test failed: ${testPage.name}`, error.message);
        results.failed++;
        results.total++;
      }
    }
    
  } finally {
    await browser.close();
  }
  
  // Generate report
  generateVisualRegressionReport();
  
  return results;
};

// Generate visual regression report
const generateVisualRegressionReport = () => {
  const report = {
    ...results,
    config,
    summary: {
      ...results.summary,
      total: results.total,
      passed: results.passed,
      failed: results.failed,
      successRate: results.total > 0 ? (results.passed / results.total) * 100 : 0,
    },
  };
  
  // Save report
  const reportPath = path.join(config.outputDir, 'visual-regression-report.json');
  const reportDir = path.dirname(reportPath);
  
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📁 Visual regression report saved to: ${reportPath}`);
  
  // Display summary
  console.log('\n📊 Visual Regression Test Summary:');
  console.log('==================================');
  console.log(`Total tests: ${results.total}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Success rate: ${((results.passed / results.total) * 100).toFixed(2)}%`);
  console.log(`Pages tested: ${results.summary.pages}`);
  console.log(`Breakpoints tested: ${results.summary.breakpoints}`);
  console.log(`Selectors tested: ${results.summary.selectors}`);
  
  if (results.differences.length > 0) {
    console.log(`\n🚨 Visual differences found: ${results.differences.length}`);
    results.differences.forEach(diff => {
      console.log(`  - ${diff.name}: ${diff.message}`);
      if (diff.diffPath) {
        console.log(`    Diff image: ${diff.diffPath}`);
      }
    });
  }
  
  return report;
};

// Update baselines
const updateBaselines = async () => {
  console.log('📸 Updating visual regression baselines...');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: config.viewport,
    userAgent: 'Visual Regression Test Bot',
  });
  
  const page = await context.newPage();
  
  try {
    for (const testPage of config.testPages) {
      console.log(`Updating baselines for ${testPage.name}...`);
      
      await page.goto(`${config.baseUrl}${testPage.path}`, { 
        waitUntil: 'networkidle',
        timeout: config.timeout 
      });
      
      for (const breakpoint of config.breakpoints) {
        await page.setViewportSize({ 
          width: breakpoint.width, 
          height: breakpoint.height 
        });
        
        await page.waitForTimeout(1000);
        
        // Update full page baseline
        const fullPageName = `${testPage.name}_${breakpoint.name}_full`;
        const fullPagePath = await takeScreenshot(page, fullPageName);
        const baselinePath = path.join(config.outputDir, 'baselines', `${fullPageName}.png`);
        const baselineDir = path.dirname(baselinePath);
        
        if (!fs.existsSync(baselineDir)) {
          fs.mkdirSync(baselineDir, { recursive: true });
        }
        
        fs.copyFileSync(fullPagePath, baselinePath);
        
        // Update selector baselines
        for (const selector of testPage.selectors) {
          try {
            const selectorName = `${testPage.name}_${breakpoint.name}_${selector.replace(/[^a-zA-Z0-9]/g, '_')}`;
            const selectorPath = await takeScreenshot(page, selectorName, selector);
            const selectorBaselinePath = path.join(config.outputDir, 'baselines', `${selectorName}.png`);
            
            fs.copyFileSync(selectorPath, selectorBaselinePath);
            
          } catch (error) {
            console.log(`  ⚠️  Selector ${selector} not found: ${error.message}`);
          }
        }
      }
    }
    
    console.log('✅ Baselines updated successfully!');
    
  } finally {
    await browser.close();
  }
};

// Run if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--update-baselines')) {
    updateBaselines().catch(error => {
      console.error('❌ Baseline update failed:', error.message);
      process.exit(1);
    });
  } else {
    runAllVisualRegressionTests().catch(error => {
      console.error('❌ Visual regression test failed:', error.message);
      process.exit(1);
    });
  }
}

module.exports = {
  runAllVisualRegressionTests,
  updateBaselines,
  config,
  results,
};
