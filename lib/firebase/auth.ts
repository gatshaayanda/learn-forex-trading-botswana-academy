import { getAdminAuth } from "./admin";

export async function verifyFirebaseToken(token: string) {
  return getAdminAuth().verifyIdToken(token);
}
