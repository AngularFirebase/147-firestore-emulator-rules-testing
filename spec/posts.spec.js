const { setup, teardown } = require('./helpers');

describe('Post rules', () => {
  let db;
  let secureRef;
  let postsRef;
  // Applies only to tests in this describe block
  beforeAll(async () => {
    db = await setup();
    // All paths are secure by default
    secureRef = db.collection('some-random-collection');

    // Allow rules in place for this collection
    postsRef = db.collection('posts');
  });

  afterAll(async () => {
    await teardown();
  });

  test('fail when reading/writing an unauthorized collection', async () => {
    await expect(secureRef.get()).toDeny();
    await expect(secureRef.add({ some: 'data' })).toDeny();
  });

  test('succeeds when reading/writing an authorized collection', async () => {
    await expect(postsRef.add({})).toAllow();
    await expect(postsRef.get()).toAllow();
  });
});
