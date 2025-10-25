# Accessibility Tests

This directory contains accessibility tests and WCAG compliance checks for the volunteer application.

## Test Types

### 1. Accessibility Tests (`accessibility-test.js`)
- **Purpose**: Test for basic accessibility compliance
- **Tests**: Images, forms, headings, links, keyboard navigation, etc.
- **WCAG Level**: AA compliance

### 2. WCAG Compliance Tests (`wcag-compliance.js`)
- **Purpose**: Comprehensive WCAG 2.1 compliance testing
- **Tests**: All WCAG 2.1 guidelines for AA level
- **Coverage**: Complete accessibility audit

## Running Tests

### Prerequisites
```bash
# Install dependencies
npm install

# Start the application
npm run dev
```

### Run All Accessibility Tests
```bash
# Run all accessibility tests
npm run test:accessibility

# Run specific test types
npm run test:accessibility:basic
npm run test:accessibility:wcag
```

### Individual Test Files
```bash
# Basic accessibility tests
node tests/accessibility/accessibility-test.js

# WCAG compliance tests
node tests/accessibility/wcag-compliance.js
```

## Test Configuration

### Accessibility Test Configuration
```javascript
const config = {
  baseUrl: 'http://localhost:3000',
  timeout: 30000,
  testPages: [
    {
      name: 'Home Page',
      path: '/',
      wcagLevel: 'AA',
    },
    // ... more pages
  ],
  wcagGuidelines: {
    '1.1.1': {
      name: 'Non-text Content',
      level: 'A',
      description: 'All non-text content has a text alternative',
    },
    // ... more guidelines
  },
};
```

### WCAG Compliance Configuration
```javascript
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
    // ... more pages
  ],
};
```

## Test Results

### Output Files
- `quality-reports/accessibility-report.json` - Basic accessibility test results
- `quality-reports/wcag-compliance-report.json` - WCAG compliance test results

### Metrics Explained

#### Accessibility Test Metrics
- **Total Tests**: Number of accessibility tests run
- **Passed**: Number of tests that passed
- **Failed**: Number of tests that failed
- **Warnings**: Number of tests with warnings
- **Success Rate**: Percentage of tests that passed

#### WCAG Compliance Metrics
- **Compliance Score**: Overall WCAG compliance percentage
- **WCAG Level**: Target compliance level (A, AA, AAA)
- **Guidelines**: Individual guideline compliance status
- **Errors**: Specific accessibility errors found
- **Warnings**: Accessibility warnings and recommendations

## WCAG Guidelines Tested

### Level A Guidelines
- **1.1.1 Non-text Content** - All non-text content has text alternatives
- **1.2.1 Audio-only and Video-only** - Audio/video content has alternatives
- **1.3.1 Info and Relationships** - Information is programmatically determinable
- **1.3.2 Meaningful Sequence** - Content is presented in meaningful sequence
- **1.3.3 Sensory Characteristics** - Instructions don't rely on sensory characteristics
- **1.4.1 Use of Color** - Color is not the only means of conveying information
- **1.4.2 Audio Control** - Audio can be paused or stopped
- **2.1.1 Keyboard** - All functionality is available from keyboard
- **2.1.2 No Keyboard Trap** - Keyboard focus is not trapped
- **2.4.1 Bypass Blocks** - Skip links are provided
- **2.4.2 Page Titled** - Pages have descriptive titles
- **2.4.3 Focus Order** - Focus order is logical
- **2.4.4 Link Purpose** - Link purpose is clear
- **3.1.1 Language of Page** - Page language is specified
- **3.2.1 On Focus** - Focus doesn't trigger context changes
- **3.2.2 On Input** - Input doesn't trigger context changes
- **4.1.1 Parsing** - Markup is valid
- **4.1.2 Name, Role, Value** - Elements have accessible names and roles

### Level AA Guidelines
- **1.4.3 Contrast (Minimum)** - Text has sufficient contrast ratio
- **1.4.4 Resize Text** - Text can be resized up to 200%
- **1.4.5 Images of Text** - Images of text are avoided
- **2.4.5 Multiple Ways** - Multiple ways to reach content
- **2.4.6 Headings and Labels** - Headings and labels are descriptive
- **2.4.7 Focus Visible** - Focus is visible
- **3.1.2 Language of Parts** - Language of parts is specified
- **3.2.3 Consistent Navigation** - Navigation is consistent
- **3.2.4 Consistent Identification** - Components are identified consistently

## Accessibility Best Practices

### Images
1. **Alt Text**: Provide descriptive alt text for all images
2. **Decorative Images**: Use empty alt text for decorative images
3. **Complex Images**: Provide detailed descriptions for complex images
4. **Image Maps**: Use client-side image maps with alt text

### Forms
1. **Labels**: Associate labels with form controls
2. **Fieldsets**: Use fieldsets to group related form controls
3. **Error Messages**: Provide clear, accessible error messages
4. **Required Fields**: Clearly indicate required fields

### Headings
1. **Hierarchy**: Use proper heading hierarchy (h1, h2, h3, etc.)
2. **Descriptive**: Use descriptive heading text
3. **Structure**: Use headings to structure content logically

### Links
1. **Purpose**: Make link purpose clear from link text
2. **Context**: Provide context for links when needed
3. **Underlined**: Ensure links are visually distinct

### Keyboard Navigation
1. **Tab Order**: Ensure logical tab order
2. **Focus Indicators**: Provide visible focus indicators
3. **Skip Links**: Provide skip links for main content
4. **Keyboard Traps**: Avoid keyboard traps

### Color and Contrast
1. **Contrast Ratio**: Ensure sufficient contrast ratio (4.5:1 for normal text)
2. **Color Independence**: Don't rely on color alone to convey information
3. **Color Blindness**: Consider colorblind users

### Screen Readers
1. **Semantic HTML**: Use semantic HTML elements
2. **ARIA Labels**: Use ARIA labels when needed
3. **Live Regions**: Use live regions for dynamic content
4. **Landmarks**: Use ARIA landmarks for page structure

## Testing Tools

### Automated Testing
- **axe-core** - JavaScript accessibility testing library
- **pa11y** - Command-line accessibility testing tool
- **Lighthouse** - Google's accessibility auditing tool
- **WAVE** - Web accessibility evaluation tool

### Manual Testing
- **Screen Readers** - NVDA, JAWS, VoiceOver
- **Keyboard Navigation** - Tab, arrow keys, Enter, Space
- **Zoom Testing** - Test at 200% zoom
- **Color Testing** - Test with color filters

### Browser Extensions
- **axe DevTools** - Chrome/Firefox extension
- **WAVE** - Chrome/Firefox extension
- **Accessibility Insights** - Microsoft's accessibility tool
- **Color Contrast Analyzer** - Chrome extension

## Common Issues

### Images
- Missing alt text
- Decorative images with alt text
- Complex images without descriptions
- Image maps without alt text

### Forms
- Missing labels
- Unclear error messages
- Required fields not indicated
- Form controls not grouped

### Headings
- Skipped heading levels
- Empty headings
- Non-descriptive headings
- Poor heading hierarchy

### Links
- Unclear link text
- Links without context
- Links that open in new windows without warning
- Links that are not keyboard accessible

### Keyboard Navigation
- Elements not keyboard accessible
- Poor tab order
- Missing focus indicators
- Keyboard traps

### Color and Contrast
- Insufficient contrast ratio
- Color-only information
- Poor color choices for colorblind users
- Missing alternative indicators

## Testing Checklist

### Before Testing
- [ ] Application is running
- [ ] Test pages are accessible
- [ ] Test data is available
- [ ] Testing tools are installed

### During Testing
- [ ] Run automated tests
- [ ] Test with keyboard navigation
- [ ] Test with screen reader
- [ ] Test at different zoom levels
- [ ] Test with color filters

### After Testing
- [ ] Review test results
- [ ] Fix identified issues
- [ ] Re-test after fixes
- [ ] Document findings
- [ ] Update accessibility guidelines

## Continuous Accessibility

### CI/CD Integration
```yaml
name: Accessibility Tests
on: [push, pull_request]
jobs:
  accessibility:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run test:accessibility
```

### Monitoring
- **Accessibility alerts** for new issues
- **Regular audits** of accessibility compliance
- **User feedback** from users with disabilities
- **Performance monitoring** for accessibility features

### Training
- **Developer training** on accessibility best practices
- **Designer training** on accessible design
- **Content creator training** on accessible content
- **QA training** on accessibility testing

## Resources

### WCAG Guidelines
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WCAG 2.1 Techniques](https://www.w3.org/WAI/WCAG21/Techniques/)
- [WCAG 2.1 Understanding](https://www.w3.org/WAI/WCAG21/Understanding/)

### Testing Tools
- [axe-core](https://github.com/dequelabs/axe-core)
- [pa11y](https://pa11y.org/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WAVE](https://wave.webaim.org/)

### Screen Readers
- [NVDA](https://www.nvaccess.org/)
- [JAWS](https://www.freedomscientific.com/products/software/jaws/)
- [VoiceOver](https://www.apple.com/accessibility/vision/)

### Browser Extensions
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE](https://wave.webaim.org/extension/)
- [Accessibility Insights](https://accessibilityinsights.io/)
