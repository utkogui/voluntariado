import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { chromium, Browser, Page } from 'playwright';
import { PrismaClient } from '@prisma/client';

describe('Institution Management Flow - E2E Tests', () => {
  let browser: Browser;
  let page: Page;
  let prisma: PrismaClient;
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
    await prisma.$executeRaw`TRUNCATE TABLE "User", "Institution", "Opportunity", "Activity", "Participation" RESTART IDENTITY CASCADE;`;
    
    // Create test institution
    const institution = await prisma.institution.create({
      data: {
        email: 'institution@example.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        name: 'Test Institution',
        type: 'NGO',
        isEmailVerified: true,
        description: 'A test NGO for environmental causes',
        website: 'https://test-ngo.org',
        phone: '+5511999999999',
        address: 'Rua das Flores, 123, São Paulo, SP'
      }
    });

    // Get auth token
    const loginResponse = await page.request.post('http://localhost:3000/api/auth/login', {
      data: {
        email: 'institution@example.com',
        password: 'password'
      }
    });
    const loginData = await loginResponse.json();
    institutionToken = loginData.token;
  });

  test('should complete opportunity creation flow successfully', async () => {
    // Login as institution
    await page.goto('http://localhost:3000/login');
    await page.fill('[data-testid="email-input"]', 'institution@example.com');
    await page.fill('[data-testid="password-input"]', 'password');
    await page.click('[data-testid="login-button"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Navigate to create opportunity page
    await page.click('[data-testid="create-opportunity-nav"]');
    await page.waitForURL('**/opportunities/create', { timeout: 5000 });
    
    // Fill opportunity form
    await page.fill('[data-testid="title-input"]', 'Environmental Cleanup Day');
    await page.fill('[data-testid="description-input"]', 'Join us for a day of cleaning up the local park and making a positive impact on the environment.');
    await page.selectOption('[data-testid="category-select"]', 'ENVIRONMENTAL');
    await page.fill('[data-testid="location-input"]', 'Central Park, São Paulo, SP');
    await page.fill('[data-testid="start-date-input"]', '2024-03-15');
    await page.fill('[data-testid="end-date-input"]', '2024-03-15');
    await page.fill('[data-testid="max-volunteers-input"]', '50');
    
    // Add requirements
    await page.fill('[data-testid="requirement-input"]', 'Physical fitness');
    await page.click('[data-testid="add-requirement-button"]');
    await page.fill('[data-testid="requirement-input"]', 'Environmental awareness');
    await page.click('[data-testid="add-requirement-button"]');
    
    // Add benefits
    await page.fill('[data-testid="benefit-input"]', 'Community service hours');
    await page.click('[data-testid="add-benefit-button"]');
    await page.fill('[data-testid="benefit-input"]', 'Environmental impact');
    await page.click('[data-testid="add-benefit-button"]');
    
    // Submit form
    await page.click('[data-testid="submit-button"]');
    
    // Wait for success message
    await page.waitForSelector('[data-testid="success-message"]', { timeout: 10000 });
    
    const successMessage = await page.textContent('[data-testid="success-message"]');
    expect(successMessage).toContain('Opportunity created successfully');
    
    // Verify opportunity was created in database
    const opportunity = await prisma.opportunity.findFirst({
      where: { title: 'Environmental Cleanup Day' }
    });
    expect(opportunity).toBeTruthy();
    expect(opportunity.description).toContain('cleaning up the local park');
    expect(opportunity.category).toBe('ENVIRONMENTAL');
    expect(opportunity.maxVolunteers).toBe(50);
  });

  test('should manage opportunity applications successfully', async () => {
    // Create test opportunity and applications
    const opportunity = await prisma.opportunity.create({
      data: {
        title: 'Test Opportunity',
        description: 'Test Description',
        category: 'ENVIRONMENTAL',
        institutionId: 1,
        status: 'ACTIVE',
        maxVolunteers: 10
      }
    });

    // Create test volunteers and applications
    const volunteer1 = await prisma.user.create({
      data: {
        email: 'volunteer1@example.com',
        password: 'hashedpassword',
        name: 'Volunteer 1',
        type: 'VOLUNTEER',
        isEmailVerified: true
      }
    });

    const volunteer2 = await prisma.user.create({
      data: {
        email: 'volunteer2@example.com',
        password: 'hashedpassword',
        name: 'Volunteer 2',
        type: 'VOLUNTEER',
        isEmailVerified: true
      }
    });

    await prisma.participation.createMany({
      data: [
        {
          userId: volunteer1.id,
          opportunityId: opportunity.id,
          status: 'PENDING',
          appliedAt: new Date()
        },
        {
          userId: volunteer2.id,
          opportunityId: opportunity.id,
          status: 'PENDING',
          appliedAt: new Date()
        }
      ]
    });

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
    
    // Verify applications are displayed
    const applicationCards = await page.locator('[data-testid="application-card"]');
    await expect(applicationCards).toHaveCount(2);
    
    // Approve first application
    await applicationCards.first().click('[data-testid="approve-button"]');
    
    // Wait for confirmation dialog
    await page.waitForSelector('[data-testid="approve-confirmation"]', { timeout: 5000 });
    
    // Confirm approval
    await page.click('[data-testid="confirm-approve-button"]');
    
    // Wait for success message
    await page.waitForSelector('[data-testid="approval-success"]', { timeout: 5000 });
    
    const successMessage = await page.textContent('[data-testid="approval-success"]');
    expect(successMessage).toContain('Application approved');
    
    // Verify application status was updated in database
    const approvedApplication = await prisma.participation.findFirst({
      where: {
        userId: volunteer1.id,
        opportunityId: opportunity.id
      }
    });
    expect(approvedApplication.status).toBe('APPROVED');
  });

  test('should create and manage activities successfully', async () => {
    // Create test opportunity
    const opportunity = await prisma.opportunity.create({
      data: {
        title: 'Test Opportunity',
        description: 'Test Description',
        category: 'ENVIRONMENTAL',
        institutionId: 1,
        status: 'ACTIVE',
        maxVolunteers: 10
      }
    });

    // Login as institution
    await page.goto('http://localhost:3000/login');
    await page.fill('[data-testid="email-input"]', 'institution@example.com');
    await page.fill('[data-testid="password-input"]', 'password');
    await page.click('[data-testid="login-button"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Navigate to activities page
    await page.click('[data-testid="activities-nav"]');
    await page.waitForURL('**/activities', { timeout: 5000 });
    
    // Click create activity button
    await page.click('[data-testid="create-activity-button"]');
    await page.waitForURL('**/activities/create', { timeout: 5000 });
    
    // Fill activity form
    await page.fill('[data-testid="title-input"]', 'Weekly Cleanup Session');
    await page.fill('[data-testid="description-input"]', 'Regular weekly cleanup of the park');
    await page.selectOption('[data-testid="opportunity-select"]', opportunity.id.toString());
    await page.fill('[data-testid="start-date-input"]', '2024-03-15');
    await page.fill('[data-testid="start-time-input"]', '09:00');
    await page.fill('[data-testid="end-date-input"]', '2024-03-15');
    await page.fill('[data-testid="end-time-input"]', '12:00');
    await page.fill('[data-testid="max-participants-input"]', '20');
    await page.fill('[data-testid="location-input"]', 'Central Park, São Paulo');
    
    // Submit form
    await page.click('[data-testid="submit-button"]');
    
    // Wait for success message
    await page.waitForSelector('[data-testid="success-message"]', { timeout: 10000 });
    
    const successMessage = await page.textContent('[data-testid="success-message"]');
    expect(successMessage).toContain('Activity created successfully');
    
    // Verify activity was created in database
    const activity = await prisma.activity.findFirst({
      where: { title: 'Weekly Cleanup Session' }
    });
    expect(activity).toBeTruthy();
    expect(activity.opportunityId).toBe(opportunity.id);
    expect(activity.maxParticipants).toBe(20);
  });

  test('should generate and view reports successfully', async () => {
    // Create test data for reports
    const opportunity = await prisma.opportunity.create({
      data: {
        title: 'Test Opportunity',
        description: 'Test Description',
        category: 'ENVIRONMENTAL',
        institutionId: 1,
        status: 'ACTIVE',
        maxVolunteers: 10
      }
    });

    const activity = await prisma.activity.create({
      data: {
        title: 'Test Activity',
        description: 'Test Activity Description',
        opportunityId: opportunity.id,
        startDate: new Date('2024-03-15'),
        endDate: new Date('2024-03-15'),
        status: 'COMPLETED',
        maxParticipants: 10
      }
    });

    // Create test participants
    const volunteer1 = await prisma.user.create({
      data: {
        email: 'volunteer1@example.com',
        password: 'hashedpassword',
        name: 'Volunteer 1',
        type: 'VOLUNTEER',
        isEmailVerified: true
      }
    });

    const volunteer2 = await prisma.user.create({
      data: {
        email: 'volunteer2@example.com',
        password: 'hashedpassword',
        name: 'Volunteer 2',
        type: 'VOLUNTEER',
        isEmailVerified: true
      }
    });

    await prisma.participation.createMany({
      data: [
        {
          userId: volunteer1.id,
          activityId: activity.id,
          status: 'CONFIRMED',
          appliedAt: new Date()
        },
        {
          userId: volunteer2.id,
          activityId: activity.id,
          status: 'CONFIRMED',
          appliedAt: new Date()
        }
      ]
    });

    // Login as institution
    await page.goto('http://localhost:3000/login');
    await page.fill('[data-testid="email-input"]', 'institution@example.com');
    await page.fill('[data-testid="password-input"]', 'password');
    await page.click('[data-testid="login-button"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Navigate to reports page
    await page.click('[data-testid="reports-nav"]');
    await page.waitForURL('**/reports', { timeout: 5000 });
    
    // Select report type
    await page.selectOption('[data-testid="report-type-select"]', 'PARTICIPATION');
    
    // Select date range
    await page.fill('[data-testid="start-date-input"]', '2024-01-01');
    await page.fill('[data-testid="end-date-input"]', '2024-12-31');
    
    // Generate report
    await page.click('[data-testid="generate-report-button"]');
    
    // Wait for report to load
    await page.waitForSelector('[data-testid="report-content"]', { timeout: 10000 });
    
    // Verify report content
    const reportTitle = await page.textContent('[data-testid="report-title"]');
    expect(reportTitle).toContain('Participation Report');
    
    const reportData = await page.textContent('[data-testid="report-data"]');
    expect(reportData).toContain('Total Participants: 2');
    
    // Test export functionality
    await page.click('[data-testid="export-pdf-button"]');
    
    // Wait for download to start
    await page.waitForTimeout(2000);
    
    // Verify download was triggered (this would need to be implemented in the app)
    // In a real test, you would check if the file was downloaded
  });

  test('should update institution profile successfully', async () => {
    // Login as institution
    await page.goto('http://localhost:3000/login');
    await page.fill('[data-testid="email-input"]', 'institution@example.com');
    await page.fill('[data-testid="password-input"]', 'password');
    await page.click('[data-testid="login-button"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Navigate to profile page
    await page.click('[data-testid="profile-nav"]');
    await page.waitForURL('**/profile', { timeout: 5000 });
    
    // Update profile information
    await page.fill('[data-testid="name-input"]', 'Updated Institution Name');
    await page.fill('[data-testid="description-input"]', 'Updated description for the institution');
    await page.fill('[data-testid="website-input"]', 'https://updated-website.org');
    await page.fill('[data-testid="phone-input"]', '+5511888888888');
    await page.fill('[data-testid="address-input"]', 'Updated Address, 456, São Paulo, SP');
    
    // Save changes
    await page.click('[data-testid="save-button"]');
    
    // Wait for success message
    await page.waitForSelector('[data-testid="success-message"]', { timeout: 5000 });
    
    const successMessage = await page.textContent('[data-testid="success-message"]');
    expect(successMessage).toContain('Profile updated successfully');
    
    // Verify profile was updated in database
    const updatedInstitution = await prisma.institution.findUnique({
      where: { email: 'institution@example.com' }
    });
    expect(updatedInstitution.name).toBe('Updated Institution Name');
    expect(updatedInstitution.description).toBe('Updated description for the institution');
    expect(updatedInstitution.website).toBe('https://updated-website.org');
    expect(updatedInstitution.phone).toBe('+5511888888888');
  });

  test('should handle opportunity editing successfully', async () => {
    // Create test opportunity
    const opportunity = await prisma.opportunity.create({
      data: {
        title: 'Original Title',
        description: 'Original Description',
        category: 'ENVIRONMENTAL',
        institutionId: 1,
        status: 'ACTIVE',
        maxVolunteers: 10
      }
    });

    // Login as institution
    await page.goto('http://localhost:3000/login');
    await page.fill('[data-testid="email-input"]', 'institution@example.com');
    await page.fill('[data-testid="password-input"]', 'password');
    await page.click('[data-testid="login-button"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Navigate to opportunities page
    await page.click('[data-testid="opportunities-nav"]');
    await page.waitForURL('**/opportunities', { timeout: 5000 });
    
    // Find and click on the opportunity
    const opportunityCard = await page.locator(`[data-testid="opportunity-card-${opportunity.id}"]`);
    await opportunityCard.click();
    
    // Wait for opportunity details page
    await page.waitForURL(`**/opportunities/${opportunity.id}`, { timeout: 5000 });
    
    // Click edit button
    await page.click('[data-testid="edit-button"]');
    
    // Wait for edit form
    await page.waitForURL(`**/opportunities/${opportunity.id}/edit`, { timeout: 5000 });
    
    // Update opportunity details
    await page.fill('[data-testid="title-input"]', 'Updated Title');
    await page.fill('[data-testid="description-input"]', 'Updated Description');
    await page.fill('[data-testid="max-volunteers-input"]', '20');
    
    // Save changes
    await page.click('[data-testid="save-button"]');
    
    // Wait for success message
    await page.waitForSelector('[data-testid="success-message"]', { timeout: 5000 });
    
    const successMessage = await page.textContent('[data-testid="success-message"]');
    expect(successMessage).toContain('Opportunity updated successfully');
    
    // Verify opportunity was updated in database
    const updatedOpportunity = await prisma.opportunity.findUnique({
      where: { id: opportunity.id }
    });
    expect(updatedOpportunity.title).toBe('Updated Title');
    expect(updatedOpportunity.description).toBe('Updated Description');
    expect(updatedOpportunity.maxVolunteers).toBe(20);
  });
});
