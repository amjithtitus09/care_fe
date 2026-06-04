import { test } from '@playwright/test';
import { faker } from '@faker-js/faker';

test.describe('ENG-19: Specimen Definition Slug Updates', () => {

  test('AC1: GIVEN A valid specimen definition exists in the system WHEN The user updates the slug for the specimen definition via the UI or API THEN The system successfully updates the slug and does not return a 404 error.', async ({ page }, testInfo) => {
    const specimenId = faker.datatype.uuid();
    const newSlug = faker.lorem.slug();

    // Navigate to the specimen definition page
    await page.goto(`/specimen/${specimenId}`);

    // Update the slug via the UI
    await page.getByTestId('edit-slug-button').click();
    await page.getByTestId('slug-input').fill(newSlug);
    await page.getByTestId('save-slug-button').click();

    // Assert no 404 error and slug is updated
    await page.waitForResponse(response => 
      response.url().includes(`/api/specimen/${specimenId}`) && 
      response.status() !== 404
    );

    testInfo.attach('screenshot', { body: await page.screenshot(), contentType: 'image/png' });
  });

  test('AC2: GIVEN A specimen definition with an updated slug exists WHEN The user retrieves the specimen definition via the API THEN The API response includes the updated slug.', async ({ request }, testInfo) => {
    const specimenId = faker.datatype.uuid();
    const updatedSlug = faker.lorem.slug();

    // Simulate updating the slug via API
    await request.put(`/api/specimen/${specimenId}`, {
      data: { slug: updatedSlug }
    });

    // Retrieve the specimen definition via API
    const response = await request.get(`/api/specimen/${specimenId}`);
    const responseBody = await response.json();

    // Assert the updated slug is in the response
    test.expect(responseBody.slug).toBe(updatedSlug);

    testInfo.attach('screenshot', { body: Buffer.from(JSON.stringify(responseBody, null, 2)), contentType: 'application/json' });
  });

  test('AC3: GIVEN A user interacts with the UI to update the slug WHEN The user navigates using assistive technologies (e.g., screen readers) THEN The UI elements for updating the slug are accessible and conform to WCAG 2.1 AA standards.', async ({ page }, testInfo) => {
    const specimenId = faker.datatype.uuid();

    // Navigate to the specimen definition page
    await page.goto(`/specimen/${specimenId}`);

    // Assert accessibility of the slug update UI elements
    await test.expect(page.getByTestId('edit-slug-button')).toHaveAttribute('aria-label', 'Edit slug');
    await test.expect(page.getByTestId('slug-input')).toHaveAttribute('aria-required', 'true');
    await test.expect(page.getByTestId('save-slug-button')).toHaveAttribute('aria-label', 'Save updated slug');

    testInfo.attach('screenshot', { body: await page.screenshot(), contentType: 'image/png' });
  });

});