const { performance } = require('perf_hooks');
const fs = require('fs');
const path = require('path');

// Accessibility test configuration
const config = {
  baseUrl: 'http://localhost:3000',
  timeout: 30000,
  testPages: [
    {
      name: 'Home Page',
      path: '/',
      wcagLevel: 'AA',
    },
    {
      name: 'Login Page',
      path: '/login',
      wcagLevel: 'AA',
    },
    {
      name: 'Register Page',
      path: '/register',
      wcagLevel: 'AA',
    },
    {
      name: 'Opportunities Page',
      path: '/opportunities',
      wcagLevel: 'AA',
    },
    {
      name: 'Profile Page',
      path: '/profile',
      wcagLevel: 'AA',
    },
    {
      name: 'Dashboard Page',
      path: '/dashboard',
      wcagLevel: 'AA',
    },
  ],
  wcagGuidelines: {
    '1.1.1': {
      name: 'Non-text Content',
      level: 'A',
      description: 'All non-text content has a text alternative',
    },
    '1.2.1': {
      name: 'Audio-only and Video-only (Prerecorded)',
      level: 'A',
      description: 'Audio-only and video-only content has alternatives',
    },
    '1.3.1': {
      name: 'Info and Relationships',
      level: 'A',
      description: 'Information and relationships are programmatically determinable',
    },
    '1.3.2': {
      name: 'Meaningful Sequence',
      level: 'A',
      description: 'Content is presented in a meaningful sequence',
    },
    '1.3.3': {
      name: 'Sensory Characteristics',
      level: 'A',
      description: 'Instructions do not rely solely on sensory characteristics',
    },
    '1.4.1': {
      name: 'Use of Color',
      level: 'A',
      description: 'Color is not used as the only visual means of conveying information',
    },
    '1.4.2': {
      name: 'Audio Control',
      level: 'A',
      description: 'Audio can be paused or stopped',
    },
    '1.4.3': {
      name: 'Contrast (Minimum)',
      level: 'AA',
      description: 'Text has sufficient contrast ratio',
    },
    '1.4.4': {
      name: 'Resize Text',
      level: 'AA',
      description: 'Text can be resized up to 200%',
    },
    '1.4.5': {
      name: 'Images of Text',
      level: 'AA',
      description: 'Images of text are avoided',
    },
    '2.1.1': {
      name: 'Keyboard',
      level: 'A',
      description: 'All functionality is available from a keyboard',
    },
    '2.1.2': {
      name: 'No Keyboard Trap',
      level: 'A',
      description: 'Keyboard focus is not trapped',
    },
    '2.4.1': {
      name: 'Bypass Blocks',
      level: 'A',
      description: 'Skip links are provided',
    },
    '2.4.2': {
      name: 'Page Titled',
      level: 'A',
      description: 'Pages have descriptive titles',
    },
    '2.4.3': {
      name: 'Focus Order',
      level: 'A',
      description: 'Focus order is logical',
    },
    '2.4.4': {
      name: 'Link Purpose',
      level: 'A',
      description: 'Link purpose is clear',
    },
    '2.4.5': {
      name: 'Multiple Ways',
      level: 'AA',
      description: 'Multiple ways to reach content are provided',
    },
    '2.4.6': {
      name: 'Headings and Labels',
      level: 'AA',
      description: 'Headings and labels are descriptive',
    },
    '2.4.7': {
      name: 'Focus Visible',
      level: 'AA',
      description: 'Focus is visible',
    },
    '3.1.1': {
      name: 'Language of Page',
      level: 'A',
      description: 'Page language is specified',
    },
    '3.1.2': {
      name: 'Language of Parts',
      level: 'AA',
      description: 'Language of parts is specified',
    },
    '3.2.1': {
      name: 'On Focus',
      level: 'A',
      description: 'Focus does not trigger context changes',
    },
    '3.2.2': {
      name: 'On Input',
      level: 'A',
      description: 'Input does not trigger context changes',
    },
    '3.2.3': {
      name: 'Consistent Navigation',
      level: 'AA',
      description: 'Navigation is consistent',
    },
    '3.2.4': {
      name: 'Consistent Identification',
      level: 'AA',
      description: 'Components are identified consistently',
    },
    '4.1.1': {
      name: 'Parsing',
      level: 'A',
      description: 'Markup is valid',
    },
    '4.1.2': {
      name: 'Name, Role, Value',
      level: 'A',
      description: 'Elements have accessible names and roles',
    },
  },
  testResults: {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0,
    errors: [],
    warnings: [],
  },
};

// Run accessibility test for a page
const runAccessibilityTest = async (page) => {
  console.log(`🔍 Testing ${page.name} (${page.path})...`);
  
  const startTime = performance.now();
  
  try {
    const url = `${config.baseUrl}${page.path}`;
    const response = await fetch(url, { timeout: config.timeout });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Parse HTML and run accessibility checks
    const results = await checkAccessibility(html, page);
    
    console.log(`  ✅ Completed in ${duration.toFixed(2)}ms`);
    console.log(`  Passed: ${results.passed}`);
    console.log(`  Failed: ${results.failed}`);
    console.log(`  Warnings: ${results.warnings}`);
    
    return {
      page: page.name,
      path: page.path,
      duration,
      results,
    };
    
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`  ❌ Error: ${error.message}`);
    
    return {
      page: page.name,
      path: page.path,
      duration,
      error: error.message,
      results: { passed: 0, failed: 1, warnings: 0, errors: [error.message] },
    };
  }
};

// Check accessibility compliance
const checkAccessibility = async (html, page) => {
  const results = {
    passed: 0,
    failed: 0,
    warnings: 0,
    errors: [],
    warnings: [],
  };
  
  // Parse HTML (simplified - in real implementation, use a proper HTML parser)
  const checks = [
    // 1.1.1 Non-text Content
    checkNonTextContent(html),
    
    // 1.3.1 Info and Relationships
    checkInfoAndRelationships(html),
    
    // 1.4.1 Use of Color
    checkUseOfColor(html),
    
    // 1.4.3 Contrast (Minimum)
    checkContrast(html),
    
    // 2.1.1 Keyboard
    checkKeyboardAccess(html),
    
    // 2.4.1 Bypass Blocks
    checkBypassBlocks(html),
    
    // 2.4.2 Page Titled
    checkPageTitled(html),
    
    // 2.4.3 Focus Order
    checkFocusOrder(html),
    
    // 2.4.4 Link Purpose
    checkLinkPurpose(html),
    
    // 2.4.6 Headings and Labels
    checkHeadingsAndLabels(html),
    
    // 2.4.7 Focus Visible
    checkFocusVisible(html),
    
    // 3.1.1 Language of Page
    checkLanguageOfPage(html),
    
    // 3.2.1 On Focus
    checkOnFocus(html),
    
    // 3.2.2 On Input
    checkOnInput(html),
    
    // 4.1.1 Parsing
    checkParsing(html),
    
    // 4.1.2 Name, Role, Value
    checkNameRoleValue(html),
  ];
  
  for (const check of checks) {
    const result = await check;
    results.passed += result.passed;
    results.failed += result.failed;
    results.warnings += result.warnings;
    results.errors.push(...result.errors);
    results.warnings.push(...result.warnings);
  }
  
  return results;
};

// Check non-text content (1.1.1)
const checkNonTextContent = async (html) => {
  const result = { passed: 0, failed: 0, warnings: 0, errors: [], warnings: [] };
  
  // Check for images without alt text
  const imgRegex = /<img[^>]+>/g;
  const images = html.match(imgRegex) || [];
  
  for (const img of images) {
    if (!img.includes('alt=')) {
      result.failed++;
      result.errors.push('Image missing alt text');
    } else {
      result.passed++;
    }
  }
  
  // Check for form inputs without labels
  const inputRegex = /<input[^>]+>/g;
  const inputs = html.match(inputRegex) || [];
  
  for (const input of inputs) {
    if (!input.includes('aria-label=') && !input.includes('aria-labelledby=')) {
      // Check if there's a label element
      const idMatch = input.match(/id="([^"]+)"/);
      if (idMatch) {
        const labelRegex = new RegExp(`<label[^>]+for="${idMatch[1]}"[^>]*>`, 'i');
        if (!html.match(labelRegex)) {
          result.failed++;
          result.errors.push('Input missing label');
        } else {
          result.passed++;
        }
      } else {
        result.failed++;
        result.errors.push('Input missing label');
      }
    } else {
      result.passed++;
    }
  }
  
  return result;
};

// Check info and relationships (1.3.1)
const checkInfoAndRelationships = async (html) => {
  const result = { passed: 0, failed: 0, warnings: 0, errors: [], warnings: [] };
  
  // Check for proper heading hierarchy
  const headingRegex = /<h([1-6])[^>]*>/g;
  const headings = html.match(headingRegex) || [];
  const headingLevels = headings.map(h => parseInt(h.match(/<h([1-6])/)[1]));
  
  let lastLevel = 0;
  for (const level of headingLevels) {
    if (level > lastLevel + 1) {
      result.failed++;
      result.errors.push(`Heading level ${level} skipped from ${lastLevel}`);
    } else {
      result.passed++;
    }
    lastLevel = level;
  }
  
  // Check for form fieldsets
  const fieldsetRegex = /<fieldset[^>]*>/g;
  const fieldsets = html.match(fieldsetRegex) || [];
  
  for (const fieldset of fieldsets) {
    if (!fieldset.includes('legend')) {
      result.failed++;
      result.errors.push('Fieldset missing legend');
    } else {
      result.passed++;
    }
  }
  
  return result;
};

// Check use of color (1.4.1)
const checkUseOfColor = async (html) => {
  const result = { passed: 0, failed: 0, warnings: 0, errors: [], warnings: [] };
  
  // Check for color-only information
  const colorOnlyPatterns = [
    /red|green|blue|yellow|orange|purple|pink|brown|black|white/g,
    /#[0-9a-fA-F]{3,6}/g,
    /rgb\(/g,
    /hsl\(/g,
  ];
  
  for (const pattern of colorOnlyPatterns) {
    const matches = html.match(pattern) || [];
    if (matches.length > 0) {
      result.warnings++;
      result.warnings.push('Color information may not be accessible to colorblind users');
    }
  }
  
  result.passed = 1; // This is a warning, not a failure
  
  return result;
};

// Check contrast (1.4.3)
const checkContrast = async (html) => {
  const result = { passed: 0, failed: 0, warnings: 0, errors: [], warnings: [] };
  
  // This would require actual color analysis
  // For now, we'll check for common low-contrast patterns
  const lowContrastPatterns = [
    /color:\s*#(?:[0-9a-fA-F]{3}){1,2}\s*;\s*background-color:\s*#(?:[0-9a-fA-F]{3}){1,2}/g,
    /color:\s*rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)\s*;\s*background-color:\s*rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/g,
  ];
  
  for (const pattern of lowContrastPatterns) {
    const matches = html.match(pattern) || [];
    if (matches.length > 0) {
      result.warnings++;
      result.warnings.push('Potential low contrast detected');
    }
  }
  
  result.passed = 1; // This is a warning, not a failure
  
  return result;
};

// Check keyboard access (2.1.1)
const checkKeyboardAccess = async (html) => {
  const result = { passed: 0, failed: 0, warnings: 0, errors: [], warnings: [] };
  
  // Check for interactive elements
  const interactiveElements = [
    /<a[^>]+>/g,
    /<button[^>]+>/g,
    /<input[^>]+>/g,
    /<select[^>]+>/g,
    /<textarea[^>]+>/g,
  ];
  
  for (const pattern of interactiveElements) {
    const elements = html.match(pattern) || [];
    for (const element of elements) {
      if (element.includes('tabindex="-1"')) {
        result.failed++;
        result.errors.push('Interactive element with negative tabindex');
      } else {
        result.passed++;
      }
    }
  }
  
  return result;
};

// Check bypass blocks (2.4.1)
const checkBypassBlocks = async (html) => {
  const result = { passed: 0, failed: 0, warnings: 0, errors: [], warnings: [] };
  
  // Check for skip links
  const skipLinkPatterns = [
    /<a[^>]+href="#main"[^>]*>skip to main content<\/a>/i,
    /<a[^>]+href="#content"[^>]*>skip to content<\/a>/i,
    /<a[^>]+href="#navigation"[^>]*>skip to navigation<\/a>/i,
  ];
  
  let hasSkipLink = false;
  for (const pattern of skipLinkPatterns) {
    if (html.match(pattern)) {
      hasSkipLink = true;
      break;
    }
  }
  
  if (hasSkipLink) {
    result.passed++;
  } else {
    result.failed++;
    result.errors.push('No skip links found');
  }
  
  return result;
};

// Check page titled (2.4.2)
const checkPageTitled = async (html) => {
  const result = { passed: 0, failed: 0, warnings: 0, errors: [], warnings: [] };
  
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch && titleMatch[1].trim().length > 0) {
    result.passed++;
  } else {
    result.failed++;
    result.errors.push('Page missing title or empty title');
  }
  
  return result;
};

// Check focus order (2.4.3)
const checkFocusOrder = async (html) => {
  const result = { passed: 0, failed: 0, warnings: 0, errors: [], warnings: [] };
  
  // Check for tabindex attributes
  const tabindexRegex = /tabindex="([^"]+)"/g;
  const tabindexes = [];
  let match;
  
  while ((match = tabindexRegex.exec(html)) !== null) {
    tabindexes.push(parseInt(match[1]));
  }
  
  // Check for duplicate tabindex values
  const duplicates = tabindexes.filter((item, index) => tabindexes.indexOf(item) !== index);
  if (duplicates.length > 0) {
    result.failed++;
    result.errors.push('Duplicate tabindex values found');
  } else {
    result.passed++;
  }
  
  return result;
};

// Check link purpose (2.4.4)
const checkLinkPurpose = async (html) => {
  const result = { passed: 0, failed: 0, warnings: 0, errors: [], warnings: [] };
  
  const linkRegex = /<a[^>]+>([^<]+)<\/a>/g;
  const links = html.match(linkRegex) || [];
  
  for (const link of links) {
    const text = link.match(/<a[^>]+>([^<]+)<\/a>/)[1];
    if (text.trim().length === 0 || text === 'click here' || text === 'read more') {
      result.failed++;
      result.errors.push('Link with unclear purpose');
    } else {
      result.passed++;
    }
  }
  
  return result;
};

// Check headings and labels (2.4.6)
const checkHeadingsAndLabels = async (html) => {
  const result = { passed: 0, failed: 0, warnings: 0, errors: [], warnings: [] };
  
  // Check for empty headings
  const headingRegex = /<h[1-6][^>]*>([^<]*)<\/h[1-6]>/g;
  const headings = html.match(headingRegex) || [];
  
  for (const heading of headings) {
    const text = heading.match(/<h[1-6][^>]*>([^<]*)<\/h[1-6]>/) [1];
    if (text.trim().length === 0) {
      result.failed++;
      result.errors.push('Empty heading found');
    } else {
      result.passed++;
    }
  }
  
  return result;
};

// Check focus visible (2.4.7)
const checkFocusVisible = async (html) => {
  const result = { passed: 0, failed: 0, warnings: 0, errors: [], warnings: [] };
  
  // Check for focus styles
  const focusStyles = [
    /:focus\s*{/g,
    /:focus-visible\s*{/g,
    /outline:\s*none/g,
  ];
  
  let hasFocusStyles = false;
  for (const pattern of focusStyles) {
    if (html.match(pattern)) {
      hasFocusStyles = true;
      break;
    }
  }
  
  if (hasFocusStyles) {
    result.passed++;
  } else {
    result.warnings++;
    result.warnings.push('No focus styles found');
  }
  
  return result;
};

// Check language of page (3.1.1)
const checkLanguageOfPage = async (html) => {
  const result = { passed: 0, failed: 0, warnings: 0, errors: [], warnings: [] };
  
  const langMatch = html.match(/<html[^>]+lang="([^"]+)"/i);
  if (langMatch && langMatch[1].length > 0) {
    result.passed++;
  } else {
    result.failed++;
    result.errors.push('Page language not specified');
  }
  
  return result;
};

// Check on focus (3.2.1)
const checkOnFocus = async (html) => {
  const result = { passed: 0, failed: 0, warnings: 0, errors: [], warnings: [] };
  
  // Check for onfocus attributes
  const onfocusRegex = /onfocus="[^"]*"/g;
  const onfocusMatches = html.match(onfocusRegex) || [];
  
  if (onfocusMatches.length > 0) {
    result.warnings++;
    result.warnings.push('onfocus attributes may cause context changes');
  }
  
  result.passed = 1; // This is a warning, not a failure
  
  return result;
};

// Check on input (3.2.2)
const checkOnInput = async (html) => {
  const result = { passed: 0, failed: 0, warnings: 0, errors: [], warnings: [] };
  
  // Check for oninput attributes
  const oninputRegex = /oninput="[^"]*"/g;
  const oninputMatches = html.match(oninputRegex) || [];
  
  if (oninputMatches.length > 0) {
    result.warnings++;
    result.warnings.push('oninput attributes may cause context changes');
  }
  
  result.passed = 1; // This is a warning, not a failure
  
  return result;
};

// Check parsing (4.1.1)
const checkParsing = async (html) => {
  const result = { passed: 0, failed: 0, warnings: 0, errors: [], warnings: [] };
  
  // Check for unclosed tags
  const tagRegex = /<([^>]+)>/g;
  const tags = html.match(tagRegex) || [];
  
  let openTags = [];
  for (const tag of tags) {
    if (tag.startsWith('</')) {
      // Closing tag
      const tagName = tag.match(/<\/([^>]+)>/)[1];
      const lastOpen = openTags.pop();
      if (lastOpen !== tagName) {
        result.failed++;
        result.errors.push(`Mismatched tags: ${lastOpen} and ${tagName}`);
      } else {
        result.passed++;
      }
    } else if (!tag.endsWith('/>')) {
      // Opening tag
      const tagName = tag.match(/<([^>]+)>/)[1];
      openTags.push(tagName);
    }
  }
  
  if (openTags.length > 0) {
    result.failed++;
    result.errors.push(`Unclosed tags: ${openTags.join(', ')}`);
  }
  
  return result;
};

// Check name, role, value (4.1.2)
const checkNameRoleValue = async (html) => {
  const result = { passed: 0, failed: 0, warnings: 0, errors: [], warnings: [] };
  
  // Check for form elements with proper labels
  const formElements = [
    /<input[^>]+type="text"[^>]*>/g,
    /<input[^>]+type="email"[^>]*>/g,
    /<input[^>]+type="password"[^>]*>/g,
    /<select[^>]+>/g,
    /<textarea[^>]+>/g,
  ];
  
  for (const pattern of formElements) {
    const elements = html.match(pattern) || [];
    for (const element of elements) {
      if (element.includes('aria-label=') || element.includes('aria-labelledby=')) {
        result.passed++;
      } else {
        result.failed++;
        result.errors.push('Form element missing accessible name');
      }
    }
  }
  
  return result;
};

// Run all accessibility tests
const runAllAccessibilityTests = async () => {
  console.log('♿ Starting accessibility tests...');
  console.log(`Base URL: ${config.baseUrl}`);
  console.log(`Test pages: ${config.testPages.length}`);
  console.log('');
  
  const startTime = performance.now();
  
  for (const page of config.testPages) {
    try {
      const result = await runAccessibilityTest(page);
      config.testResults.total += result.results.passed + result.results.failed + result.results.warnings;
      config.testResults.passed += result.results.passed;
      config.testResults.failed += result.results.failed;
      config.testResults.warnings += result.results.warnings;
      config.testResults.errors.push(...result.results.errors);
      config.testResults.warnings.push(...result.results.warnings);
      
    } catch (error) {
      console.error(`❌ Test failed: ${page.name}`, error.message);
    }
  }
  
  const endTime = performance.now();
  
  // Generate report
  generateAccessibilityReport(endTime - startTime);
  
  return config.testResults;
};

// Generate accessibility report
const generateAccessibilityReport = (duration) => {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: config.testResults.total,
      passed: config.testResults.passed,
      failed: config.testResults.failed,
      warnings: config.testResults.warnings,
      successRate: (config.testResults.passed / config.testResults.total) * 100,
      duration,
    },
    errors: config.testResults.errors,
    warnings: config.testResults.warnings,
    wcagGuidelines: config.wcagGuidelines,
    recommendations: generateAccessibilityRecommendations(),
  };
  
  // Save report
  const reportPath = path.join(__dirname, '..', '..', 'quality-reports', 'accessibility-report.json');
  const reportDir = path.dirname(reportPath);
  
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📁 Accessibility report saved to: ${reportPath}`);
  
  // Display summary
  console.log('\n📊 Accessibility Test Summary:');
  console.log('==============================');
  console.log(`Total tests: ${config.testResults.total}`);
  console.log(`Passed: ${config.testResults.passed}`);
  console.log(`Failed: ${config.testResults.failed}`);
  console.log(`Warnings: ${config.testResults.warnings}`);
  console.log(`Success rate: ${((config.testResults.passed / config.testResults.total) * 100).toFixed(2)}%`);
  console.log(`Duration: ${(duration / 1000).toFixed(2)}s`);
  
  if (config.testResults.errors.length > 0) {
    console.log(`\n🚨 Errors found: ${config.testResults.errors.length}`);
    config.testResults.errors.forEach(error => {
      console.log(`  - ${error}`);
    });
  }
  
  if (config.testResults.warnings.length > 0) {
    console.log(`\n⚠️  Warnings found: ${config.testResults.warnings.length}`);
    config.testResults.warnings.forEach(warning => {
      console.log(`  - ${warning}`);
    });
  }
  
  if (report.recommendations.length > 0) {
    console.log('\n💡 Recommendations:');
    report.recommendations.forEach(rec => console.log(`  - ${rec}`));
  }
  
  return report;
};

// Generate accessibility recommendations
const generateAccessibilityRecommendations = () => {
  const recommendations = [];
  
  if (config.testResults.failed > 0) {
    recommendations.push('Fix all accessibility errors');
    recommendations.push('Implement proper ARIA labels and roles');
    recommendations.push('Ensure keyboard navigation works');
    recommendations.push('Add skip links for main content');
    recommendations.push('Use semantic HTML elements');
  }
  
  if (config.testResults.warnings > 0) {
    recommendations.push('Address accessibility warnings');
    recommendations.push('Improve color contrast');
    recommendations.push('Add focus indicators');
    recommendations.push('Test with screen readers');
  }
  
  recommendations.push('Test with real users with disabilities');
  recommendations.push('Use automated accessibility testing tools');
  recommendations.push('Follow WCAG 2.1 guidelines');
  recommendations.push('Regular accessibility audits');
  
  return recommendations;
};

// Run if called directly
if (require.main === module) {
  runAllAccessibilityTests().catch(error => {
    console.error('❌ Accessibility test failed:', error.message);
    process.exit(1);
  });
}

module.exports = {
  runAllAccessibilityTests,
  runAccessibilityTest,
  checkAccessibility,
  config,
  testResults: config.testResults,
};
