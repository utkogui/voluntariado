import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { chromium, Browser, Page } from 'playwright';
import { PrismaClient } from '@prisma/client';

describe('Volunteer Registration Flow - E2E Tests', () => {
  let browser: Browser;
  let page: Page;
  let prisma: PrismaClient;

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
    await prisma.$executeRaw`TRUNCATE TABLE "User", "Institution", "Opportunity" RESTART IDENTITY CASCADE;`;
    
    // Navigate to registration page
    await page.goto('http://localhost:3000/register');
  });

  test('should complete volunteer registration flow successfully', async () => {
    // Fill registration form
    await page.fill('[data-testid="name-input"]', 'John Doe');
    await page.fill('[data-testid="email-input"]', 'john.doe@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.fill('[data-testid="confirm-password-input"]', 'password123');
    await page.selectOption('[data-testid="type-select"]', 'VOLUNTEER');
    
    // Fill volunteer-specific fields
    await page.fill('[data-testid="phone-input"]', '+5511999999999');
    await page.fill('[data-testid="address-input"]', 'Rua das Flores, 123, São Paulo, SP');
    await page.selectOption('[data-testid="availability-select"]', 'WEEKENDS');
    await page.check('[data-testid="environmental-checkbox"]');
    await page.check('[data-testid="social-checkbox"]');
    
    // Submit form
    await page.click('[data-testid="submit-button"]');
    
    // Wait for success message
    await page.waitForSelector('[data-testid="success-message"]', { timeout: 10000 });
    
    // Verify success message
    const successMessage = await page.textContent('[data-testid="success-message"]');
    expect(successMessage).toContain('Registration successful');
    
    // Verify user was created in database
    const user = await prisma.user.findUnique({
      where: { email: 'john.doe@example.com' }
    });
    expect(user).toBeTruthy();
    expect(user.name).toBe('John Doe');
    expect(user.type).toBe('VOLUNTEER');
  });

  test('should show validation errors for invalid input', async () => {
    // Try to submit form with invalid data
    await page.fill('[data-testid="name-input"]', '');
    await page.fill('[data-testid="email-input"]', 'invalid-email');
    await page.fill('[data-testid="password-input"]', '123');
    await page.fill('[data-testid="confirm-password-input"]', '456');
    
    await page.click('[data-testid="submit-button"]');
    
    // Wait for validation errors
    await page.waitForSelector('[data-testid="error-message"]', { timeout: 5000 });
    
    // Verify validation errors
    const nameError = await page.textContent('[data-testid="name-error"]');
    const emailError = await page.textContent('[data-testid="email-error"]');
    const passwordError = await page.textContent('[data-testid="password-error"]');
    const confirmPasswordError = await page.textContent('[data-testid="confirm-password-error"]');
    
    expect(nameError).toContain('Name is required');
    expect(emailError).toContain('Invalid email format');
    expect(passwordError).toContain('Password must be at least 8 characters');
    expect(confirmPasswordError).toContain('Passwords do not match');
  });

  test('should show error for duplicate email', async () => {
    // Create existing user
    await prisma.user.create({
      data: {
        email: 'existing@example.com',
        password: 'hashedpassword',
        name: 'Existing User',
        type: 'VOLUNTEER',
        isEmailVerified: true
      }
    });
    
    // Try to register with same email
    await page.fill('[data-testid="name-input"]', 'John Doe');
    await page.fill('[data-testid="email-input"]', 'existing@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.fill('[data-testid="confirm-password-input"]', 'password123');
    await page.selectOption('[data-testid="type-select"]', 'VOLUNTEER');
    
    await page.click('[data-testid="submit-button"]');
    
    // Wait for error message
    await page.waitForSelector('[data-testid="error-message"]', { timeout: 10000 });
    
    const errorMessage = await page.textContent('[data-testid="error-message"]');
    expect(errorMessage).toContain('User already exists with this email');
  });

  test('should redirect to login page after successful registration', async () => {
    // Complete registration
    await page.fill('[data-testid="name-input"]', 'Jane Doe');
    await page.fill('[data-testid="email-input"]', 'jane.doe@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.fill('[data-testid="confirm-password-input"]', 'password123');
    await page.selectOption('[data-testid="type-select"]', 'VOLUNTEER');
    
    await page.click('[data-testid="submit-button"]');
    
    // Wait for redirect
    await page.waitForURL('**/login', { timeout: 10000 });
    
    // Verify we're on login page
    expect(page.url()).toContain('/login');
    
    // Verify login form is present
    const loginForm = await page.locator('[data-testid="login-form"]');
    await expect(loginForm).toBeVisible();
  });

  test('should handle network errors gracefully', async () => {
    // Mock network failure
    await page.route('**/api/auth/register', route => {
      route.abort('failed');
    });
    
    // Fill form
    await page.fill('[data-testid="name-input"]', 'John Doe');
    await page.fill('[data-testid="email-input"]', 'john.doe@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.fill('[data-testid="confirm-password-input"]', 'password123');
    await page.selectOption('[data-testid="type-select"]', 'VOLUNTEER');
    
    await page.click('[data-testid="submit-button"]');
    
    // Wait for error message
    await page.waitForSelector('[data-testid="error-message"]', { timeout: 10000 });
    
    const errorMessage = await page.textContent('[data-testid="error-message"]');
    expect(errorMessage).toContain('Network error');
  });
});
