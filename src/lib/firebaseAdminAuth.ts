import 'server-only';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';

/**
 * Signs the server's dedicated Firebase Auth identity in (once per warm
 * instance) so that subsequent firebase/firestore client-SDK calls made from
 * API routes carry a real `request.auth` in Firestore's eyes. firestore.rules
 * restricts writes to exactly this account's email — see firestore.rules.
 *
 * This must only ever be imported from server-side code (API routes). The
 * `server-only` import above throws a build error if a client component
 * ever pulls it in by mistake.
 */
let signInPromise: Promise<void> | null = null;

export function ensureFirebaseAdminAuth(): Promise<void> {
  if (auth.currentUser) return Promise.resolve();

  if (!signInPromise) {
    const email = process.env.ADMIN_FIREBASE_EMAIL;
    const password = process.env.ADMIN_FIREBASE_PASSWORD;

    if (!email || !password) {
      return Promise.reject(
        new Error('ADMIN_FIREBASE_EMAIL / ADMIN_FIREBASE_PASSWORD are not configured')
      );
    }

    signInPromise = signInWithEmailAndPassword(auth, email, password)
      .then(() => undefined)
      .finally(() => {
        signInPromise = null;
      });
  }

  return signInPromise;
}
