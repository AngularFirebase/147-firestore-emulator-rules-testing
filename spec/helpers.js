const firebase = require('@firebase/testing');
const fs = require('fs');

module.exports.setup = async (auth, data) => {
  const projectId = `rules-spec-${Date.now()}`;
  const app = await firebase.initializeTestApp({
    projectId,
    auth
  });

  const db = app.firestore();

  // Write mock documents before rules
  if (data) {
    for (const key in data) {
      const ref = db.doc(key);
      await ref.set(data[key]);
    }
  }

  // Apply rules
  await firebase.loadFirestoreRules({
    projectId,
    rules: fs.readFileSync('firestore.rules', 'utf8')
  });

  return db;
};

module.exports.teardown = async () => {
  Promise.all(firebase.apps().map(app => app.delete()));
};

expect.extend({
  async toAllow(x) {
    let pass = false;
    let message = '';
    try {
      await firebase.assertSucceeds(x);
      pass = true;
    } catch (err) {
      message = `Expected Firebase operation to be allowed, but it failed with ${
        err.code
      }
    `;
    }
    return {
      pass,
      message: () => message
    };
  }
});

expect.extend({
  async toDeny(x) {
    let pass = false;
    let message = '';
    try {
      await firebase.assertFails(x);
      pass = true;
    } catch (err) {
      message = `Expected Firebase operation to be denied, but it was allowed
    `;
    }
    return {
      pass,
      message: () => message
    };
  }
});
