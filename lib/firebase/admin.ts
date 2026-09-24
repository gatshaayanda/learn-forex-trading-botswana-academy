import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function getAdminApp() {
  if (getApps().length) return getApps()[0];

  const serviceAccount = process.env.FIREBASE_ADMIN_KEY;
  if (!serviceAccount) throw new Error("FIREBASE_ADMIN_KEY is not configured");

  return initializeApp({
    credential: cert(JSON.parse(serviceAccount)),
  });
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}

export function getAdminDb() {
  return getFirestore(getAdminApp());
}
