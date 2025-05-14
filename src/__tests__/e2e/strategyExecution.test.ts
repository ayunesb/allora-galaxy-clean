
import { test, expect } from '@playwright/test';

test.describe('Strategy Execution Flow', () => {
  test.beforeEach(async ({ page }: { page: any }) => {
    // Sign in before each test
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL('/dashboard');
  });

  test('Complete strategy execution flow', async ({ page }: { page: any }) => {
    // Navigate to strategies page
    await page.click('a[href="/strategies"]');
    await page.waitForURL('/strategies');
    
    // Create a new strategy
    await page.click('button:has-text("New Strategy")');
    await page.fill('input[name="title"]', 'E2E Test Strategy');
    await page.fill('textarea[name="description"]', 'This is a test strategy created by E2E tests');
    await page.click('button[type="submit"]');
    
    // Wait for strategy to be created and navigate to its detail page
    await page.waitForSelector('text=E2E Test Strategy');
    await page.click('text=E2E Test Strategy');
    
    // Execute the strategy
    await page.click('button:has-text("Execute")');
    
    // Confirm execution
    await page.click('button:has-text("Confirm")');
    
    // Wait for execution to complete
    await page.waitForSelector('text=Execution completed successfully', { timeout: 30000 });
    
    // Verify result on page
    const resultText = await page.textContent('.execution-result');
    expect(resultText).toContain('Success');
    
    // Check logs for execution
    await page.click('a[href="/logs"]');
    await page.waitForURL('/logs');
    
    // Filter logs for the strategy
    await page.fill('input[placeholder="Search logs..."]', 'E2E Test Strategy');
    await page.click('button:has-text("Apply Filters")');
    
    // Verify log entry exists
    await page.waitForSelector('text=Strategy executed');
    const logEntry = await page.textContent('.log-entry');
    expect(logEntry).toContain('E2E Test Strategy');
  });
});
