import { faker } from "@faker-js/faker";
import { expect, test } from "@playwright/test";
import {
  ACTIVITY_DEFINITION_CODES,
  DIAGNOSTIC_REPORT_CODES,
  RESOURCE_CATEGORY_SLUG,
} from "tests/facility/settings/activityDefinition/activityDefinition";
import {
  closeAnyOpenPopovers,
  expectToast,
  selectFromValueSet,
} from "tests/helper/ui";
import { expectedSlug } from "tests/helper/utils";
import { getEncounterId } from "tests/support/encounterId";
import { getFacilityId } from "tests/support/facilityId";
import { getPatientId } from "tests/support/patientId";

/**
 * ENG-503: An ActivityDefinition can declare multiple `diagnostic_report_codes`.
 * For SRs against such ADs, the DiagnosticReportForm dropdown must list every
 * unused code, and after a report is created for one code the form must enter
 * edit mode for that report (no dropdown visible until the report is finalised).
 *
 * NOTE: A fully wired flow that finalises the first report and then asserts the
 * second-create dropdown excludes the just-used code requires the report
 * finalise UI which is not yet covered by E2E helpers. That assertion is
 * therefore left as a TODO; this spec covers the form-level behaviour around
 * multi-code dropdowns end-to-end up to the first report creation.
 */

test.use({ storageState: "tests/.auth/user.json" });

test.describe("ENG-503: Multi diagnostic_report_code support", () => {
  test("AD with two diagnostic_report_codes lists both in the SR dropdown and enters edit mode after first create", async ({
    page,
  }) => {
    const facilityId = getFacilityId();
    const patientId = getPatientId();
    const encounterId = getEncounterId();

    const adTitle = `${faker.commerce.productName()} ${Date.now()}`;
    const adSlug = expectedSlug(adTitle);
    const adCode = faker.helpers.arrayElement(ACTIVITY_DEFINITION_CODES);
    const [reportCodeA, reportCodeB] = faker.helpers.arrayElements(
      DIAGNOSTIC_REPORT_CODES,
      2,
    );

    await test.step("Create AD with two diagnostic_report_codes", async () => {
      await page.goto(
        `/facility/${facilityId}/settings/activity_definitions/categories/f-${facilityId}-${RESOURCE_CATEGORY_SLUG}/new`,
      );

      await page.getByLabel(/title.*\*/i).fill(adTitle);
      await expect(page.getByLabel(/slug/i)).toHaveValue(adSlug);
      await page.getByLabel(/description.*\*/i).fill("ENG-503 multi-report AD");
      await page.getByLabel(/usage.*\*/i).fill("ENG-503 spec usage");

      await page.getByLabel(/^status$/i).click();
      await page.getByRole("option", { name: "Active" }).click();

      await page.getByRole("combobox", { name: /^category\s*\*$/i }).click();
      await page.getByRole("option", { name: "Laboratory" }).click();

      await page.getByLabel(/^kind$/i).click();
      await page.getByRole("option", { name: /service request/i }).click();

      const codeCombobox = page.getByRole("combobox", { name: /^code/i });
      await selectFromValueSet(page, codeCombobox, { search: adCode });

      // Add the first diagnostic_report_code
      const diagCombobox = page
        .getByRole("combobox")
        .filter({ hasText: /search.*diagnostic/i });
      await selectFromValueSet(page, diagCombobox, { search: reportCodeA });
      await closeAnyOpenPopovers(page);

      // Add the second diagnostic_report_code (re-open the same combobox)
      const diagCombobox2 = page
        .getByRole("combobox")
        .filter({ hasText: /search.*diagnostic/i });
      await selectFromValueSet(page, diagCombobox2, { search: reportCodeB });
      await closeAnyOpenPopovers(page);

      await page.getByRole("button", { name: /^create$/i }).click();
      await expectToast(page, /activity definition created successfully/i);
      await expect(page).toHaveURL(
        `/facility/${facilityId}/settings/activity_definitions`,
      );
    });

    await test.step("Create a service request against that AD", async () => {
      await page.goto(
        `/facility/${facilityId}/patient/${patientId}/encounter/${encounterId}/service_requests`,
      );
      await page
        .getByRole("button", { name: /create service request/i })
        .click();

      const adPicker = page
        .locator('button[role="combobox"]')
        .filter({ hasText: /select activity definition/i });
      await adPicker.waitFor({ state: "visible" });
      await adPicker.click();

      await page.getByPlaceholder(/search activity definitions/i).fill(adTitle);
      await page
        .locator('[data-slot="command-item"]', { hasText: adTitle })
        .first()
        .click();

      await page.getByRole("button", { name: /submit/i }).click();
      await expectToast(page, /questionnaire submitted successfully/i);
    });

    await test.step("Open SR details and verify both report codes are listed in the dropdown", async () => {
      await page.goto(
        `/facility/${facilityId}/patient/${patientId}/encounter/${encounterId}/service_requests`,
      );
      const row = page
        .locator('[data-slot="table-body"] [data-slot="table-row"]')
        .filter({ hasText: adTitle })
        .first();
      await row.getByRole("button", { name: /see details/i }).click();
      await page.waitForLoadState("networkidle");

      // Some ADs require specimen collection before the create dropdown becomes
      // enabled. If the AD has no specimen requirements the dropdown is enabled
      // immediately. If it does, we skip this scenario rather than asserting on
      // a flow that depends on specimen helpers.
      const collectButton = page.getByRole("button", {
        name: /collect specimen/i,
      });
      if (
        await collectButton
          .first()
          .isVisible()
          .catch(() => false)
      ) {
        // Out of scope for this focused spec; covered by other SR tests.
        test.skip(true, "AD has specimen requirements; covered elsewhere");
      }

      const reportTypeTrigger = page
        .getByRole("combobox")
        .filter({ hasText: /select diagnostic report type/i });
      await reportTypeTrigger.click();

      await expect(
        page.getByRole("option", { name: reportCodeA }),
      ).toBeVisible();
      await expect(
        page.getByRole("option", { name: reportCodeB }),
      ).toBeVisible();
    });

    await test.step("Creating the first report enters edit mode (no dropdown shown)", async () => {
      await page.getByRole("option", { name: reportCodeA }).click();
      await page.getByRole("button", { name: /create report/i }).click();
      await page.waitForLoadState("networkidle");

      // After creation, the form is in edit mode for the just-created
      // preliminary report — the create dropdown must not be visible.
      await expect(
        page
          .getByRole("combobox")
          .filter({ hasText: /select diagnostic report type/i }),
      ).toHaveCount(0);

      // TODO(ENG-503): Once a Playwright helper exists for finalising a
      // diagnostic report, extend this spec to: finalise the first report,
      // assert the dropdown re-appears showing only `reportCodeB`, create the
      // second report, finalise it, and assert the
      // `all_diagnostic_reports_created` empty state is shown.
    });
  });
});
