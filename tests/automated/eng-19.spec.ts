import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

test.describe('ENG-19: Specimen Definition Slug Handling', () => {

  test('AC1: GIVEN A valid specimen definition exists in the system WHEN A user updates the slug with a valid new value via the API THEN The API must return a 200 status code and the updated slug must be persisted.', async ({ request, page }, testInfo) => {
    const validSlug = faker.lorem.slug();
    const specimenId = faker.datatype.uuid();

    const response = await request.put(`/api/specimens/${specimenId}/slug`, {
      data: { slug: validSlug }
    });

    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    expect(responseBody.slug).toBe(validSlug);

    await testInfo.attach('screenshot', { body: await page.screenshot(), contentType: 'image/png' });
  });

  test('AC2: GIVEN A valid specimen definition exists in the system WHEN A user updates the slug with an invalid value THEN The API must return a 400 status code with a descriptive error message.', async ({ request, page }, testInfo) => {
    const invalidSlug = 'invalid!slug';
    const specimenId = faker.datatype.uuid();

    const response = await request.put(`/api/specimens/${specimenId}/slug`, {
      data: { slug: invalidSlug }
    });

    expect(response.status()).toBe(400);
    const responseBody = await response.json();
    expect(responseBody.message).toContain('Invalid slug');

    await testInfo.attach('screenshot', { body: await page.screenshot(), contentType: 'image/png' });
  });

  test('AC3: GIVEN A valid specimen definition exists in the system WHEN A user attempts to update the slug to a value that already exists for another specimen THEN The API must return a 409 status code with a descriptive error message.', async ({ request, page }, testInfo) => {
    const existingSlug = faker.lorem.slug();
    const specimenId = faker.datatype.uuid();

    // Simulate existing slug in the system
    await request.post('/api/specimens', {
      data: { id: faker.datatype.uuid(), slug: existingSlug }
    });

    const response = await request.put(`/api/specimens/${specimenId}/slug`, {
      data: { slug: existingSlug }
    });

    expect(response.status()).toBe(409);
    const responseBody = await response.json();
    expect(responseBody.message).toContain('Slug already exists');

    await testInfo.attach('screenshot', { body: await page.screenshot(), contentType: 'image/png' });
  });

  test('AC4: GIVEN A valid specimen definition exists in the system WHEN A user attempts to update the slug but the specimen ID provided in the request does not exist THEN The API must return a 404 status code with a descriptive error message.', async ({ request, page }, testInfo) => {
    const validSlug = faker.lorem.slug();
    const nonExistentSpecimenId = faker.datatype.uuid();

    const response = await request.put(`/api/specimens/${nonExistentSpecimenId}/slug`, {
      data: { slug: validSlug }
    });

    expect(response.status()).toBe(404);
    const responseBody = await response.json();
    expect(responseBody.message).toContain('Specimen not found');

    await testInfo.attach('screenshot', { body: await page.screenshot(), contentType: 'image/png' });
  });

});