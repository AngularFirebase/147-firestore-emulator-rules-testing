const { setup, teardown } = require('./helpers');

const mockData = {
  'users/jeffd23': {
    roles: {
      admin: true,
    },
  },
  'projects/testId': {
    members: ['bob', 'jeffd23'],
  },
};

describe('Project rules', () => {
  // let db;
  // let projectsRef;

  // Applies only to tests in this describe block
  beforeAll(async () => {
    // db = await setup();
    // projectsRef = db.collection("posts");
  });

  afterAll(async () => {
    await teardown();
  });

  test('allow a user with the admin role', async () => {
    const db = await setup({ uid: 'jeffd23' }, mockData);

    // Allow rules in place for this collection
    const projRef = db.doc('projects/testId');

    console.info(projRef.get());
    await expect(projRef.get()).toAllow();
  });

  test('deny a user without the admin role', async () => {
    const db = await setup({ uid: 'alice' }, mockData);

    // Allow rules in place for this collection
    const projRef = db.doc('projects/testId');
    await expect(projRef.get()).toDeny();
  });

  test('deny a user if they are not on the Access Control List or an admin', async () => {
    const db = await setup({ uid: 'frank' }, mockData);

    // Allow rules in place for this collection
    const projRef = db.doc('projects/testId');
    await expect(projRef.get()).toDeny();
  });

  test('allow a user if they are on the Access Control List', async () => {
    const db = await setup({ uid: 'bob' }, mockData);

    // Allow rules in place for this collection
    const projRef = db.doc('projects/testId');
    await expect(projRef.get()).toAllow();
  });
});
