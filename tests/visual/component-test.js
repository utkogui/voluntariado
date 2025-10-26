const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Component visual test configuration
const config = {
  baseUrl: 'http://localhost:3000',
  timeout: 30000,
  viewport: {
    width: 1920,
    height: 1080,
  },
  components: [
    {
      name: 'OpportunityCard',
      selector: '.opportunity-card',
      description: 'Opportunity card component',
      states: ['default', 'hover', 'selected'],
    },
    {
      name: 'SearchBar',
      selector: '.search-bar',
      description: 'Search bar component',
      states: ['default', 'focused', 'with-text'],
    },
    {
      name: 'FilterPanel',
      selector: '.filter-panel',
      description: 'Filter panel component',
      states: ['default', 'expanded', 'collapsed'],
    },
    {
      name: 'NotificationDropdown',
      selector: '.notification-dropdown',
      description: 'Notification dropdown component',
      states: ['default', 'open', 'with-notifications'],
    },
    {
      name: 'UserDropdown',
      selector: '.user-dropdown',
      description: 'User dropdown component',
      states: ['default', 'open'],
    },
    {
      name: 'Button',
      selector: '.btn-primary',
      description: 'Primary button component',
      states: ['default', 'hover', 'active', 'disabled'],
    },
    {
      name: 'FormGroup',
      selector: '.form-group',
      description: 'Form group component',
      states: ['default', 'focused', 'error', 'success'],
    },
    {
      name: 'Alert',
      selector: '.alert',
      description: 'Alert component',
      states: ['info', 'success', 'warning', 'error'],
    },
    {
      name: 'Modal',
      selector: '.modal',
      description: 'Modal component',
      states: ['default', 'open', 'closing'],
    },
    {
      name: 'LoadingSpinner',
      selector: '.loading-spinner',
      description: 'Loading spinner component',
      states: ['default', 'loading', 'loaded'],
    },
  ],
  breakpoints: [
    { name: 'desktop', width: 1920, height: 1080 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'mobile', width: 375, height: 667 },
  ],
  outputDir: path.join(__dirname, '..', '..', 'quality-reports', 'component-screenshots'),
};

// Component test results
const results = {
  timestamp: new Date().toISOString(),
  total: 0,
  passed: 0,
  failed: 0,
  components: [],
  screenshots: [],
  errors: [],
  summary: {
    components: 0,
    breakpoints: 0,
    states: 0,
    totalScreenshots: 0,
  },
};

// Take component screenshot
const takeComponentScreenshot = async (page, component, state, breakpoint) => {
  const screenshotName = `${component.name}_${state}_${breakpoint.name}`;
  const screenshotPath = path.join(config.outputDir, `${screenshotName}.png`);
  const screenshotDir = path.dirname(screenshotPath);
  
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }
  
  // Set viewport
  await page.setViewportSize({ 
    width: breakpoint.width, 
    height: breakpoint.height 
  });
  
  // Wait for layout to adjust
  await page.waitForTimeout(1000);
  
  // Find component element
  const element = await page.$(component.selector);
  if (!element) {
    throw new Error(`Component ${component.name} with selector "${component.selector}" not found`);
  }
  
  // Apply state-specific actions
  await applyComponentState(page, element, component, state);
  
  // Take screenshot
  await element.screenshot({ 
    path: screenshotPath,
    animations: 'disabled', // Disable animations for consistent screenshots
  });
  
  return {
    name: screenshotName,
    path: screenshotPath,
    size: fs.statSync(screenshotPath).size,
    timestamp: new Date().toISOString(),
  };
};

// Apply component state
const applyComponentState = async (page, element, component, state) => {
  switch (state) {
    case 'hover':
      await element.hover();
      await page.waitForTimeout(500);
      break;
      
    case 'focused':
      await element.focus();
      await page.waitForTimeout(500);
      break;
      
    case 'active':
      await element.click();
      await page.waitForTimeout(500);
      break;
      
    case 'selected':
      await element.click();
      await page.waitForTimeout(500);
      break;
      
    case 'open':
      await element.click();
      await page.waitForTimeout(500);
      break;
      
    case 'with-text':
      await element.fill('test search');
      await page.waitForTimeout(500);
      break;
      
    case 'expanded':
      await element.click();
      await page.waitForTimeout(500);
      break;
      
    case 'collapsed':
      // Already collapsed by default
      break;
      
    case 'with-notifications':
      // Simulate notifications by adding CSS class
      await page.addStyleTag({
        content: `
          .notification-dropdown::after {
            content: '3';
            position: absolute;
            top: -5px;
            right: -5px;
            background: red;
            color: white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
          }
        `
      });
      await page.waitForTimeout(500);
      break;
      
    case 'error':
      await page.addStyleTag({
        content: `
          .form-group input {
            border-color: red;
          }
          .form-group::after {
            content: 'Error message';
            color: red;
            font-size: 12px;
          }
        `
      });
      await page.waitForTimeout(500);
      break;
      
    case 'success':
      await page.addStyleTag({
        content: `
          .form-group input {
            border-color: green;
          }
          .form-group::after {
            content: 'Success message';
            color: green;
            font-size: 12px;
          }
        `
      });
      await page.waitForTimeout(500);
      break;
      
    case 'loading':
      await page.addStyleTag({
        content: `
          .loading-spinner::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 20px;
            height: 20px;
            border: 2px solid #f3f3f3;
            border-top: 2px solid #3498db;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `
      });
      await page.waitForTimeout(500);
      break;
      
    case 'loaded':
      // Already loaded by default
      break;
      
    case 'disabled':
      await page.addStyleTag({
        content: `
          .btn-primary:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
        `
      });
      await page.waitForTimeout(500);
      break;
      
    case 'info':
      await page.addStyleTag({
        content: `
          .alert {
            background-color: #d1ecf1;
            border-color: #bee5eb;
            color: #0c5460;
          }
        `
      });
      await page.waitForTimeout(500);
      break;
      
    case 'warning':
      await page.addStyleTag({
        content: `
          .alert {
            background-color: #fff3cd;
            border-color: #ffeaa7;
            color: #856404;
          }
        `
      });
      await page.waitForTimeout(500);
      break;
      
    case 'error':
      await page.addStyleTag({
        content: `
          .alert {
            background-color: #f8d7da;
            border-color: #f5c6cb;
            color: #721c24;
          }
        `
      });
      await page.waitForTimeout(500);
      break;
      
    case 'success':
      await page.addStyleTag({
        content: `
          .alert {
            background-color: #d4edda;
            border-color: #c3e6cb;
            color: #155724;
          }
        `
      });
      await page.waitForTimeout(500);
      break;
      
    case 'open':
      await page.addStyleTag({
        content: `
          .modal {
            display: block;
            background-color: rgba(0,0,0,0.5);
          }
        `
      });
      await page.waitForTimeout(500);
      break;
      
    case 'closing':
      await page.addStyleTag({
        content: `
          .modal {
            display: block;
            background-color: rgba(0,0,0,0.5);
            opacity: 0.5;
            transform: scale(0.95);
            transition: all 0.3s ease;
          }
        `
      });
      await page.waitForTimeout(500);
      break;
      
    default:
      // Default state, no changes needed
      break;
  }
};

// Run component test
const runComponentTest = async (page, component) => {
  console.log(`🧩 Testing component: ${component.name} (${component.selector})...`);
  
  const componentResults = {
    name: component.name,
    selector: component.selector,
    description: component.description,
    breakpoints: [],
    passed: 0,
    failed: 0,
    screenshots: [],
  };
  
  try {
    // Navigate to a page that contains the component
    const testPages = [
      '/',
      '/opportunities',
      '/dashboard',
      '/profile',
      '/login',
      '/register',
    ];
    
    let componentFound = false;
    for (const testPage of testPages) {
      try {
        await page.goto(`${config.baseUrl}${testPage}`, { 
          waitUntil: 'networkidle',
          timeout: config.timeout 
        });
        
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
        
        const element = await page.$(component.selector);
        if (element) {
          componentFound = true;
          break;
        }
      } catch (error) {
        // Continue to next page
        continue;
      }
    }
    
    if (!componentFound) {
      throw new Error(`Component ${component.name} not found on any test page`);
    }
    
    // Test each breakpoint
    for (const breakpoint of config.breakpoints) {
      console.log(`  Testing breakpoint: ${breakpoint.name} (${breakpoint.width}x${breakpoint.height})`);
      
      const breakpointResults = {
        name: breakpoint.name,
        width: breakpoint.width,
        height: breakpoint.height,
        states: [],
        passed: 0,
        failed: 0,
        screenshots: [],
      };
      
      // Test each state
      for (const state of component.states) {
        try {
          console.log(`    Testing state: ${state}`);
          
          const screenshot = await takeComponentScreenshot(page, component, state, breakpoint);
          
          const stateResult = {
            name: state,
            screenshot,
            passed: true,
          };
          
          breakpointResults.states.push(stateResult);
          breakpointResults.screenshots.push(screenshot);
          componentResults.screenshots.push(screenshot);
          results.screenshots.push(screenshot);
          
          breakpointResults.passed++;
          componentResults.passed++;
          results.passed++;
          results.summary.totalScreenshots++;
          results.summary.states++;
          
        } catch (error) {
          console.log(`      ❌ State ${state} failed: ${error.message}`);
          
          const stateResult = {
            name: state,
            error: error.message,
            passed: false,
          };
          
          breakpointResults.states.push(stateResult);
          breakpointResults.failed++;
          componentResults.failed++;
          results.failed++;
          
          results.errors.push({
            component: component.name,
            breakpoint: breakpoint.name,
            state,
            error: error.message,
            timestamp: new Date().toISOString(),
          });
        }
      }
      
      componentResults.breakpoints.push(breakpointResults);
      results.summary.breakpoints++;
    }
    
    console.log(`  ✅ Completed: ${componentResults.passed} screenshots taken, ${componentResults.failed} failed`);
    
    return componentResults;
    
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    componentResults.failed++;
    results.failed++;
    
    results.errors.push({
      component: component.name,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    
    return componentResults;
  }
};

// Run all component tests
const runAllComponentTests = async () => {
  console.log('🧩 Starting component visual tests...');
  console.log(`Base URL: ${config.baseUrl}`);
  console.log(`Components: ${config.components.length}`);
  console.log(`Breakpoints: ${config.breakpoints.length}`);
  console.log('');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: config.viewport,
    userAgent: 'Component Test Bot',
  });
  
  const page = await context.newPage();
  
  try {
    for (const component of config.components) {
      try {
        const componentResults = await runComponentTest(page, component);
        results.components.push(componentResults);
        results.summary.components++;
        results.total += componentResults.passed + componentResults.failed;
        
      } catch (error) {
        console.error(`❌ Component test failed: ${component.name}`, error.message);
        results.failed++;
        results.total++;
      }
    }
    
  } finally {
    await browser.close();
  }
  
  // Generate report
  generateComponentReport();
  
  return results;
};

// Generate component report
const generateComponentReport = () => {
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
  const reportPath = path.join(config.outputDir, 'component-report.json');
  const reportDir = path.dirname(reportPath);
  
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📁 Component report saved to: ${reportPath}`);
  
  // Display summary
  console.log('\n📊 Component Test Summary:');
  console.log('==========================');
  console.log(`Total screenshots: ${results.total}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Success rate: ${((results.passed / results.total) * 100).toFixed(2)}%`);
  console.log(`Components tested: ${results.summary.components}`);
  console.log(`Breakpoints tested: ${results.summary.breakpoints}`);
  console.log(`States tested: ${results.summary.states}`);
  console.log(`Total screenshots taken: ${results.summary.totalScreenshots}`);
  
  if (results.errors.length > 0) {
    console.log(`\n🚨 Errors found: ${results.errors.length}`);
    results.errors.forEach(error => {
      console.log(`  - ${error.component}: ${error.error}`);
    });
  }
  
  return report;
};

// Generate component gallery
const generateComponentGallery = () => {
  const galleryPath = path.join(config.outputDir, 'component-gallery.html');
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Component Gallery</title>
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
        .component-section {
            background: white;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .component-header {
            border-bottom: 1px solid #eee;
            padding-bottom: 15px;
            margin-bottom: 15px;
        }
        .component-gallery {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 15px;
        }
        .screenshot-card {
            border: 1px solid #eee;
            border-radius: 4px;
            padding: 10px;
            text-align: center;
        }
        .screenshot-card img {
            width: 100%;
            height: auto;
            border-radius: 4px;
            margin-bottom: 10px;
        }
        .screenshot-info {
            font-size: 12px;
            color: #666;
        }
        .screenshot-name {
            font-weight: bold;
            margin-bottom: 5px;
        }
        .screenshot-details {
            font-size: 11px;
            color: #999;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Component Gallery</h1>
        <p>Generated on ${new Date().toLocaleString()}</p>
        <p>Total screenshots: ${results.summary.totalScreenshots}</p>
    </div>
    
    ${results.components.map(component => `
        <div class="component-section">
            <div class="component-header">
                <h2>${component.name}</h2>
                <p>${component.description}</p>
                <p>Selector: <code>${component.selector}</code></p>
            </div>
            
            <div class="component-gallery">
                ${component.screenshots.map(screenshot => `
                    <div class="screenshot-card">
                        <img src="${path.basename(screenshot.path)}" alt="${screenshot.name}">
                        <div class="screenshot-info">
                            <div class="screenshot-name">${screenshot.name}</div>
                            <div class="screenshot-details">
                                Size: ${(screenshot.size / 1024).toFixed(2)} KB<br>
                                Time: ${new Date(screenshot.timestamp).toLocaleString()}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('')}
</body>
</html>`;
  
  fs.writeFileSync(galleryPath, html);
  console.log(`🧩 Component gallery saved to: ${galleryPath}`);
  
  return galleryPath;
};

// Run if called directly
if (require.main === module) {
  runAllComponentTests()
    .then(() => {
      generateComponentGallery();
    })
    .catch(error => {
      console.error('❌ Component test failed:', error.message);
      process.exit(1);
    });
}

module.exports = {
  runAllComponentTests,
  generateComponentGallery,
  config,
  results,
};
