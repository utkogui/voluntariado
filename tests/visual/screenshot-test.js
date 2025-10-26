const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Screenshot test configuration
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
      description: 'Main landing page with opportunities list',
      waitForSelector: '.opportunity-card',
    },
    {
      name: 'Login Page',
      path: '/login',
      description: 'User login form',
      waitForSelector: '.login-form',
    },
    {
      name: 'Register Page',
      path: '/register',
      description: 'User registration form',
      waitForSelector: '.register-form',
    },
    {
      name: 'Opportunities Page',
      path: '/opportunities',
      description: 'List of all opportunities',
      waitForSelector: '.opportunities-list',
    },
    {
      name: 'Profile Page',
      path: '/profile',
      description: 'User profile management',
      waitForSelector: '.profile-form',
    },
    {
      name: 'Dashboard Page',
      path: '/dashboard',
      description: 'User dashboard with stats and activities',
      waitForSelector: '.dashboard-header',
    },
    {
      name: 'Chat Page',
      path: '/chat',
      description: 'Real-time chat interface',
      waitForSelector: '.chat-container',
    },
    {
      name: 'Notifications Page',
      path: '/notifications',
      description: 'User notifications center',
      waitForSelector: '.notifications-list',
    },
    {
      name: 'Schedule Page',
      path: '/schedule',
      description: 'Activity scheduling interface',
      waitForSelector: '.schedule-calendar',
    },
    {
      name: 'Analytics Page',
      path: '/analytics',
      description: 'Analytics and reporting dashboard',
      waitForSelector: '.analytics-dashboard',
    },
  ],
  breakpoints: [
    { name: 'desktop', width: 1920, height: 1080 },
    { name: 'laptop', width: 1366, height: 768 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'mobile', width: 375, height: 667 },
  ],
  outputDir: path.join(__dirname, '..', '..', 'quality-reports', 'screenshots'),
};

// Screenshot test results
const results = {
  timestamp: new Date().toISOString(),
  total: 0,
  passed: 0,
  failed: 0,
  screenshots: [],
  errors: [],
  summary: {
    pages: 0,
    breakpoints: 0,
    totalScreenshots: 0,
  },
};

// Take screenshot of page
const takeScreenshot = async (page, name, options = {}) => {
  const screenshotPath = path.join(config.outputDir, `${name}.png`);
  const screenshotDir = path.dirname(screenshotPath);
  
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }
  
  const screenshotOptions = {
    path: screenshotPath,
    fullPage: true,
    ...options,
  };
  
  await page.screenshot(screenshotOptions);
  
  return screenshotPath;
};

// Take screenshot of specific element
const takeElementScreenshot = async (page, selector, name, options = {}) => {
  const screenshotPath = path.join(config.outputDir, `${name}.png`);
  const screenshotDir = path.dirname(screenshotPath);
  
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }
  
  const element = await page.$(selector);
  if (!element) {
    throw new Error(`Element with selector "${selector}" not found`);
  }
  
  const screenshotOptions = {
    path: screenshotPath,
    ...options,
  };
  
  await element.screenshot(screenshotOptions);
  
  return screenshotPath;
};

// Run screenshot test for a page
const runScreenshotTest = async (page, testPage) => {
  console.log(`📸 Testing ${testPage.name} (${testPage.path})...`);
  
  const pageResults = {
    name: testPage.name,
    path: testPage.path,
    description: testPage.description,
    breakpoints: [],
    passed: 0,
    failed: 0,
    screenshots: [],
  };
  
  try {
    // Navigate to page
    await page.goto(`${config.baseUrl}${testPage.path}`, { 
      waitUntil: 'networkidle',
      timeout: config.timeout 
    });
    
    // Wait for specific element if specified
    if (testPage.waitForSelector) {
      await page.waitForSelector(testPage.waitForSelector, { timeout: 10000 });
    }
    
    // Wait for page to load completely
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000); // Additional wait for animations
    
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
      
      try {
        // Take full page screenshot
        const fullPageName = `${testPage.name}_${breakpoint.name}_full`;
        const fullPagePath = await takeScreenshot(page, fullPageName);
        
        const fullPageResult = {
          type: 'full-page',
          name: fullPageName,
          path: fullPagePath,
          size: fs.statSync(fullPagePath).size,
          timestamp: new Date().toISOString(),
        };
        
        breakpointResults.screenshots.push(fullPageResult);
        pageResults.screenshots.push(fullPageResult);
        results.screenshots.push(fullPageResult);
        
        breakpointResults.passed++;
        pageResults.passed++;
        results.passed++;
        results.summary.totalScreenshots++;
        
        // Take specific element screenshots
        const elementSelectors = [
          '.header',
          '.main-content',
          '.footer',
          '.opportunity-card',
          '.form-group',
          '.btn-primary',
          '.alert',
          '.stats-card',
          '.chart-container',
        ];
        
        for (const selector of elementSelectors) {
          try {
            const elementName = `${testPage.name}_${breakpoint.name}_${selector.replace(/[^a-zA-Z0-9]/g, '_')}`;
            const elementPath = await takeElementScreenshot(page, selector, elementName);
            
            const elementResult = {
              type: 'element',
              name: elementName,
              selector,
              path: elementPath,
              size: fs.statSync(elementPath).size,
              timestamp: new Date().toISOString(),
            };
            
            breakpointResults.screenshots.push(elementResult);
            pageResults.screenshots.push(elementResult);
            results.screenshots.push(elementResult);
            
            breakpointResults.passed++;
            pageResults.passed++;
            results.passed++;
            results.summary.totalScreenshots++;
            
          } catch (error) {
            // Element not found, skip silently
            console.log(`    ⚠️  Element ${selector} not found`);
          }
        }
        
      } catch (error) {
        console.log(`    ❌ Screenshot failed: ${error.message}`);
        breakpointResults.failed++;
        pageResults.failed++;
        results.failed++;
        
        results.errors.push({
          page: testPage.name,
          breakpoint: breakpoint.name,
          error: error.message,
          timestamp: new Date().toISOString(),
        });
      }
      
      pageResults.breakpoints.push(breakpointResults);
      results.summary.breakpoints++;
    }
    
    console.log(`  ✅ Completed: ${pageResults.passed} screenshots taken, ${pageResults.failed} failed`);
    
    return pageResults;
    
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    pageResults.failed++;
    results.failed++;
    
    results.errors.push({
      page: testPage.name,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    
    return pageResults;
  }
};

// Run all screenshot tests
const runAllScreenshotTests = async () => {
  console.log('📸 Starting screenshot tests...');
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
    userAgent: 'Screenshot Test Bot',
  });
  
  const page = await context.newPage();
  
  try {
    for (const testPage of config.testPages) {
      try {
        const pageResults = await runScreenshotTest(page, testPage);
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
  generateScreenshotReport();
  
  return results;
};

// Generate screenshot report
const generateScreenshotReport = () => {
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
  const reportPath = path.join(config.outputDir, 'screenshot-report.json');
  const reportDir = path.dirname(reportPath);
  
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📁 Screenshot report saved to: ${reportPath}`);
  
  // Display summary
  console.log('\n📊 Screenshot Test Summary:');
  console.log('===========================');
  console.log(`Total screenshots: ${results.total}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Success rate: ${((results.passed / results.total) * 100).toFixed(2)}%`);
  console.log(`Pages tested: ${results.summary.pages}`);
  console.log(`Breakpoints tested: ${results.summary.breakpoints}`);
  console.log(`Total screenshots taken: ${results.summary.totalScreenshots}`);
  
  if (results.errors.length > 0) {
    console.log(`\n🚨 Errors found: ${results.errors.length}`);
    results.errors.forEach(error => {
      console.log(`  - ${error.page}: ${error.error}`);
    });
  }
  
  return report;
};

// Generate screenshot gallery
const generateScreenshotGallery = () => {
  const galleryPath = path.join(config.outputDir, 'gallery.html');
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Screenshot Gallery</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .header {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .gallery {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
        }
        .screenshot-card {
            background: white;
            border-radius: 8px;
            padding: 15px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .screenshot-card img {
            width: 100%;
            height: auto;
            border-radius: 4px;
            margin-bottom: 10px;
        }
        .screenshot-info {
            font-size: 14px;
            color: #666;
        }
        .screenshot-name {
            font-weight: bold;
            margin-bottom: 5px;
        }
        .screenshot-details {
            font-size: 12px;
            color: #999;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Screenshot Gallery</h1>
        <p>Generated on ${new Date().toLocaleString()}</p>
        <p>Total screenshots: ${results.summary.totalScreenshots}</p>
    </div>
    
    <div class="gallery">
        ${results.screenshots.map(screenshot => `
            <div class="screenshot-card">
                <img src="${path.basename(screenshot.path)}" alt="${screenshot.name}">
                <div class="screenshot-info">
                    <div class="screenshot-name">${screenshot.name}</div>
                    <div class="screenshot-details">
                        Type: ${screenshot.type}<br>
                        Size: ${(screenshot.size / 1024).toFixed(2)} KB<br>
                        Time: ${new Date(screenshot.timestamp).toLocaleString()}
                    </div>
                </div>
            </div>
        `).join('')}
    </div>
</body>
</html>`;
  
  fs.writeFileSync(galleryPath, html);
  console.log(`📸 Screenshot gallery saved to: ${galleryPath}`);
  
  return galleryPath;
};

// Run if called directly
if (require.main === module) {
  runAllScreenshotTests()
    .then(() => {
      generateScreenshotGallery();
    })
    .catch(error => {
      console.error('❌ Screenshot test failed:', error.message);
      process.exit(1);
    });
}

module.exports = {
  runAllScreenshotTests,
  generateScreenshotGallery,
  config,
  results,
};
