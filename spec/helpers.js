const firebase = require('@firebase/rules-unit-testing');
const fs = require('fs');

module.exports.setup = async (auth, data) => {
  const projectId = `rules-spec-${Date.now()}`;
  const app = firebase.initializeTestApp({
    projectId,
    auth,
  });

  const db = app.firestore();
  const dbAdmin = firebase.initializeAdminApp({ projectId }).firestore();
  // const FIRESTORE_EMULATOR_HOST = 8080;
  // db.useEmulator("localhost", FIRESTORE_EMULATOR_HOST);

  // could set rules on regular db to full allow
  // await firebase.loadFirestoreRules({
  //   projectId,
  //   rules:
  //     'service cloud.firestore {match/databases/{database}/documents' +
  //     '{match /{document=**} {' +
  //     'allow read, write: if true;' +
  //     '}}}',
  // });

  // Write mock documents before rules
  if (data) {
    for (const key in data) {
      const ref = dbAdmin.doc(key);
      await ref.set(data[key]);
    }
  }

  // Apply rules
  await firebase.loadFirestoreRules({
    projectId,
    rules: fs.readFileSync('firestore.rules', 'utf8'),
  });

  return db;
};

module.exports.teardown = async () => {
  Promise.all(firebase.apps().map((app) => app.delete()));
};

expect.extend({
  async toAllow(x) {
    let pass = false;
    try {
      await firebase.assertSucceeds(x);
      pass = true;
    } catch (err) {}

    return {
      pass,
      message: () => 'Expected Firebase operation to be allowed, but it failed',
    };
  },
});

expect.extend({
  async toDeny(x) {
    let pass = false;
    try {
      await firebase.assertFails(x);
      pass = true;
    } catch (err) {}
    return {
      pass,
      message: () =>
        'Expected Firebase operation to be denied, but it was allowed',
    };
  },
});
