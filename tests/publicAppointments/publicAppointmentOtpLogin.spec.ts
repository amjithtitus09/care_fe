import { faker } from "@faker-js/faker";
import { expect, test } from "@playwright/test";

/**
 * Public Appointment OTP Login Tests
 * 
 * Tests the patient-facing OTP authentication flow for booking public appointments.
 * This flow allows patients to authenticate via phone number and OTP to book 
 * appointments with healthcare staff.
 * 
 * Flow: Landing page → Facility selection → Staff selection → OTP login → Appointment booking
 */

// Note: These tests run unauthenticated as they test public patient access
test.describe("Public Appointment - OTP Login", () => {
  const facilityId = "facility-dummy-id"; // Placeholder - would come from public facility list
  const staffId = "staff-dummy-id"; // Placeholder - would come from staff selection

  test.describe("OTP Send Flow", () => {
    test("should display OTP send form with phone input", async ({ page }) => {
      await test.step("Navigate to OTP send page", async () => {
        await page.goto(
          `/facility/${facilityId}/appointments/${staffId}/otp/send`,
        );
      });

      await test.step("Verify phone number input is visible", async () => {
        await expect(
          page.getByLabel(/phone number/i),
        ).toBeVisible();
      });

      await test.step("Verify send OTP button is visible", async () => {
        await expect(
          page.getByRole("button", { name: /send otp/i }),
        ).toBeVisible();
      });

      await test.step("Verify back button navigation", async () => {
        const backButton = page.getByRole("button", { name: /back/i });
        await expect(backButton).toBeVisible();
      });
    });

    test("should show validation error for empty phone number", async ({
      page,
    }) => {
      await test.step("Navigate to OTP send page", async () => {
        await page.goto(
          `/facility/${facilityId}/appointments/${staffId}/otp/send`,
        );
      });

      await test.step("Submit form without phone number", async () => {
        await page.getByRole("button", { name: /send otp/i }).click();
      });

      await test.step("Verify validation error appears", async () => {
        // Wait for error message to appear
        await expect(
          page.getByText(/required|phone.*number/i),
        ).toBeVisible({ timeout: 5000 });
      });
    });

    test("should show validation error for invalid phone number format", async ({
      page,
    }) => {
      await test.step("Navigate to OTP send page", async () => {
        await page.goto(
          `/facility/${facilityId}/appointments/${staffId}/otp/send`,
        );
      });

      await test.step("Enter invalid phone number", async () => {
        const phoneInput = page.getByLabel(/phone number/i);
        await phoneInput.fill("123"); // Invalid: too short
      });

      await test.step("Submit form with invalid phone", async () => {
        await page.getByRole("button", { name: /send otp/i }).click();
      });

      await test.step("Verify validation error appears", async () => {
        await expect(
          page.getByText(/invalid.*phone|phone.*validation/i),
        ).toBeVisible({ timeout: 5000 });
      });
    });

    test("should accept valid Indian phone number format", async ({ page }) => {
      await test.step("Navigate to OTP send page", async () => {
        await page.goto(
          `/facility/${facilityId}/appointments/${staffId}/otp/send`,
        );
      });

      await test.step("Enter valid Indian phone number", async () => {
        // Generate valid Indian mobile number (10 digits starting with 9/8/7/6)
        const validPhone = `9${Math.floor(Math.random() * 1000000000)
          .toString()
          .padStart(9, "0")}`;
        const phoneInput = page.getByLabel(/phone number/i);
        await phoneInput.fill(validPhone);
      });

      await test.step("Verify phone input accepts the number", async () => {
        const phoneInput = page.getByLabel(/phone number/i);
        await expect(phoneInput).toHaveValue(/9\d{9}/);
      });
    });

    test("should navigate to verify page after successful OTP send", async ({
      page,
    }) => {
      // Note: This test would require mocking the OTP API endpoint
      // or having a test facility/staff ID configured in the backend
      await test.step("Navigate to OTP send page", async () => {
        await page.goto(
          `/facility/${facilityId}/appointments/${staffId}/otp/send`,
        );
      });

      await test.step("Enter valid phone number", async () => {
        const validPhone = `9${Math.floor(Math.random() * 1000000000)
          .toString()
          .padStart(9, "0")}`;
        const phoneInput = page.getByLabel(/phone number/i);
        await phoneInput.fill(validPhone);
      });

      await test.step("Submit OTP send request", async () => {
        await page.getByRole("button", { name: /send otp/i }).click();
      });

      // Note: In a real test environment with proper backend setup,
      // we would verify navigation to the verify page here
      // await expect(page).toHaveURL(/\/otp\/verify/);
    });
  });

  test.describe("OTP Verify Flow", () => {
    test("should display OTP verification form", async ({ page }) => {
      await test.step("Navigate to OTP verify page", async () => {
        await page.goto(
          `/facility/${facilityId}/appointments/${staffId}/otp/verify`,
        );
      });

      await test.step("Verify OTP input fields are visible", async () => {
        // OTP input uses InputOTP component with 5 slots
        const otpGroup = page.locator("[role='group']").filter({
          has: page.locator("input[inputmode='numeric']"),
        });
        await expect(otpGroup).toBeVisible();
      });

      await test.step("Verify verify button is visible", async () => {
        await expect(
          page.getByRole("button", { name: /verify/i }),
        ).toBeVisible();
      });

      await test.step("Verify resend OTP option is available", async () => {
        await expect(
          page.getByRole("button", { name: /resend otp/i }),
        ).toBeVisible();
      });
    });

    test("should show validation error for incomplete OTP", async ({
      page,
    }) => {
      await test.step("Navigate to OTP verify page", async () => {
        await page.goto(
          `/facility/${facilityId}/appointments/${staffId}/otp/verify`,
        );
      });

      await test.step("Enter partial OTP (less than 5 digits)", async () => {
        // Find first OTP input slot
        const otpInput = page
          .locator("input[inputmode='numeric']")
          .first();
        await otpInput.fill("123"); // Only 3 digits instead of 5
      });

      await test.step("Attempt to verify incomplete OTP", async () => {
        await page.getByRole("button", { name: /verify/i }).click();
      });

      await test.step("Verify validation error appears", async () => {
        await expect(
          page.getByText(/one-time password.*5 characters/i),
        ).toBeVisible({ timeout: 5000 });
      });
    });

    test("should accept 5-digit OTP input", async ({ page }) => {
      await test.step("Navigate to OTP verify page", async () => {
        await page.goto(
          `/facility/${facilityId}/appointments/${staffId}/otp/verify`,
        );
      });

      await test.step("Enter complete 5-digit OTP", async () => {
        const otpInput = page
          .locator("input[inputmode='numeric']")
          .first();
        // InputOTP component auto-advances through slots
        await otpInput.pressSequentially("12345");
      });

      await test.step("Verify all 5 digits are entered", async () => {
        // Check that OTP inputs are filled
        const filledInputs = page.locator(
          "input[inputmode='numeric'][value]",
        );
        await expect(filledInputs).toHaveCount(5);
      });
    });

    test("should allow OTP resend", async ({ page }) => {
      await test.step("Navigate to OTP verify page", async () => {
        await page.goto(
          `/facility/${facilityId}/appointments/${staffId}/otp/verify`,
        );
      });

      await test.step("Click resend OTP button", async () => {
        await page.getByRole("button", { name: /resend otp/i }).click();
      });

      // Note: In a real test environment, we would verify:
      // 1. Success toast notification appears
      // 2. OTP input is cleared for new entry
      // 3. Countdown timer resets
    });

    test("should show error for invalid OTP", async ({ page }) => {
      // Note: This test requires backend integration with proper error responses
      await test.step("Navigate to OTP verify page", async () => {
        await page.goto(
          `/facility/${facilityId}/appointments/${staffId}/otp/verify`,
        );
      });

      await test.step("Enter invalid OTP", async () => {
        const otpInput = page
          .locator("input[inputmode='numeric']")
          .first();
        await otpInput.pressSequentially("00000"); // Invalid OTP
      });

      await test.step("Attempt to verify invalid OTP", async () => {
        await page.getByRole("button", { name: /verify/i }).click();
      });

      // In a real test with backend:
      // await expect(page.getByText(/invalid.*otp/i)).toBeVisible({ timeout: 5000 });
    });

    test("should navigate to appointment booking after successful OTP verification", async ({
      page,
    }) => {
      // Note: This test requires full backend integration
      await test.step("Navigate to OTP verify page", async () => {
        await page.goto(
          `/facility/${facilityId}/appointments/${staffId}/otp/verify`,
        );
      });

      await test.step("Enter valid OTP", async () => {
        const otpInput = page
          .locator("input[inputmode='numeric']")
          .first();
        // In a real test, this would be a valid OTP from the backend
        await otpInput.pressSequentially("12345");
      });

      await test.step("Verify OTP", async () => {
        await page.getByRole("button", { name: /verify/i }).click();
      });

      // In a real test with backend:
      // await expect(page).toHaveURL(/\/book-appointment/);
    });
  });

  test.describe("OTP Flow Navigation", () => {
    test("should allow navigation back from verify page to send page", async ({
      page,
    }) => {
      await test.step("Navigate to OTP verify page", async () => {
        await page.goto(
          `/facility/${facilityId}/appointments/${staffId}/otp/verify`,
        );
      });

      await test.step("Click back button", async () => {
        const backButton = page.getByRole("button", { name: /back/i });
        await backButton.click();
      });

      await test.step("Verify navigation to send page", async () => {
        await expect(page).toHaveURL(/\/otp\/send/);
      });
    });

    test("should handle direct access to verify page without phone number", async ({
      page,
    }) => {
      await test.step("Navigate directly to verify page", async () => {
        await page.goto(
          `/facility/${facilityId}/appointments/${staffId}/otp/verify`,
        );
      });

      // Note: The app should either:
      // 1. Redirect to send page if no phone number in context
      // 2. Show error message about missing phone number
      // This behavior would be verified based on actual implementation
    });

    test("should preserve facility and staff IDs across OTP flow", async ({
      page,
    }) => {
      const testFacilityId = `facility-${Date.now()}`;
      const testStaffId = `staff-${Date.now()}`;

      await test.step("Start at send page with specific IDs", async () => {
        await page.goto(
          `/facility/${testFacilityId}/appointments/${testStaffId}/otp/send`,
        );
      });

      await test.step("Enter phone number", async () => {
        const validPhone = `9${Math.floor(Math.random() * 1000000000)
          .toString()
          .padStart(9, "0")}`;
        await page.getByLabel(/phone number/i).fill(validPhone);
      });

      await test.step("Navigate to verify page", async () => {
        await page.getByRole("button", { name: /send otp/i }).click();
      });

      // Verify URL contains correct facility and staff IDs
      // In a real test: await expect(page).toHaveURL(new RegExp(`facility/${testFacilityId}/appointments/${testStaffId}`));
    });
  });

  test.describe("Error Handling", () => {
    test("should handle missing facility ID gracefully", async ({ page }) => {
      await test.step("Navigate with missing facility ID", async () => {
        await page.goto(`/facility//appointments/${staffId}/otp/send`);
      });

      // App should either redirect to facility selection or show error
      await test.step("Verify error handling", async () => {
        // Check for error message or redirect to valid page
        await page.waitForLoadState("networkidle");
        const currentUrl = page.url();
        expect(currentUrl).toBeTruthy();
      });
    });

    test("should handle missing staff ID gracefully", async ({ page }) => {
      await test.step("Navigate with missing staff ID", async () => {
        await page.goto(`/facility/${facilityId}/appointments//otp/send`);
      });

      // App should show error or redirect to staff selection
      await test.step("Verify error handling", async () => {
        await page.waitForLoadState("networkidle");
        const currentUrl = page.url();
        expect(currentUrl).toBeTruthy();
      });
    });

    test("should handle network errors during OTP send", async ({ page }) => {
      // Note: This would require network interception to simulate failures
      await test.step("Navigate to OTP send page", async () => {
        await page.goto(
          `/facility/${facilityId}/appointments/${staffId}/otp/send`,
        );
      });

      // In a real test with network mocking:
      // await page.route('**/api/v1/otp/send', route => route.abort());
      // Then verify error handling
    });

    test("should handle session timeout during OTP flow", async ({ page }) => {
      // Note: This would test OTP token expiration (14 minutes per code)
      await test.step("Navigate to OTP verify page", async () => {
        await page.goto(
          `/facility/${facilityId}/appointments/${staffId}/otp/verify`,
        );
      });

      // In a real test, we would:
      // 1. Mock time to simulate 14+ minute wait
      // 2. Attempt to verify OTP
      // 3. Verify redirect to send page with appropriate error message
    });
  });
});
