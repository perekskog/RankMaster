import * as admin from 'firebase-admin';

// This is a singleton to ensure we only initialize the admin app once.
let app: admin.app.App;
let db: admin.firestore.Firestore;

/**
 * Initializes and returns the Firebase Admin SDK components.
 * It ensures that the admin app is initialized only once.
 */
export function getFirebaseAdmin() {
  if (!app) {
    // When running in a Google Cloud environment (like App Hosting),
    // the SDK automatically discovers the project's service account.
    // The service account needs to be parsed from an env var for local dev.
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT as string)
      : undefined;

    if (admin.apps.length > 0) {
      app = admin.app();
    } else if (serviceAccount) {
      // Initialize with a service account if provided (e.g., local development)
      app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else {
      // Initialize without credentials for environments like Cloud Run, App Hosting
      app = admin.initializeApp();
    }
    db = admin.firestore(app);
  }

  return { admin, app, db };
}
