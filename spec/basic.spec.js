const { setup, teardown } = require('./helpers');
const { assertFails, assertSucceeds } = require('@firebase/testing');

describe('Database rules', () => {
  let db;
  let ref;

  // Applies only to tests in this describe block
  beforeAll(async () => {
    db = await setup();

    // All paths are secure by default
    ref = db.collection('some-nonexistent-collection');
  });

  afterAll(async () => {
    await teardown();
  });

  test('fail when reading/writing an unauthorized collection', async () => {
    const failedRead = await assertFails(ref.get());
    expect(failedRead);

    // One-line await
    expect(await assertFails(ref.add({})));

    // Custom Matchers
    await expect(ref.get()).toDeny();
    await expect(ref.get()).toAllow();
  });
});
