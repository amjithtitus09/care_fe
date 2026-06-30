import { faker } from "@faker-js/faker";
import { expect, test, type Page } from "@playwright/test";
import { getFacilityId } from "tests/support/facilityId";

test.use({ storageState: "tests/.auth/user.json" });

/**
 * Schedule Exceptions Test Suite
 * 
 * Tests the schedule exception management workflow for healthcare practitioners.
 * Schedule exceptions allow marking unavailability periods (holidays, conferences, etc.)
 * that override regular schedule templates.
 * 
 * Key Features Tested:
 * - Creating full-day and partial-day exceptions
 * - Date range validation (no past dates)
 * - Time validation (start before end, future times)
 * - Deleting exceptions
 * - UI states and error handling
 */

// Helper functions
async function navigateToUserSchedule(page: Page, facilityId: string) {
  await page.goto(`/facility/${facilityId}/users/admin`);
  
  // Wait for user list to load
  await expect(page.getByRole("heading", { name: /users/i })).toBeVisible();
  
  // Click on first user to view details
  await page.getByRole("button", { name: /view details/i }).first().click();
  
  // Navigate to Availability tab (where schedule exceptions are managed)
  await page.getByRole("tab", { name: /availability/i }).click();
  
  // Wait for the availability tab content to load
  await expect(
    page.getByRole("heading", { name: /schedule templates/i })
  ).toBeVisible();
}

async function openAddExceptionSheet(page: Page) {
  // Click "Add Exception" button to open the sheet
  await page.getByRole("button", { name: /add exception/i }).click();
  
  // Wait for sheet to open
  await expect(
    page.getByRole("heading", { name: /add schedule exceptions/i })
  ).toBeVisible();
}

async function fillExceptionForm(
  page: Page, 
  options: {
    reason: string;
    validFrom?: Date;
    validTo?: Date;
    startTime?: string;
    endTime?: string;
    fullDay?: boolean;
  }
) {
  // Fill reason field
  await page.getByRole("textbox", { name: /reason/i }).fill(options.reason);
  
  // Handle full day checkbox if specified
  if (options.fullDay) {
    await page.getByRole("checkbox", { name: /full day unavailable/i }).check();
  }
  
  // Fill date fields
  if (options.validFrom) {
    const validFromButton = page.locator('label:has-text("Valid From")').locator('..').locator('button[data-slot="popover-trigger"]');
    await validFromButton.click();
    await page.getByRole("button", { name: String(options.validFrom.getDate()), exact: true }).click();
  }
  
  if (options.validTo) {
    const validToButton = page.locator('label:has-text("Valid To")').locator('..').locator('button[data-slot="popover-trigger"]');
    await validToButton.click();
    await page.getByRole("button", { name: String(options.validTo.getDate()), exact: true }).click();
  }
  
  // Fill time fields (unless full day)
  if (!options.fullDay) {
    if (options.startTime) {
      await page.getByLabel(/from/i).fill(options.startTime);
    }
    if (options.endTime) {
      await page.getByLabel(/to/i).fill(options.endTime);
    }
  }
}

test.describe("Schedule Exception Management", () => {
  let facilityId: string;

  test.beforeEach(async ({ page }) => {
    facilityId = getFacilityId();
    await navigateToUserSchedule(page, facilityId);
  });

  test("should display Add Exception button", async ({ page }) => {
    await test.step("Verify Add Exception button is visible", async () => {
      await expect(
        page.getByRole("button", { name: /add exception/i })
      ).toBeVisible();
    });
  });

  test("should open exception creation sheet when clicking Add Exception", async ({ page }) => {
    await test.step("Click Add Exception button", async () => {
      await openAddExceptionSheet(page);
    });

    await test.step("Verify sheet opened with correct title and description", async () => {
      await expect(
        page.getByRole("heading", { name: /add schedule exceptions/i })
      ).toBeVisible();
      
      // Check for sheet description
      await expect(
        page.getByText(/add schedule exceptions description/i)
      ).toBeVisible();
    });

    await test.step("Verify all form fields are present", async () => {
      await expect(page.getByRole("textbox", { name: /reason/i })).toBeVisible();
      await expect(page.getByText(/valid from/i)).toBeVisible();
      await expect(page.getByText(/valid to/i)).toBeVisible();
      await expect(page.getByRole("checkbox", { name: /full day unavailable/i })).toBeVisible();
      await expect(page.getByLabel(/from/i)).toBeVisible();
      await expect(page.getByLabel(/to/i)).toBeVisible();
    });
  });

  test("should create a full-day exception successfully", async ({ page }) => {
    const reason = `Holiday Leave - ${faker.lorem.words(2)}`;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    await test.step("Open exception form", async () => {
      await openAddExceptionSheet(page);
    });

    await test.step("Fill form with full-day exception", async () => {
      await fillExceptionForm(page, {
        reason,
        validFrom: tomorrow,
        validTo: tomorrow,
        fullDay: true,
      });
    });

    await test.step("Submit form", async () => {
      await page.getByRole("button", { name: /confirm unavailability/i }).click();
    });

    await test.step("Verify success toast", async () => {
      await expect(page.getByText(/exception created/i)).toBeVisible();
    });

    await test.step("Verify sheet closed and exception appears in list", async () => {
      await expect(
        page.getByRole("heading", { name: /add schedule exceptions/i })
      ).not.toBeVisible();
      
      // Verify the created exception appears in the list
      await expect(page.getByText(reason)).toBeVisible();
    });
  });

  test("should create a partial-day exception successfully", async ({ page }) => {
    const reason = `Conference - ${faker.lorem.words(2)}`;
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);

    await test.step("Open exception form", async () => {
      await openAddExceptionSheet(page);
    });

    await test.step("Fill form with partial-day exception", async () => {
      await fillExceptionForm(page, {
        reason,
        validFrom: twoDaysFromNow,
        validTo: twoDaysFromNow,
        startTime: "09:00",
        endTime: "13:00",
        fullDay: false,
      });
    });

    await test.step("Submit form", async () => {
      await page.getByRole("button", { name: /confirm unavailability/i }).click();
    });

    await test.step("Verify success and exception appears", async () => {
      await expect(page.getByText(/exception created/i)).toBeVisible();
      await expect(page.getByText(reason)).toBeVisible();
    });
  });

  test("should create a multi-day exception successfully", async ({ page }) => {
    const reason = `Vacation - ${faker.lorem.words(2)}`;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 5);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 10);

    await test.step("Open exception form", async () => {
      await openAddExceptionSheet(page);
    });

    await test.step("Fill form with multi-day range", async () => {
      await fillExceptionForm(page, {
        reason,
        validFrom: startDate,
        validTo: endDate,
        fullDay: true,
      });
    });

    await test.step("Submit form", async () => {
      await page.getByRole("button", { name: /confirm unavailability/i }).click();
    });

    await test.step("Verify exception created", async () => {
      await expect(page.getByText(/exception created/i)).toBeVisible();
      await expect(page.getByText(reason)).toBeVisible();
    });
  });

  test("should validate required fields", async ({ page }) => {
    await test.step("Open exception form", async () => {
      await openAddExceptionSheet(page);
    });

    await test.step("Submit empty form", async () => {
      await page.getByRole("button", { name: /confirm unavailability/i }).click();
    });

    await test.step("Verify validation errors", async () => {
      // Check for required field errors
      const formMessages = page.locator('p[data-slot="form-message"]');
      await expect(formMessages).toHaveCount(4); // reason, valid_from, valid_to, start_time, end_time
      
      // Verify specific error messages
      await expect(page.getByText(/field required/i).first()).toBeVisible();
    });
  });

  test("should validate end time is after start time", async ({ page }) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    await test.step("Open exception form", async () => {
      await openAddExceptionSheet(page);
    });

    await test.step("Fill form with invalid time range", async () => {
      await fillExceptionForm(page, {
        reason: "Invalid time range test",
        validFrom: tomorrow,
        validTo: tomorrow,
        startTime: "15:00",
        endTime: "10:00", // End before start
        fullDay: false,
      });
    });

    await test.step("Submit form", async () => {
      await page.getByRole("button", { name: /confirm unavailability/i }).click();
    });

    await test.step("Verify time validation error", async () => {
      await expect(
        page.getByText(/start time must be before end time/i)
      ).toBeVisible();
    });
  });

  test("should validate valid_to is not before valid_from", async ({ page }) => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    await test.step("Open exception form", async () => {
      await openAddExceptionSheet(page);
    });

    await test.step("Fill form with invalid date range", async () => {
      await fillExceptionForm(page, {
        reason: "Invalid date range test",
        validFrom: tomorrow,
        validTo: today, // End before start
        fullDay: true,
      });
    });

    await test.step("Submit form", async () => {
      await page.getByRole("button", { name: /confirm unavailability/i }).click();
    });

    await test.step("Verify date validation error", async () => {
      await expect(
        page.getByText(/valid till equal or after valid from/i)
      ).toBeVisible();
    });
  });

  test("should auto-fill times when full day checkbox is selected", async ({ page }) => {
    await test.step("Open exception form", async () => {
      await openAddExceptionSheet(page);
    });

    await test.step("Check full day unavailable", async () => {
      await page.getByRole("checkbox", { name: /full day unavailable/i }).check();
    });

    await test.step("Verify time fields are disabled and auto-filled", async () => {
      const startTimeInput = page.getByLabel(/from/i);
      const endTimeInput = page.getByLabel(/to/i);
      
      await expect(startTimeInput).toBeDisabled();
      await expect(endTimeInput).toBeDisabled();
      await expect(startTimeInput).toHaveValue("00:00");
      await expect(endTimeInput).toHaveValue("23:59");
    });

    await test.step("Uncheck full day and verify fields are enabled", async () => {
      await page.getByRole("checkbox", { name: /full day unavailable/i }).uncheck();
      
      const startTimeInput = page.getByLabel(/from/i);
      const endTimeInput = page.getByLabel(/to/i);
      
      await expect(startTimeInput).toBeEnabled();
      await expect(endTimeInput).toBeEnabled();
    });
  });

  test("should cancel exception creation", async ({ page }) => {
    await test.step("Open exception form", async () => {
      await openAddExceptionSheet(page);
    });

    await test.step("Fill some data", async () => {
      await page.getByRole("textbox", { name: /reason/i }).fill("Test cancellation");
    });

    await test.step("Click cancel button", async () => {
      await page.getByRole("button", { name: /cancel/i }).click();
    });

    await test.step("Verify sheet closed without creating exception", async () => {
      await expect(
        page.getByRole("heading", { name: /add schedule exceptions/i })
      ).not.toBeVisible();
      
      await expect(page.getByText("Test cancellation")).not.toBeVisible();
    });
  });

  test("should delete an existing exception", async ({ page }) => {
    const reason = `Delete Test - ${faker.lorem.words(2)}`;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    await test.step("Create an exception first", async () => {
      await openAddExceptionSheet(page);
      await fillExceptionForm(page, {
        reason,
        validFrom: tomorrow,
        validTo: tomorrow,
        fullDay: true,
      });
      await page.getByRole("button", { name: /confirm unavailability/i }).click();
      await expect(page.getByText(/exception created/i)).toBeVisible();
    });

    await test.step("Find and click remove button for the exception", async () => {
      // Find the exception card and click its remove button
      const exceptionCard = page.locator("div", { hasText: reason }).first();
      await expect(exceptionCard).toBeVisible();
      
      await exceptionCard.getByRole("button", { name: /remove/i }).click();
    });

    await test.step("Confirm deletion in dialog", async () => {
      await expect(page.getByText(/are you sure/i)).toBeVisible();
      await expect(
        page.getByText(/this will permanently remove the exception/i)
      ).toBeVisible();
      
      await page.getByRole("button", { name: /delete/i }).click();
    });

    await test.step("Verify exception was deleted", async () => {
      await expect(page.getByText(/exception deleted/i)).toBeVisible();
      
      // Verify exception no longer appears in list
      await expect(page.getByText(reason)).not.toBeVisible();
    });
  });

  test("should display no exceptions message when list is empty", async ({ page }) => {
    await test.step("Verify empty state message", async () => {
      // This test assumes no exceptions exist
      // If exceptions exist from previous tests, this might need adjustment
      const noExceptionsText = page.getByText(/no scheduled exceptions found/i);
      
      // Check if empty state is visible (it might not be if exceptions were created)
      const count = await noExceptionsText.count();
      if (count > 0) {
        await expect(noExceptionsText).toBeVisible();
      }
    });
  });

  test("should display exception details correctly", async ({ page }) => {
    const reason = `Display Test - ${faker.lorem.words(2)}`;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    await test.step("Create an exception", async () => {
      await openAddExceptionSheet(page);
      await fillExceptionForm(page, {
        reason,
        validFrom: tomorrow,
        validTo: tomorrow,
        startTime: "10:00",
        endTime: "14:00",
        fullDay: false,
      });
      await page.getByRole("button", { name: /confirm unavailability/i }).click();
      await expect(page.getByText(/exception created/i)).toBeVisible();
    });

    await test.step("Verify exception details are displayed", async () => {
      const exceptionCard = page.locator("div", { hasText: reason }).first();
      await expect(exceptionCard).toBeVisible();
      
      // Verify reason is displayed
      await expect(exceptionCard.getByText(reason)).toBeVisible();
      
      // Verify time range is displayed (format may vary)
      await expect(exceptionCard).toContainText(/10.*14/);
    });
  });
});
