#!/usr/bin/env node
/**
 * One-time setup: creates the dedicated Firebase Auth identity that
 * firestore.rules grants write access to (ADMIN_FIREBASE_EMAIL /
 * ADMIN_FIREBASE_PASSWORD in .env.local).
 *
 * Safe to re-run — if the user already exists it signs in instead of
 * failing, so this doubles as a config smoke test.
 *
 * Usage: node --env-file=.env.local scripts/create-firebase-admin-user.mjs
 */
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';

const required = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'ADMIN_FIREBASE_EMAIL',
  'ADMIN_FIREBASE_PASSWORD',
];
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  console.error('Missing env vars:', missing.join(', '));
  console.error('Run with: node --env-file=.env.local scripts/create-firebase-admin-user.mjs');
  process.exit(1);
}

const app = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
});
const auth = getAuth(app);

const email = process.env.ADMIN_FIREBASE_EMAIL;
const password = process.env.ADMIN_FIREBASE_PASSWORD;

try {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  console.log(`✔ Created Firebase admin identity: ${cred.user.email} (uid ${cred.user.uid})`);
  console.log('Next: deploy firestore.rules (see firestore.rules comment) so writes actually require this identity.');
} catch (err) {
  if (err.code === 'auth/email-already-in-use') {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      console.log(`✔ Identity already exists and credentials match: ${cred.user.email} (uid ${cred.user.uid})`);
    } catch (signInErr) {
      console.error(`✘ Identity exists but ADMIN_FIREBASE_PASSWORD doesn't match it: ${signInErr.code}`);
      console.error('Either fix ADMIN_FIREBASE_PASSWORD in .env.local, or delete the user in');
      console.error('Firebase Console → Authentication → Users and re-run this script.');
      process.exit(1);
    }
  } else if (err.code === 'auth/operation-not-allowed') {
    console.error('✘ Email/Password sign-in is not enabled on this Firebase project.');
    console.error('Fix: Firebase Console → Authentication → Sign-in method → enable "Email/Password", then re-run this script.');
    process.exit(1);
  } else if (err.code === 'auth/invalid-email') {
    console.error(`✘ ADMIN_FIREBASE_EMAIL ("${email}") is not a valid email format for Firebase Auth.`);
    process.exit(1);
  } else {
    console.error('✘ Unexpected error:', err.code || err.message);
    process.exit(1);
  }
}

process.exit(0);
