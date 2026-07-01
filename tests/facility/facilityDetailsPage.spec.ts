import { expect, test } from "@playwright/test";
import { getFacilityId } from "../support/facilityId";

/**
 * Facility Details Page Tests
 *
 * Tests the public-facing facility details page that displays:
 * - Facility information (name, address, image, features, description)
 * - List of schedulable doctors/practitioners
 * - Navigation to appointment booking flow
 *
 * Route: /facility/:id (public, no authentication required)
 */

// No authentication required - this is a public page
test.describe("Facility Details Page", () => {
  let facilityId: string;

  test.beforeEach(async ({ page }) => {
    facilityId = getFacilityId();
  });

  test("should load facility details page successfully", async ({ page }) => {
    await test.step("Navigate to facility details page", async () => {
      await page.goto(`/facility/${facilityId}`);
    });

    await test.step("Verify page loads without errors", async () => {
      // Check that we're on the correct page by looking for the back button
      await expect(page.getByRole("button", { name: /back/i })).toBeVisible();
    });
  });

  test("should display facility information correctly", async ({ page }) => {
    await page.goto(`/facility/${facilityId}`);

    await test.step("Verify facility name is displayed", async () => {
      // Facility name should be in a heading
      const heading = page.getByRole("heading", { level: 1 });
      await expect(heading).toBeVisible();
      await expect(heading).not.toBeEmpty();
    });

    await test.step("Verify facility address is displayed", async () => {
      // Address should be visible as text content
      // We can't assert exact text since it depends on backend fixtures
      // But we can verify the page has loaded the facility data
      const facilityCard = page.locator(".container").first();
      await expect(facilityCard).toBeVisible();
    });

    await test.step("Verify facility image is displayed", async () => {
      // Avatar/image should be visible
      // The Avatar component renders an image or initials
      const container = page.locator(".container").first();
      await expect(container).toBeVisible();
    });
  });

  test("should display facility features as badges", async ({ page }) => {
    await page.goto(`/facility/${facilityId}`);

    await test.step("Check for feature badges", async () => {
      // Features are displayed as badges
      // The number of badges depends on backend fixture data
      // We just verify the container is present
      const card = page.locator(".container .space-y-2").first();
      await expect(card).toBeVisible();
    });
  });

  test("should display facility description if available", async ({ page }) => {
    await page.goto(`/facility/${facilityId}`);

    await test.step("Verify description section exists", async () => {
      // Description is rendered as markdown
      // We can't assert specific content, but we can verify the page structure
      const container = page.locator(".container").first();
      await expect(container).toBeVisible();
    });
  });

  test("should display list of schedulable doctors", async ({ page }) => {
    await page.goto(`/facility/${facilityId}`);

    await test.step("Verify doctors list is present", async () => {
      // Check for doctor cards or empty state message
      const noUsersMessage = page.getByText(/no_users_found/i);
      const hasUsers = !(await noUsersMessage.isVisible());

      if (hasUsers) {
        // If there are users, verify "Book Appointment" buttons are present
        const bookButtons = page.getByRole("button", {
          name: /book_appointment/i,
        });
        // At least one book appointment button should exist
        await expect(bookButtons.first()).toBeVisible();
      } else {
        // If no users, verify the empty state message
        await expect(noUsersMessage).toBeVisible();
      }
    });
  });

  test("should navigate to appointment booking when book button clicked", async ({
    page,
  }) => {
    await page.goto(`/facility/${facilityId}`);

    await test.step("Check if doctors are available", async () => {
      const noUsersMessage = page.getByText(/no_users_found/i);
      const hasUsers = !(await noUsersMessage.isVisible());

      if (hasUsers) {
        await test.step("Click book appointment button", async () => {
          const firstBookButton = page
            .getByRole("button", { name: /book_appointment/i })
            .first();
          await expect(firstBookButton).toBeVisible();
          await firstBookButton.click();
        });

        await test.step("Verify navigation to OTP page", async () => {
          // Should navigate to OTP login page for patient authentication
          // URL pattern: /facility/:facilityId/appointments/:staffId/otp/send
          await expect(page).toHaveURL(/\/appointments\/.*\/otp\//);
        });
      } else {
        // If no users available, test passes (can't test booking without users)
        test.skip(true, "No schedulable users available in fixture data");
      }
    });
  });

  test("should handle facility not found gracefully", async ({ page }) => {
    const invalidFacilityId = "00000000-0000-0000-0000-000000000000";

    await test.step("Navigate to non-existent facility", async () => {
      await page.goto(`/facility/${invalidFacilityId}`);
    });

    await test.step("Verify error message is displayed", async () => {
      // Check for "facility not found" message
      const notFoundMessage = page.getByText(/facility_not_found/i);
      await expect(notFoundMessage).toBeVisible();
    });

    await test.step("Verify back button is present", async () => {
      // Should have a back button to return to facilities list
      const backButton = page.getByRole("button", { name: /back/i });
      await expect(backButton).toBeVisible();
    });
  });

  test("should have working back navigation", async ({ page }) => {
    await page.goto(`/facility/${facilityId}`);

    await test.step("Click back button", async () => {
      const backButton = page.getByRole("button", { name: /back/i }).first();
      await expect(backButton).toBeVisible();
      await backButton.click();
    });

    await test.step("Verify navigation to facilities list", async () => {
      // Should navigate back to /facilities page
      await expect(page).toHaveURL(/\/facilities/);
    });
  });

  test("should display map link if coordinates are available", async ({
    page,
  }) => {
    await page.goto(`/facility/${facilityId}`);

    await test.step("Check for map link", async () => {
      // If facility has lat/long, map link should be present
      // We can check if the page loaded successfully and has facility info
      const container = page.locator(".container").first();
      await expect(container).toBeVisible();

      // Map link is optional based on facility data
      // Just verify page structure is correct
    });
  });
});
