// This is a simplified approach for development
// In production, you should use Firebase Admin SDK

import { cookies } from "next/headers";
import { db } from "@/lib/prisma";

export async function getAuthenticatedUser() {
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('firebase-user');
    const tokenCookie = cookieStore.get('firebase-token');
    
    if (!userCookie) {
      throw new Error(
        "Authentication required. Please log in to continue."
      );
    }

    let userData;
    try {
      userData = JSON.parse(decodeURIComponent(userCookie.value));
    } catch (parseError) {
      throw new Error("Invalid authentication data. Please log in again.");
    }
    
    const firebaseUserId = userData.uid;
    
    if (!firebaseUserId) {
      throw new Error("Invalid user data in authentication cookie. Please log in again.");
    }

    const user = await db.user.findUnique({
      where: { firebaseUserId },
    });

    if (!user) {
      throw new Error(
        "User profile not found. Please complete the onboarding process."
      );
    }

    return user;
  } catch (error) {
    throw new Error(`Unauthorized: ${error.message}`);
  }
}