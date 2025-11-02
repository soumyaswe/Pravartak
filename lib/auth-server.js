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
      // Only log in development mode
      if (process.env.NODE_ENV === 'development') {
        const allCookies = cookieStore.getAll();
        console.log("Auth Debug - Available cookies:", allCookies.map(c => c.name).join(", "));
      }
      throw new Error(
        "Authentication required. Please log in to continue."
      );
    }

    let userData;
    try {
      userData = JSON.parse(decodeURIComponent(userCookie.value));
    } catch (parseError) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Cookie parse error:", parseError.message);
      }
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
    // Only log detailed errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error("Auth error:", error.message);
    }
    throw new Error(`Unauthorized: ${error.message}`);
  }
}