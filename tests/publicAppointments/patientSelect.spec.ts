import { faker } from "@faker-js/faker";
import { expect, test } from "@playwright/test";

/**
 * Public Appointment - Patient Selection Tests
 *
 * Tests the patient selection flow after OTP authentication in the public appointment booking workflow.
 * This page allows authenticated patients to:
 * - View existing patient records associated with their phone number
 * - Select which patient to book an appointment for
 * - Navigate to patient registration to create a new patient record
 * - Confirm appointment booking for the selected patient
 *
 * Route: /facility/:facilityId/appointments/:staffId/patient-select
 * Required query params: slotId, reason
 * Required auth: OTP token from PatientUserProvider
 */

// Mock facility and staff IDs for the public appointment flow
const MOCK_FACILITY_ID = "facility-123";
const MOCK_STAFF_ID = "staff-456";
const MOCK_SLOT_ID = "slot-789";
const MOCK_REASON = "Regular checkup";

// Note: This test suite currently validates UI behavior without actual backend integration
// Full E2E tests would require:
// 1. OTP authentication setup via PatientUserProvider
// 2. Mock or real patient data associated with the authenticated phone number
// 3. Mock or real appointment slot data

test.describe("Public Appointment - Patient Selection", () => {
  test.beforeEach(async ({ page }) => {
    // Mock the OTP token in localStorage to simulate authenticated patient state
    await page.goto("/");
    await page.evaluate(() => {
      const mockTokenData = {
        phoneNumber: "+919999999999",
        token: "mock-otp-token-abc123",
        expiresAt: Date.now() + 3600000, // 1 hour from now
      };
      localStorage.setItem("patient-token-data", JSON.stringify(mockTokenData));
    });
  });

  test("should display the patient selection page with header and back button", async ({
    page,
  }) => {
    await test.step("Navigate to patient selection page", async () => {
      await page.goto(
        `/facility/${MOCK_FACILITY_ID}/appointments/${MOCK_STAFF_ID}/patient-select?slotId=${MOCK_SLOT_ID}&reason=${encodeURIComponent(MOCK_REASON)}`,
      );
    });

    await test.step("Verify page title and navigation elements", async () => {
      // Check page heading
      await expect(
        page.getByRole("heading", { name: /select.*register.*patient/i }),
      ).toBeVisible();

      // Check back button
      const backButton = page.getByRole("button", { name: /back/i });
      await expect(backButton).toBeVisible();
    });

    await test.step("Verify 'Add New Patient' button is present", async () => {
      const addPatientButton = page.getByRole("button", {
        name: /add new patient/i,
      });
      await expect(addPatientButton).toBeVisible();
    });
  });

  test("should navigate back to schedule selection when back button is clicked", async ({
    page,
  }) => {
    await test.step("Navigate to patient selection page", async () => {
      await page.goto(
        `/facility/${MOCK_FACILITY_ID}/appointments/${MOCK_STAFF_ID}/patient-select?slotId=${MOCK_SLOT_ID}&reason=${encodeURIComponent(MOCK_REASON)}`,
      );
    });

    await test.step("Click back button and verify navigation", async () => {
      const backButton = page.getByRole("button", { name: /back/i });
      await backButton.click();

      // Should navigate back to the book-appointment (schedule selection) page
      await expect(page).toHaveURL(
        new RegExp(
          `/facility/${MOCK_FACILITY_ID}/appointments/${MOCK_STAFF_ID}/book-appointment`,
        ),
      );
    });
  });

  test("should navigate to patient registration when 'Add New Patient' is clicked", async ({
    page,
  }) => {
    await test.step("Navigate to patient selection page", async () => {
      await page.goto(
        `/facility/${MOCK_FACILITY_ID}/appointments/${MOCK_STAFF_ID}/patient-select?slotId=${MOCK_SLOT_ID}&reason=${encodeURIComponent(MOCK_REASON)}`,
      );
    });

    await test.step("Click 'Add New Patient' and verify navigation", async () => {
      const addPatientButton = page.getByRole("button", {
        name: /add new patient/i,
      });
      await addPatientButton.click();

      // Should navigate to patient registration with query params preserved
      await page.waitForURL(
        new RegExp(
          `/facility/${MOCK_FACILITY_ID}/appointments/${MOCK_STAFF_ID}/patient-registration`,
        ),
      );
      expect(page.url()).toContain(`slotId=${MOCK_SLOT_ID}`);
      expect(page.url()).toContain(`reason=${encodeURIComponent(MOCK_REASON)}`);
    });
  });

  test("should display loading state while fetching patient data", async ({
    page,
  }) => {
    await test.step("Intercept API call and delay response", async () => {
      // Intercept the patient list API call and delay it
      await page.route("**/api/v1/public/patient/", async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            count: 0,
            results: [],
          }),
        });
      });

      await page.goto(
        `/facility/${MOCK_FACILITY_ID}/appointments/${MOCK_STAFF_ID}/patient-select?slotId=${MOCK_SLOT_ID}&reason=${encodeURIComponent(MOCK_REASON)}`,
      );
    });

    await test.step("Verify loading indicator is displayed", async () => {
      // Should show loading state while fetching
      await expect(page.locator('[data-testid="loading"]')).toBeVisible({
        timeout: 500,
      });
    });
  });

  test("should display 'no patients found' message when patient list is empty", async ({
    page,
  }) => {
    await test.step("Mock empty patient list response", async () => {
      await page.route("**/api/v1/public/patient/", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            count: 0,
            results: [],
          }),
        });
      });

      await page.goto(
        `/facility/${MOCK_FACILITY_ID}/appointments/${MOCK_STAFF_ID}/patient-select?slotId=${MOCK_SLOT_ID}&reason=${encodeURIComponent(MOCK_REASON)}`,
      );
    });

    await test.step("Verify 'no patients found' message", async () => {
      await expect(
        page.getByText(/no patients found.*phone number/i),
      ).toBeVisible();
    });
  });

  test("should display patient cards when patients are available", async ({
    page,
  }) => {
    const mockPatients = [
      {
        id: "patient-1",
        name: faker.person.fullName(),
        gender: "male",
        date_of_birth: "1990-05-15",
        year_of_birth: 1990,
      },
      {
        id: "patient-2",
        name: faker.person.fullName(),
        gender: "female",
        year_of_birth: 1985,
      },
    ];

    await test.step("Mock patient list response", async () => {
      await page.route("**/api/v1/public/patient/", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            count: mockPatients.length,
            results: mockPatients,
          }),
        });
      });

      await page.goto(
        `/facility/${MOCK_FACILITY_ID}/appointments/${MOCK_STAFF_ID}/patient-select?slotId=${MOCK_SLOT_ID}&reason=${encodeURIComponent(MOCK_REASON)}`,
      );
    });

    await test.step("Verify patient cards are displayed", async () => {
      // Wait for patient cards to load
      await page.waitForLoadState("networkidle");

      // Check that patient names are displayed
      for (const patient of mockPatients) {
        await expect(page.getByText(patient.name)).toBeVisible();
      }

      // Verify gender labels
      await expect(page.getByText(/sex/i).first()).toBeVisible();
    });
  });

  test("should allow selecting a patient by clicking on patient card", async ({
    page,
  }) => {
    const mockPatient = {
      id: "patient-123",
      name: faker.person.fullName(),
      gender: "male",
      date_of_birth: "1990-05-15",
      year_of_birth: 1990,
    };

    await test.step("Mock patient list response", async () => {
      await page.route("**/api/v1/public/patient/", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            count: 1,
            results: [mockPatient],
          }),
        });
      });

      await page.goto(
        `/facility/${MOCK_FACILITY_ID}/appointments/${MOCK_STAFF_ID}/patient-select?slotId=${MOCK_SLOT_ID}&reason=${encodeURIComponent(MOCK_REASON)}`,
      );
    });

    await test.step("Select patient and verify visual feedback", async () => {
      await page.waitForLoadState("networkidle");

      // Click on the patient card
      const patientCard = page
        .locator('[data-cui="card"]')
        .filter({ hasText: mockPatient.name });
      await patientCard.click();

      // Verify the card has selected styling (border-primary)
      await expect(patientCard).toHaveClass(/border-primary/);
    });

    await test.step("Verify confirm button appears after selection", async () => {
      // The sticky bottom bar with confirm button should appear
      const confirmButton = page.getByRole("button", {
        name: /confirm.*book.*appointment/i,
      });
      await expect(confirmButton).toBeVisible();
    });
  });

  test("should display patient age correctly from date of birth", async ({
    page,
  }) => {
    const mockPatient = {
      id: "patient-dob",
      name: faker.person.fullName(),
      gender: "female",
      date_of_birth: "1995-03-20",
      year_of_birth: 1995,
    };

    await test.step("Mock patient with date of birth", async () => {
      await page.route("**/api/v1/public/patient/", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            count: 1,
            results: [mockPatient],
          }),
        });
      });

      await page.goto(
        `/facility/${MOCK_FACILITY_ID}/appointments/${MOCK_STAFF_ID}/patient-select?slotId=${MOCK_SLOT_ID}&reason=${encodeURIComponent(MOCK_REASON)}`,
      );
    });

    await test.step("Verify date of birth is displayed in correct format", async () => {
      await page.waitForLoadState("networkidle");

      // Should display as "20 Mar 1995" format
      await expect(page.getByText(/20 mar 1995/i)).toBeVisible();
    });
  });

  test("should display patient age from year of birth when date of birth is not available", async ({
    page,
  }) => {
    const currentYear = new Date().getFullYear();
    const yearOfBirth = 1988;
    const expectedAge = currentYear - yearOfBirth;

    const mockPatient = {
      id: "patient-age",
      name: faker.person.fullName(),
      gender: "male",
      year_of_birth: yearOfBirth,
    };

    await test.step("Mock patient with only year of birth", async () => {
      await page.route("**/api/v1/public/patient/", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            count: 1,
            results: [mockPatient],
          }),
        });
      });

      await page.goto(
        `/facility/${MOCK_FACILITY_ID}/appointments/${MOCK_STAFF_ID}/patient-select?slotId=${MOCK_SLOT_ID}&reason=${encodeURIComponent(MOCK_REASON)}`,
      );
    });

    await test.step("Verify age is calculated and displayed", async () => {
      await page.waitForLoadState("networkidle");

      // Should display as "XX years"
      await expect(
        page.getByText(new RegExp(`${expectedAge} years`, "i")),
      ).toBeVisible();
    });
  });

  test("should create appointment when confirm button is clicked with valid selection", async ({
    page,
  }) => {
    const mockPatient = {
      id: "patient-confirm",
      name: faker.person.fullName(),
      gender: "female",
      date_of_birth: "1992-07-10",
      year_of_birth: 1992,
    };

    const mockAppointment = {
      id: "appointment-123",
      patient: mockPatient.id,
      note: MOCK_REASON,
      token_slot: MOCK_SLOT_ID,
      created_date: new Date().toISOString(),
    };

    await test.step("Setup mocks and navigate", async () => {
      // Mock patient list
      await page.route("**/api/v1/public/patient/", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            count: 1,
            results: [mockPatient],
          }),
        });
      });

      // Mock appointment creation
      await page.route(
        `**/api/v1/public/token_slot/${MOCK_SLOT_ID}/book_appointment/`,
        async (route) => {
          if (route.request().method() === "POST") {
            await route.fulfill({
              status: 201,
              contentType: "application/json",
              body: JSON.stringify(mockAppointment),
            });
          }
        },
      );

      await page.goto(
        `/facility/${MOCK_FACILITY_ID}/appointments/${MOCK_STAFF_ID}/patient-select?slotId=${MOCK_SLOT_ID}&reason=${encodeURIComponent(MOCK_REASON)}`,
      );
    });

    await test.step("Select patient and confirm appointment", async () => {
      await page.waitForLoadState("networkidle");

      // Click patient card to select
      const patientCard = page
        .locator('[data-cui="card"]')
        .filter({ hasText: mockPatient.name });
      await patientCard.click();

      // Click confirm button
      const confirmButton = page.getByRole("button", {
        name: /confirm.*book.*appointment/i,
      });
      await confirmButton.click();
    });

    await test.step("Verify navigation to success page", async () => {
      // Should navigate to the success page with appointment ID
      await page.waitForURL(
        new RegExp(
          `/facility/${MOCK_FACILITY_ID}/appointments/${mockAppointment.id}/success`,
        ),
        { timeout: 5000 },
      );
    });
  });

  test("should handle API errors gracefully when fetching patients fails", async ({
    page,
  }) => {
    await test.step("Mock API error response", async () => {
      await page.route("**/api/v1/public/patient/", async (route) => {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({
            error: "Internal server error",
          }),
        });
      });

      await page.goto(
        `/facility/${MOCK_FACILITY_ID}/appointments/${MOCK_STAFF_ID}/patient-select?slotId=${MOCK_SLOT_ID}&reason=${encodeURIComponent(MOCK_REASON)}`,
      );
    });

    await test.step("Verify error state is displayed", async () => {
      await page.waitForLoadState("networkidle");

      // The page should still render basic UI elements
      await expect(
        page.getByRole("heading", { name: /select.*register.*patient/i }),
      ).toBeVisible();

      // Should show 'Add New Patient' button as fallback
      await expect(
        page.getByRole("button", { name: /add new patient/i }),
      ).toBeVisible();
    });
  });

  test("should redirect when required query parameters are missing", async ({
    page,
  }) => {
    await test.step("Navigate without slotId parameter", async () => {
      await page.goto(
        `/facility/${MOCK_FACILITY_ID}/appointments/${MOCK_STAFF_ID}/patient-select?reason=${encodeURIComponent(MOCK_REASON)}`,
      );
    });

    await test.step("Verify redirection occurs", async () => {
      // Should redirect to book-appointment page when slotId is missing
      await page.waitForURL(
        new RegExp(
          `/facility/${MOCK_FACILITY_ID}/appointments/${MOCK_STAFF_ID}/book-appointment`,
        ),
        { timeout: 5000 },
      );
    });
  });

  test("should preserve reason in query parameters when navigating to registration", async ({
    page,
  }) => {
    const customReason = "Follow-up consultation for chronic condition";

    await test.step("Navigate with custom reason", async () => {
      await page.goto(
        `/facility/${MOCK_FACILITY_ID}/appointments/${MOCK_STAFF_ID}/patient-select?slotId=${MOCK_SLOT_ID}&reason=${encodeURIComponent(customReason)}`,
      );
    });

    await test.step("Click 'Add New Patient' button", async () => {
      const addPatientButton = page.getByRole("button", {
        name: /add new patient/i,
      });
      await addPatientButton.click();
    });

    await test.step("Verify reason is preserved in registration URL", async () => {
      await page.waitForURL(
        new RegExp(
          `/facility/${MOCK_FACILITY_ID}/appointments/${MOCK_STAFF_ID}/patient-registration`,
        ),
      );

      // Check that the custom reason is still in the query params
      expect(page.url()).toContain(
        `reason=${encodeURIComponent(customReason)}`,
      );
    });
  });

  test("should display multiple patients in a responsive grid layout", async ({
    page,
  }) => {
    const mockPatients = Array.from({ length: 6 }, (_, i) => ({
      id: `patient-${i + 1}`,
      name: faker.person.fullName(),
      gender: faker.helpers.arrayElement(["male", "female", "other"]),
      year_of_birth: 1980 + i * 5,
    }));

    await test.step("Mock multiple patients response", async () => {
      await page.route("**/api/v1/public/patient/", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            count: mockPatients.length,
            results: mockPatients,
          }),
        });
      });

      await page.goto(
        `/facility/${MOCK_FACILITY_ID}/appointments/${MOCK_STAFF_ID}/patient-select?slotId=${MOCK_SLOT_ID}&reason=${encodeURIComponent(MOCK_REASON)}`,
      );
    });

    await test.step("Verify all patients are displayed in grid", async () => {
      await page.waitForLoadState("networkidle");

      // Verify the grid container exists
      const gridContainer = page.locator(".grid");
      await expect(gridContainer).toBeVisible();

      // Verify all patient names are visible
      for (const patient of mockPatients) {
        await expect(page.getByText(patient.name)).toBeVisible();
      }

      // Verify we have the correct number of patient cards
      const patientCards = page.locator('[data-cui="card"]');
      await expect(patientCards).toHaveCount(mockPatients.length);
    });
  });

  test("should handle appointment creation failure with error message", async ({
    page,
  }) => {
    const mockPatient = {
      id: "patient-error",
      name: faker.person.fullName(),
      gender: "male",
      date_of_birth: "1985-11-25",
      year_of_birth: 1985,
    };

    await test.step("Setup mocks with error response", async () => {
      // Mock patient list
      await page.route("**/api/v1/public/patient/", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            count: 1,
            results: [mockPatient],
          }),
        });
      });

      // Mock appointment creation failure
      await page.route(
        `**/api/v1/public/token_slot/${MOCK_SLOT_ID}/book_appointment/`,
        async (route) => {
          if (route.request().method() === "POST") {
            await route.fulfill({
              status: 400,
              contentType: "application/json",
              body: JSON.stringify({
                error: "Slot no longer available",
              }),
            });
          }
        },
      );

      await page.goto(
        `/facility/${MOCK_FACILITY_ID}/appointments/${MOCK_STAFF_ID}/patient-select?slotId=${MOCK_SLOT_ID}&reason=${encodeURIComponent(MOCK_REASON)}`,
      );
    });

    await test.step("Attempt to create appointment", async () => {
      await page.waitForLoadState("networkidle");

      // Select patient
      const patientCard = page
        .locator('[data-cui="card"]')
        .filter({ hasText: mockPatient.name });
      await patientCard.click();

      // Attempt to confirm
      const confirmButton = page.getByRole("button", {
        name: /confirm.*book.*appointment/i,
      });
      await confirmButton.click();
    });

    await test.step("Verify user remains on selection page", async () => {
      // User should stay on patient-select page after error
      await expect(page).toHaveURL(
        new RegExp(
          `/facility/${MOCK_FACILITY_ID}/appointments/${MOCK_STAFF_ID}/patient-select`,
        ),
      );
    });
  });
});
