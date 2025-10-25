import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { chromium, Browser, Page } from 'playwright';
import { PrismaClient } from '@prisma/client';

describe('Opportunity Matching Flow - E2E Tests', () => {
  let browser: Browser;
  let page: Page;
  let prisma: PrismaClient;
  let volunteerToken: string;
  let institutionToken: string;

  beforeAll(async () => {
    browser = await chromium.launch({ headless: false });
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/volunteer_app_test'
        }
      }
    });
  });

  afterAll(async () => {
    if (browser) {
      await browser.close();
    }
    if (prisma) {
      await prisma.$disconnect();
    }
  });

  beforeEach(async () => {
    page = await browser.newPage();
    
    // Clean database
    await prisma.$executeRaw`TRUNCATE TABLE "User", "Institution", "Opportunity", "Match", "Participation" RESTART IDENTITY CASCADE;`;
    
    // Create test users
    const volunteer = await prisma.user.create({
      data: {
        email: 'volunteer@example.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        name: 'Test Volunteer',
        type: 'VOLUNTEER',
        isEmailVerified: true,
        preferences: {
          categories: ['ENVIRONMENTAL', 'SOCIAL'],
          maxDistance: 50,
          availableDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY'],
          timeSlots: ['MORNING', 'AFTERNOON']
        },
        location: {
          latitude: -23.5505,
          longitude: -46.6333,
          address: 'São Paulo, SP, Brazil'
        }
      }
    });

    const institution = await prisma.institution.create({
      data: {
        email: 'institution@example.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        name: 'Test Institution',
        type: 'NGO',
        isEmailVerified: true
      }
    });

    // Create test opportunities
    await prisma.opportunity.createMany({
      data: [
        {
          title: 'Environmental Cleanup',
          description: 'Help clean up the local park',
          category: 'ENVIRONMENTAL',
          location: 'Central Park, São Paulo',
          institutionId: institution.id,
          status: 'ACTIVE',
          maxVolunteers: 20,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          requirements: ['Physical fitness', 'Environmental awareness'],
          benefits: ['Community service hours', 'Environmental impact']
        },
        {
          title: 'Social Support',
          description: 'Help elderly people in the community',
          category: 'SOCIAL',
          location: 'Community Center, São Paulo',
          institutionId: institution.id,
          status: 'ACTIVE',
          maxVolunteers: 15,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          requirements: ['Communication skills', 'Empathy'],
          benefits: ['Personal growth', 'Community impact']
        }
      ]
    });

    // Get auth tokens
    const volunteerLogin = await page.request.post('http://localhost:3000/api/auth/login', {
      data: {
        email: 'volunteer@example.com',
        password: 'password'
      }
    });
    const volunteerData = await volunteerLogin.json();
    volunteerToken = volunteerData.token;

    const institutionLogin = await page.request.post('http://localhost:3000/api/auth/login', {
      data: {
        email: 'institution@example.com',
        password: 'password'
      }
    });
    const institutionData = await institutionLogin.json();
    institutionToken = institutionData.token;
  });

  test('should complete opportunity matching flow successfully', async () => {
    // Login as volunteer
    await page.goto('http://localhost:3000/login');
    await page.fill('[data-testid="email-input"]', 'volunteer@example.com');
    await page.fill('[data-testid="password-input"]', 'password');
    await page.click('[data-testid="login-button"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Navigate to opportunities page
    await page.click('[data-testid="opportunities-nav"]');
    await page.waitForURL('**/opportunities', { timeout: 5000 });
    
    // Verify opportunities are displayed
    const opportunityCards = await page.locator('[data-testid="opportunity-card"]');
    await expect(opportunityCards).toHaveCount(2);
    
    // Click on first opportunity
    await opportunityCards.first().click();
    
    // Wait for opportunity details page
    await page.waitForURL('**/opportunities/*', { timeout: 5000 });
    
    // Verify opportunity details are displayed
    const title = await page.textContent('[data-testid="opportunity-title"]');
    expect(title).toBe('Environmental Cleanup');
    
    const description = await page.textContent('[data-testid="opportunity-description"]');
    expect(description).toContain('Help clean up the local park');
    
    // Click apply button
    await page.click('[data-testid="apply-button"]');
    
    // Wait for application confirmation
    await page.waitForSelector('[data-testid="application-success"]', { timeout: 5000 });
    
    const successMessage = await page.textContent('[data-testid="application-success"]');
    expect(successMessage).toContain('Application submitted successfully');
    
    // Verify application was created in database
    const application = await prisma.participation.findFirst({
      where: {
        userId: 1, // volunteer ID
        opportunityId: 1 // first opportunity ID
      }
    });
    expect(application).toBeTruthy();
    expect(application.status).toBe('PENDING');
  });

  test('should find and display matching opportunities', async () => {
    // Login as volunteer
    await page.goto('http://localhost:3000/login');
    await page.fill('[data-testid="email-input"]', 'volunteer@example.com');
    await page.fill('[data-testid="password-input"]', 'password');
    await page.click('[data-testid="login-button"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Navigate to matching page
    await page.click('[data-testid="matching-nav"]');
    await page.waitForURL('**/matching', { timeout: 5000 });
    
    // Click find matches button
    await page.click('[data-testid="find-matches-button"]');
    
    // Wait for matches to load
    await page.waitForSelector('[data-testid="match-card"]', { timeout: 10000 });
    
    // Verify matches are displayed
    const matchCards = await page.locator('[data-testid="match-card"]');
    await expect(matchCards).toHaveCount(2);
    
    // Verify match scores are displayed
    const firstMatchScore = await page.textContent('[data-testid="match-score"]');
    expect(firstMatchScore).toMatch(/\d+%/);
    
    // Verify match reasons are displayed
    const matchReasons = await page.locator('[data-testid="match-reason"]');
    await expect(matchReasons).toHaveCountGreaterThan(0);
    
    // Click on first match
    await matchCards.first().click();
    
    // Wait for opportunity details
    await page.waitForURL('**/opportunities/*', { timeout: 5000 });
    
    // Verify we're on the correct opportunity page
    const title = await page.textContent('[data-testid="opportunity-title"]');
    expect(title).toBe('Environmental Cleanup');
  });

  test('should filter opportunities by category', async () => {
    // Login as volunteer
    await page.goto('http://localhost:3000/login');
    await page.fill('[data-testid="email-input"]', 'volunteer@example.com');
    await page.fill('[data-testid="password-input"]', 'password');
    await page.click('[data-testid="login-button"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Navigate to opportunities page
    await page.click('[data-testid="opportunities-nav"]');
    await page.waitForURL('**/opportunities', { timeout: 5000 });
    
    // Filter by environmental category
    await page.selectOption('[data-testid="category-filter"]', 'ENVIRONMENTAL');
    
    // Wait for filter to apply
    await page.waitForTimeout(1000);
    
    // Verify only environmental opportunities are shown
    const opportunityCards = await page.locator('[data-testid="opportunity-card"]');
    await expect(opportunityCards).toHaveCount(1);
    
    const category = await page.textContent('[data-testid="opportunity-category"]');
    expect(category).toBe('Environmental');
  });

  test('should search opportunities by keyword', async () => {
    // Login as volunteer
    await page.goto('http://localhost:3000/login');
    await page.fill('[data-testid="email-input"]', 'volunteer@example.com');
    await page.fill('[data-testid="password-input"]', 'password');
    await page.click('[data-testid="login-button"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Navigate to opportunities page
    await page.click('[data-testid="opportunities-nav"]');
    await page.waitForURL('**/opportunities', { timeout: 5000 });
    
    // Search for "environmental"
    await page.fill('[data-testid="search-input"]', 'environmental');
    await page.click('[data-testid="search-button"]');
    
    // Wait for search results
    await page.waitForTimeout(1000);
    
    // Verify search results
    const opportunityCards = await page.locator('[data-testid="opportunity-card"]');
    await expect(opportunityCards).toHaveCount(1);
    
    const title = await page.textContent('[data-testid="opportunity-title"]');
    expect(title.toLowerCase()).toContain('environmental');
  });

  test('should update match preferences', async () => {
    // Login as volunteer
    await page.goto('http://localhost:3000/login');
    await page.fill('[data-testid="email-input"]', 'volunteer@example.com');
    await page.fill('[data-testid="password-input"]', 'password');
    await page.click('[data-testid="login-button"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Navigate to profile page
    await page.click('[data-testid="profile-nav"]');
    await page.waitForURL('**/profile', { timeout: 5000 });
    
    // Click on preferences tab
    await page.click('[data-testid="preferences-tab"]');
    
    // Update preferences
    await page.uncheck('[data-testid="environmental-checkbox"]');
    await page.check('[data-testid="educational-checkbox"]');
    await page.selectOption('[data-testid="max-distance-select"]', '100');
    await page.check('[data-testid="evening-checkbox"]');
    
    // Save preferences
    await page.click('[data-testid="save-preferences-button"]');
    
    // Wait for success message
    await page.waitForSelector('[data-testid="preferences-success"]', { timeout: 5000 });
    
    const successMessage = await page.textContent('[data-testid="preferences-success"]');
    expect(successMessage).toContain('Preferences updated successfully');
    
    // Verify preferences were updated in database
    const user = await prisma.user.findUnique({
      where: { email: 'volunteer@example.com' }
    });
    expect(user.preferences.categories).toContain('EDUCATIONAL');
    expect(user.preferences.categories).not.toContain('ENVIRONMENTAL');
    expect(user.preferences.maxDistance).toBe(100);
    expect(user.preferences.timeSlots).toContain('EVENING');
  });

  test('should handle application rejection gracefully', async () => {
    // Login as institution
    await page.goto('http://localhost:3000/login');
    await page.fill('[data-testid="email-input"]', 'institution@example.com');
    await page.fill('[data-testid="password-input"]', 'password');
    await page.click('[data-testid="login-button"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Navigate to applications page
    await page.click('[data-testid="applications-nav"]');
    await page.waitForURL('**/applications', { timeout: 5000 });
    
    // Create a test application first
    await prisma.participation.create({
      data: {
        userId: 1,
        opportunityId: 1,
        status: 'PENDING',
        appliedAt: new Date()
      }
    });
    
    // Refresh page to see application
    await page.reload();
    
    // Wait for application to appear
    await page.waitForSelector('[data-testid="application-card"]', { timeout: 5000 });
    
    // Click reject button
    await page.click('[data-testid="reject-button"]');
    
    // Wait for confirmation dialog
    await page.waitForSelector('[data-testid="reject-confirmation"]', { timeout: 5000 });
    
    // Confirm rejection
    await page.click('[data-testid="confirm-reject-button"]');
    
    // Wait for success message
    await page.waitForSelector('[data-testid="rejection-success"]', { timeout: 5000 });
    
    const successMessage = await page.textContent('[data-testid="rejection-success"]');
    expect(successMessage).toContain('Application rejected');
    
    // Verify application status was updated in database
    const application = await prisma.participation.findFirst({
      where: {
        userId: 1,
        opportunityId: 1
      }
    });
    expect(application.status).toBe('REJECTED');
  });
});
