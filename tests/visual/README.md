# Visual Regression Tests

This directory contains visual regression tests and screenshot tests for the volunteer application.

## Test Types

### 1. Visual Regression Tests (`visual-regression-test.js`)
- **Purpose**: Compare current screenshots with baseline images
- **Tests**: Full page and element screenshots across different breakpoints
- **Comparison**: Pixel-level comparison with configurable thresholds

### 2. Screenshot Tests (`screenshot-test.js`)
- **Purpose**: Generate comprehensive screenshots of all pages
- **Tests**: Full page and element screenshots for documentation
- **Output**: Screenshot gallery and detailed reports

### 3. Component Tests (`component-test.js`)
- **Purpose**: Test individual UI components in different states
- **Tests**: Component screenshots across breakpoints and states
- **States**: Default, hover, focused, active, disabled, etc.

## Running Tests

### Prerequisites
```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium

# Start the application
npm run dev
```

### Run All Visual Tests
```bash
# Run all visual tests
npm run test:visual

# Run specific test types
npm run test:visual:regression
npm run test:visual:screenshot
npm run test:visual:component
```

### Individual Test Files
```bash
# Visual regression tests
node tests/visual/visual-regression-test.js

# Screenshot tests
node tests/visual/screenshot-test.js

# Component tests
node tests/visual/component-test.js
```

## Test Configuration

### Visual Regression Configuration
```javascript
const config = {
  baseUrl: 'http://localhost:3000',
  timeout: 30000,
  viewport: { width: 1920, height: 1080 },
  testPages: [
    {
      name: 'Home Page',
      path: '/',
      selectors: ['.header', '.main-content', '.footer'],
    },
    // ... more pages
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
};
```

### Screenshot Configuration
```javascript
const config = {
  baseUrl: 'http://localhost:3000',
  timeout: 30000,
  viewport: { width: 1920, height: 1080 },
  testPages: [
    {
      name: 'Home Page',
      path: '/',
      description: 'Main landing page with opportunities list',
      waitForSelector: '.opportunity-card',
    },
    // ... more pages
  ],
  breakpoints: [
    { name: 'desktop', width: 1920, height: 1080 },
    { name: 'laptop', width: 1366, height: 768 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'mobile', width: 375, height: 667 },
  ],
};
```

### Component Configuration
```javascript
const config = {
  baseUrl: 'http://localhost:3000',
  timeout: 30000,
  viewport: { width: 1920, height: 1080 },
  components: [
    {
      name: 'OpportunityCard',
      selector: '.opportunity-card',
      description: 'Opportunity card component',
      states: ['default', 'hover', 'selected'],
    },
    // ... more components
  ],
  breakpoints: [
    { name: 'desktop', width: 1920, height: 1080 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'mobile', width: 375, height: 667 },
  ],
};
```

## Test Results

### Output Files
- `quality-reports/visual-regression/` - Visual regression test results
- `quality-reports/screenshots/` - Screenshot test results
- `quality-reports/component-screenshots/` - Component test results

### Screenshot Organization
```
quality-reports/
├── visual-regression/
│   ├── baselines/           # Baseline images for comparison
│   ├── screenshots/         # Current screenshots
│   ├── differences/         # Difference images
│   └── visual-regression-report.json
├── screenshots/
│   ├── screenshots/         # Generated screenshots
│   ├── gallery.html         # Screenshot gallery
│   └── screenshot-report.json
└── component-screenshots/
    ├── screenshots/         # Component screenshots
    ├── component-gallery.html
    └── component-report.json
```

### Metrics Explained

#### Visual Regression Metrics
- **Total Tests**: Number of screenshot comparisons
- **Passed**: Number of screenshots that match baselines
- **Failed**: Number of screenshots that differ from baselines
- **Difference**: Percentage of pixel differences
- **Threshold**: Configurable difference threshold

#### Screenshot Metrics
- **Total Screenshots**: Number of screenshots taken
- **Pages Tested**: Number of pages tested
- **Breakpoints Tested**: Number of breakpoints tested
- **Success Rate**: Percentage of successful screenshots

#### Component Metrics
- **Components Tested**: Number of components tested
- **States Tested**: Number of component states tested
- **Breakpoints Tested**: Number of breakpoints tested
- **Total Screenshots**: Total number of component screenshots

## Visual Testing Best Practices

### Screenshot Consistency
1. **Disable Animations**: Use `animations: 'disabled'` for consistent screenshots
2. **Wait for Load**: Wait for `networkidle` and DOM content loaded
3. **Stable Layout**: Wait for layout to stabilize before taking screenshots
4. **Consistent Viewport**: Use consistent viewport sizes across tests

### Component Testing
1. **State Management**: Test all component states (hover, focus, active, etc.)
2. **Breakpoint Testing**: Test components across different screen sizes
3. **Interaction Testing**: Test user interactions and state changes
4. **Error States**: Test error and loading states

### Baseline Management
1. **Version Control**: Keep baseline images in version control
2. **Regular Updates**: Update baselines when UI changes are intentional
3. **Review Changes**: Always review visual changes before accepting
4. **Documentation**: Document intentional visual changes

## Common Issues

### Screenshot Failures
- **Element Not Found**: Selector doesn't match any element
- **Timeout**: Page takes too long to load
- **Layout Shifts**: Content moves after screenshot is taken
- **Animation Interference**: Animations cause inconsistent screenshots

### Visual Regression Issues
- **False Positives**: Minor changes flagged as regressions
- **False Negatives**: Real regressions not detected
- **Threshold Tuning**: Need to adjust difference thresholds
- **Baseline Drift**: Baselines become outdated over time

### Component Testing Issues
- **State Simulation**: Difficult to simulate certain component states
- **Dynamic Content**: Components with dynamic content are hard to test
- **Cross-browser**: Different browsers may render components differently
- **Performance**: Component tests can be slow with many states

## Troubleshooting

### Common Solutions

#### Screenshot Not Found
```bash
# Check if element exists
await page.$(selector)

# Wait for element to appear
await page.waitForSelector(selector, { timeout: 10000 })

# Check if page loaded correctly
await page.waitForLoadState('networkidle')
```

#### Layout Shifts
```bash
# Wait for layout to stabilize
await page.waitForTimeout(2000)

# Wait for specific elements
await page.waitForSelector('.content-loaded')

# Disable animations
await page.addStyleTag({
  content: '* { animation: none !important; transition: none !important; }'
})
```

#### False Positives
```bash
# Adjust threshold
thresholds: {
  pixelmatch: 0.05, // 5% instead of 10%
  perceptual: 0.05,
}

# Use perceptual comparison
const comparison = await compareScreenshots(current, baseline, {
  threshold: 0.1,
  perceptual: true,
});
```

## Continuous Integration

### GitHub Actions
```yaml
name: Visual Tests
on: [push, pull_request]
jobs:
  visual:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npx playwright install chromium
      - run: npm run dev &
      - run: npm run test:visual
      - uses: actions/upload-artifact@v3
        with:
          name: visual-test-results
          path: quality-reports/
```

### Baseline Updates
```bash
# Update baselines after intentional UI changes
node tests/visual/visual-regression-test.js --update-baselines

# Review changes before committing
git diff quality-reports/visual-regression/baselines/

# Commit updated baselines
git add quality-reports/visual-regression/baselines/
git commit -m "Update visual regression baselines"
```

## Tools and Libraries

### Playwright
- **Screenshot API**: `page.screenshot()`, `element.screenshot()`
- **Viewport Control**: `page.setViewportSize()`
- **Element Interaction**: `element.hover()`, `element.click()`, `element.focus()`
- **Page Navigation**: `page.goto()`, `page.waitForLoadState()`

### Image Comparison
- **pixelmatch**: Pixel-level image comparison
- **perceptual**: Perceptual image comparison
- **threshold**: Configurable difference thresholds
- **diff**: Generate difference images

### Screenshot Management
- **Baseline Storage**: Store reference images
- **Version Control**: Track baseline changes
- **Artifact Storage**: Store test results
- **Gallery Generation**: Create HTML galleries

## Performance Optimization

### Test Speed
1. **Parallel Execution**: Run tests in parallel when possible
2. **Selective Testing**: Test only changed components
3. **Caching**: Cache screenshots when possible
4. **Headless Mode**: Use headless browser for faster execution

### Resource Management
1. **Browser Reuse**: Reuse browser instances
2. **Page Cleanup**: Clean up pages after tests
3. **Memory Management**: Monitor memory usage
4. **Timeout Optimization**: Set appropriate timeouts

## Monitoring and Alerts

### Visual Changes
- **Automated Detection**: Detect visual changes automatically
- **Change Notifications**: Notify team of visual changes
- **Review Process**: Require review for visual changes
- **Rollback**: Easy rollback of visual changes

### Quality Metrics
- **Test Coverage**: Track visual test coverage
- **Failure Rate**: Monitor test failure rates
- **Performance**: Track test execution time
- **Trends**: Monitor visual quality trends over time
