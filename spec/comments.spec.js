const { setup, teardown } = require('./helpers');

describe('Comments rules', () => {
  afterEach(async () => {
    await teardown();
  });

  test('fail when not authenticated', async () => {
    const db = await setup();

    const commentsRef = db.collection('comments');

    await expect(commentsRef.get()).toDeny();
    await expect(commentsRef.add({})).toDeny();
  });

  test('pass when authenticated', async () => {
    const db = await setup({
      uid: 'jeffd23',
      email: 'hello@angularfirebase.com'
    });

    const commentsRef = db.collection('comments');

    await expect(commentsRef.get()).toAllow();
    await expect(commentsRef.add({ userId: 'jeffd23' })).toAllow();
    await expect(commentsRef.add({ userId: 'someOtherUser' })).toDeny();
  });
});
