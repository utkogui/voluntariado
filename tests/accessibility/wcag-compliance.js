const { performance } = require('perf_hooks');
const fs = require('fs');
const path = require('path');

// WCAG compliance test configuration
const config = {
  baseUrl: 'http://localhost:3000',
  timeout: 30000,
  wcagVersion: '2.1',
  complianceLevel: 'AA',
  testPages: [
    {
      name: 'Home Page',
      path: '/',
      requiredGuidelines: [
        '1.1.1', '1.3.1', '1.4.1', '1.4.3', '2.1.1', '2.4.1', '2.4.2', '2.4.3',
        '2.4.4', '2.4.6', '2.4.7', '3.1.1', '3.2.1', '3.2.2', '4.1.1', '4.1.2'
      ],
    },
    {
      name: 'Login Page',
      path: '/login',
      requiredGuidelines: [
        '1.1.1', '1.3.1', '1.4.1', '1.4.3', '2.1.1', '2.4.1', '2.4.2', '2.4.3',
        '2.4.4', '2.4.6', '2.4.7', '3.1.1', '3.2.1', '3.2.2', '4.1.1', '4.1.2'
      ],
    },
    {
      name: 'Register Page',
      path: '/register',
      requiredGuidelines: [
        '1.1.1', '1.3.1', '1.4.1', '1.4.3', '2.1.1', '2.4.1', '2.4.2', '2.4.3',
        '2.4.4', '2.4.6', '2.4.7', '3.1.1', '3.2.1', '3.2.2', '4.1.1', '4.1.2'
      ],
    },
    {
      name: 'Opportunities Page',
      path: '/opportunities',
      requiredGuidelines: [
        '1.1.1', '1.3.1', '1.4.1', '1.4.3', '2.1.1', '2.4.1', '2.4.2', '2.4.3',
        '2.4.4', '2.4.6', '2.4.7', '3.1.1', '3.2.1', '3.2.2', '4.1.1', '4.1.2'
      ],
    },
    {
      name: 'Profile Page',
      path: '/profile',
      requiredGuidelines: [
        '1.1.1', '1.3.1', '1.4.1', '1.4.3', '2.1.1', '2.4.1', '2.4.2', '2.4.3',
        '2.4.4', '2.4.6', '2.4.7', '3.1.1', '3.2.1', '3.2.2', '4.1.1', '4.1.2'
      ],
    },
    {
      name: 'Dashboard Page',
      path: '/dashboard',
      requiredGuidelines: [
        '1.1.1', '1.3.1', '1.4.1', '1.4.3', '2.1.1', '2.4.1', '2.4.2', '2.4.3',
        '2.4.4', '2.4.6', '2.4.7', '3.1.1', '3.2.1', '3.2.2', '4.1.1', '4.1.2'
      ],
    },
  ],
  wcagGuidelines: {
    '1.1.1': {
      name: 'Non-text Content',
      level: 'A',
      description: 'All non-text content has a text alternative',
      test: 'checkNonTextContent',
    },
    '1.2.1': {
      name: 'Audio-only and Video-only (Prerecorded)',
      level: 'A',
      description: 'Audio-only and video-only content has alternatives',
      test: 'checkAudioVideoAlternatives',
    },
    '1.3.1': {
      name: 'Info and Relationships',
      level: 'A',
      description: 'Information and relationships are programmatically determinable',
      test: 'checkInfoAndRelationships',
    },
    '1.3.2': {
      name: 'Meaningful Sequence',
      level: 'A',
      description: 'Content is presented in a meaningful sequence',
      test: 'checkMeaningfulSequence',
    },
    '1.3.3': {
      name: 'Sensory Characteristics',
      level: 'A',
      description: 'Instructions do not rely solely on sensory characteristics',
      test: 'checkSensoryCharacteristics',
    },
    '1.4.1': {
      name: 'Use of Color',
      level: 'A',
      description: 'Color is not used as the only visual means of conveying information',
      test: 'checkUseOfColor',
    },
    '1.4.2': {
      name: 'Audio Control',
      level: 'A',
      description: 'Audio can be paused or stopped',
      test: 'checkAudioControl',
    },
    '1.4.3': {
      name: 'Contrast (Minimum)',
      level: 'AA',
      description: 'Text has sufficient contrast ratio',
      test: 'checkContrast',
    },
    '1.4.4': {
      name: 'Resize Text',
      level: 'AA',
      description: 'Text can be resized up to 200%',
      test: 'checkResizeText',
    },
    '1.4.5': {
      name: 'Images of Text',
      level: 'AA',
      description: 'Images of text are avoided',
      test: 'checkImagesOfText',
    },
    '2.1.1': {
      name: 'Keyboard',
      level: 'A',
      description: 'All functionality is available from a keyboard',
      test: 'checkKeyboard',
    },
    '2.1.2': {
      name: 'No Keyboard Trap',
      level: 'A',
      description: 'Keyboard focus is not trapped',
      test: 'checkNoKeyboardTrap',
    },
    '2.4.1': {
      name: 'Bypass Blocks',
      level: 'A',
      description: 'Skip links are provided',
      test: 'checkBypassBlocks',
    },
    '2.4.2': {
      name: 'Page Titled',
      level: 'A',
      description: 'Pages have descriptive titles',
      test: 'checkPageTitled',
    },
    '2.4.3': {
      name: 'Focus Order',
      level: 'A',
      description: 'Focus order is logical',
      test: 'checkFocusOrder',
    },
    '2.4.4': {
      name: 'Link Purpose',
      level: 'A',
      description: 'Link purpose is clear',
      test: 'checkLinkPurpose',
    },
    '2.4.5': {
      name: 'Multiple Ways',
      level: 'AA',
      description: 'Multiple ways to reach content are provided',
      test: 'checkMultipleWays',
    },
    '2.4.6': {
      name: 'Headings and Labels',
      level: 'AA',
      description: 'Headings and labels are descriptive',
      test: 'checkHeadingsAndLabels',
    },
    '2.4.7': {
      name: 'Focus Visible',
      level: 'AA',
      description: 'Focus is visible',
      test: 'checkFocusVisible',
    },
    '3.1.1': {
      name: 'Language of Page',
      level: 'A',
      description: 'Page language is specified',
      test: 'checkLanguageOfPage',
    },
    '3.1.2': {
      name: 'Language of Parts',
      level: 'AA',
      description: 'Language of parts is specified',
      test: 'checkLanguageOfParts',
    },
    '3.2.1': {
      name: 'On Focus',
      level: 'A',
      description: 'Focus does not trigger context changes',
      test: 'checkOnFocus',
    },
    '3.2.2': {
      name: 'On Input',
      level: 'A',
      description: 'Input does not trigger context changes',
      test: 'checkOnInput',
    },
    '3.2.3': {
      name: 'Consistent Navigation',
      level: 'AA',
      description: 'Navigation is consistent',
      test: 'checkConsistentNavigation',
    },
    '3.2.4': {
      name: 'Consistent Identification',
      level: 'AA',
      description: 'Components are identified consistently',
      test: 'checkConsistentIdentification',
    },
    '4.1.1': {
      name: 'Parsing',
      level: 'A',
      description: 'Markup is valid',
      test: 'checkParsing',
    },
    '4.1.2': {
      name: 'Name, Role, Value',
      level: 'A',
      description: 'Elements have accessible names and roles',
      test: 'checkNameRoleValue',
    },
  },
  testResults: {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0,
    errors: [],
    warnings: [],
    compliance: {
      level: 'AA',
      score: 0,
      guidelines: {},
    },
  },
};

// Run WCAG compliance test for a page
const runWCAGComplianceTest = async (page) => {
  console.log(`🔍 Testing WCAG compliance for ${page.name} (${page.path})...`);
  
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
    
    // Run WCAG compliance checks
    const results = await checkWCAGCompliance(html, page);
    
    console.log(`  ✅ Completed in ${duration.toFixed(2)}ms`);
    console.log(`  Passed: ${results.passed}`);
    console.log(`  Failed: ${results.failed}`);
    console.log(`  Warnings: ${results.warnings}`);
    console.log(`  Compliance Score: ${results.complianceScore}%`);
    
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
      results: { passed: 0, failed: 1, warnings: 0, errors: [error.message], complianceScore: 0 },
    };
  }
};

// Check WCAG compliance
const checkWCAGCompliance = async (html, page) => {
  const results = {
    passed: 0,
    failed: 0,
    warnings: 0,
    errors: [],
    warnings: [],
    complianceScore: 0,
    guidelines: {},
  };
  
  // Run tests for each required guideline
  for (const guidelineId of page.requiredGuidelines) {
    const guideline = config.wcagGuidelines[guidelineId];
    if (!guideline) continue;
    
    const testFunction = guideline.test;
    if (typeof window[testFunction] === 'function') {
      const testResult = await window[testFunction](html);
      results.passed += testResult.passed;
      results.failed += testResult.failed;
      results.warnings += testResult.warnings;
      results.errors.push(...testResult.errors);
      results.warnings.push(...testResult.warnings);
      
      results.guidelines[guidelineId] = {
        name: guideline.name,
        level: guideline.level,
        passed: testResult.passed,
        failed: testResult.failed,
        warnings: testResult.warnings,
        errors: testResult.errors,
        warnings: testResult.warnings,
      };
    }
  }
  
  // Calculate compliance score
  const totalTests = results.passed + results.failed + results.warnings;
  if (totalTests > 0) {
    results.complianceScore = Math.round((results.passed / totalTests) * 100);
  }
  
  return results;
};

// WCAG test functions
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
  
  return result;
};

const checkAudioVideoAlternatives = async (html) => {
  const result = { passed: 0, failed: 0, warnings: 0, errors: [], warnings: [] };
  
  // Check for audio/video elements
  const audioRegex = /<audio[^>]+>/g;
  const videoRegex = /<video[^>]+>/g;
  
  const audioElements = html.match(audioRegex) || [];
  const videoElements = html.match(videoRegex) || [];
  
  for (const audio of audioElements) {
    if (!audio.includes('controls')) {
      result.failed++;
      result.errors.push('Audio element missing controls');
    } else {
      result.passed++;
    }
  }
  
  for (const video of videoElements) {
    if (!video.includes('controls')) {
      result.failed++;
      result.errors.push('Video element missing controls');
    } else {
      result.passed++;
    }
  }
  
  return result;
};

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
  
  return result;
};

const checkMeaningfulSequence = async (html) => {
  const result = { passed: 0, failed: 0, warnings: 0, errors: [], warnings: [] };
  
  // Check for proper content structure
  const contentRegex = /<main[^>]*>|<section[^>]*>|<article[^>]*>|<nav[^>]*>|<aside[^>]*>/g;
  const contentElements = html.match(contentRegex) || [];
  
  if (contentElements.length > 0) {
    result.passed++;
  } else {
    result.warnings++;
    result.warnings.push('No semantic content structure found');
  }
  
  return result;
};

const checkSensoryCharacteristics = async (html) => {
  const result = { passed: 0, failed: 0, warnings: 0, errors: [], warnings: [] };
  
  // Check for sensory-dependent instructions
  const sensoryPatterns = [
    /click the red button/gi,
    /the green text/gi,
    /the blue link/gi,
    /the yellow highlight/gi,
  ];
  
  for (const pattern of sensoryPatterns) {
    const matches = html.match(pattern) || [];
    if (matches.length > 0) {
      result.failed++;
      result.errors.push('Instructions rely on sensory characteristics');
    }
  }
  
  result.passed = 1; // This is a warning, not a failure
  
  return result;
};

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

const checkAudioControl = async (html) => {
  const result = { passed: 0, failed: 0, warnings: 0, errors: [], warnings: [] };
  
  // Check for audio elements with controls
  const audioRegex = /<audio[^>]+>/g;
  const audioElements = html.match(audioRegex) || [];
  
  for (const audio of audioElements) {
    if (audio.includes('controls')) {
      result.passed++;
    } else {
      result.failed++;
      result.errors.push('Audio element missing controls');
    }
  }
  
  return result;
};

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

const checkResizeText = async (html) => {
  const result = { passed: 0, failed: 0, warnings: 0, errors: [], warnings: [] };
  
  // Check for fixed font sizes
  const fixedSizePatterns = [
    /font-size:\s*\d+px/g,
    /font-size:\s*\d+pt/g,
  ];
  
  for (const pattern of fixedSizePatterns) {
    const matches = html.match(pattern) || [];
    if (matches.length > 0) {
      result.warnings++;
      result.warnings.push('Fixed font sizes may prevent text resizing');
    }
  }
  
  result.passed = 1; // This is a warning, not a failure
  
  return result;
};

const checkImagesOfText = async (html) => {
  const result = { passed: 0, failed: 0, warnings: 0, errors: [], warnings: [] };
  
  // Check for images that might contain text
  const imgRegex = /<img[^>]+>/g;
  const images = html.match(imgRegex) || [];
  
  for (const img of images) {
    if (img.includes('alt=')) {
      const altMatch = img.match(/alt="([^"]+)"/);
      if (altMatch && altMatch[1].length > 0) {
        result.passed++;
      } else {
        result.warnings++;
        result.warnings.push('Image may contain text');
      }
    } else {
      result.warnings++;
      result.warnings.push('Image may contain text');
    }
  }
  
  return result;
};

const checkKeyboard = async (html) => {
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

const checkNoKeyboardTrap = async (html) => {
  const result = { passed: 0, failed: 0, warnings: 0, errors: [], warnings: [] };
  
  // Check for keyboard trap patterns
  const trapPatterns = [
    /tabindex="[^"]*"/g,
    /onkeydown="[^"]*"/g,
    /onkeyup="[^"]*"/g,
  ];
  
  for (const pattern of trapPatterns) {
    const matches = html.match(pattern) || [];
    if (matches.length > 0) {
      result.warnings++;
      result.warnings.push('Potential keyboard trap detected');
    }
  }
  
  result.passed = 1; // This is a warning, not a failure
  
  return result;
};

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

const checkMultipleWays = async (html) => {
  const result = { passed: 0, failed: 0, warnings: 0, errors: [], warnings: [] };
  
  // Check for multiple navigation methods
  const navPatterns = [
    /<nav[^>]*>/g,
    /<a[^>]+href="[^"]*"[^>]*>/g,
    /<button[^>]+>/g,
  ];
  
  let navCount = 0;
  for (const pattern of navPatterns) {
    const matches = html.match(pattern) || [];
    navCount += matches.length;
  }
  
  if (navCount > 1) {
    result.passed++;
  } else {
    result.warnings++;
    result.warnings.push('Limited navigation options');
  }
  
  return result;
};

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

const checkLanguageOfParts = async (html) => {
  const result = { passed: 0, failed: 0, warnings: 0, errors: [], warnings: [] };
  
  // Check for lang attributes on elements
  const langRegex = /lang="[^"]+"/g;
  const langMatches = html.match(langRegex) || [];
  
  if (langMatches.length > 0) {
    result.passed++;
  } else {
    result.warnings++;
    result.warnings.push('No language attributes found on elements');
  }
  
  return result;
};

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

const checkConsistentNavigation = async (html) => {
  const result = { passed: 0, failed: 0, warnings: 0, errors: [], warnings: [] };
  
  // Check for consistent navigation structure
  const navRegex = /<nav[^>]*>/g;
  const navMatches = html.match(navRegex) || [];
  
  if (navMatches.length > 0) {
    result.passed++;
  } else {
    result.warnings++;
    result.warnings.push('No navigation structure found');
  }
  
  return result;
};

const checkConsistentIdentification = async (html) => {
  const result = { passed: 0, failed: 0, warnings: 0, errors: [], warnings: [] };
  
  // Check for consistent component identification
  const componentPatterns = [
    /class="[^"]*button[^"]*"/g,
    /class="[^"]*link[^"]*"/g,
    /class="[^"]*input[^"]*"/g,
  ];
  
  let componentCount = 0;
  for (const pattern of componentPatterns) {
    const matches = html.match(pattern) || [];
    componentCount += matches.length;
  }
  
  if (componentCount > 0) {
    result.passed++;
  } else {
    result.warnings++;
    result.warnings.push('No consistent component identification found');
  }
  
  return result;
};

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

// Run all WCAG compliance tests
const runAllWCAGComplianceTests = async () => {
  console.log('♿ Starting WCAG compliance tests...');
  console.log(`Base URL: ${config.baseUrl}`);
  console.log(`WCAG Version: ${config.wcagVersion}`);
  console.log(`Compliance Level: ${config.complianceLevel}`);
  console.log(`Test pages: ${config.testPages.length}`);
  console.log('');
  
  const startTime = performance.now();
  
  for (const page of config.testPages) {
    try {
      const result = await runWCAGComplianceTest(page);
      config.testResults.total += result.results.passed + result.results.failed + result.results.warnings;
      config.testResults.passed += result.results.passed;
      config.testResults.failed += result.results.failed;
      config.testResults.warnings += result.results.warnings;
      config.testResults.errors.push(...result.results.errors);
      config.testResults.warnings.push(...result.results.warnings);
      
      // Update compliance score
      config.testResults.compliance.score = Math.round(
        (config.testResults.passed / config.testResults.total) * 100
      );
      
    } catch (error) {
      console.error(`❌ Test failed: ${page.name}`, error.message);
    }
  }
  
  const endTime = performance.now();
  
  // Generate report
  generateWCAGComplianceReport(endTime - startTime);
  
  return config.testResults;
};

// Generate WCAG compliance report
const generateWCAGComplianceReport = (duration) => {
  const report = {
    timestamp: new Date().toISOString(),
    wcagVersion: config.wcagVersion,
    complianceLevel: config.complianceLevel,
    summary: {
      total: config.testResults.total,
      passed: config.testResults.passed,
      failed: config.testResults.failed,
      warnings: config.testResults.warnings,
      successRate: (config.testResults.passed / config.testResults.total) * 100,
      complianceScore: config.testResults.compliance.score,
      duration,
    },
    errors: config.testResults.errors,
    warnings: config.testResults.warnings,
    guidelines: config.wcagGuidelines,
    recommendations: generateWCAGRecommendations(),
  };
  
  // Save report
  const reportPath = path.join(__dirname, '..', '..', 'quality-reports', 'wcag-compliance-report.json');
  const reportDir = path.dirname(reportPath);
  
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📁 WCAG compliance report saved to: ${reportPath}`);
  
  // Display summary
  console.log('\n📊 WCAG Compliance Summary:');
  console.log('===========================');
  console.log(`WCAG Version: ${config.wcagVersion}`);
  console.log(`Compliance Level: ${config.complianceLevel}`);
  console.log(`Total tests: ${config.testResults.total}`);
  console.log(`Passed: ${config.testResults.passed}`);
  console.log(`Failed: ${config.testResults.failed}`);
  console.log(`Warnings: ${config.testResults.warnings}`);
  console.log(`Success rate: ${((config.testResults.passed / config.testResults.total) * 100).toFixed(2)}%`);
  console.log(`Compliance score: ${config.testResults.compliance.score}%`);
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

// Generate WCAG recommendations
const generateWCAGRecommendations = () => {
  const recommendations = [];
  
  if (config.testResults.failed > 0) {
    recommendations.push('Fix all WCAG compliance errors');
    recommendations.push('Implement proper ARIA labels and roles');
    recommendations.push('Ensure keyboard navigation works');
    recommendations.push('Add skip links for main content');
    recommendations.push('Use semantic HTML elements');
    recommendations.push('Test with screen readers');
  }
  
  if (config.testResults.warnings > 0) {
    recommendations.push('Address WCAG compliance warnings');
    recommendations.push('Improve color contrast');
    recommendations.push('Add focus indicators');
    recommendations.push('Test with assistive technologies');
  }
  
  recommendations.push('Follow WCAG 2.1 guidelines');
  recommendations.push('Test with real users with disabilities');
  recommendations.push('Use automated accessibility testing tools');
  recommendations.push('Regular accessibility audits');
  recommendations.push('Train developers on accessibility best practices');
  
  return recommendations;
};

// Run if called directly
if (require.main === module) {
  runAllWCAGComplianceTests().catch(error => {
    console.error('❌ WCAG compliance test failed:', error.message);
    process.exit(1);
  });
}

module.exports = {
  runAllWCAGComplianceTests,
  runWCAGComplianceTest,
  checkWCAGCompliance,
  config,
  testResults: config.testResults,
};
