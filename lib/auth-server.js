// This is a simplified approach for development
// In production, you should use Firebase Admin SDK

import { cookies } from "next/headers";
import { db } from "@/lib/prisma";

export async function getAuthenticatedUser() {
  try {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    
    console.log("Auth Debug - All cookies:", allCookies.map(c => ({ name: c.name, hasValue: !!c.value })));
    
    const userCookie = cookieStore.get('firebase-user');
    const tokenCookie = cookieStore.get('firebase-token');
    
    console.log("Auth Debug - User cookie exists:", !!userCookie);
    console.log("Auth Debug - Token cookie exists:", !!tokenCookie);
    
    if (!userCookie) {
      // Provide more helpful error message
      console.error("Auth Debug - Available cookies:", allCookies.map(c => c.name).join(", "));
      throw new Error(
        "Authentication required. Please ensure you are logged in. " +
        "If you just logged in, try refreshing the page. " +
        `Available cookies: ${allCookies.map(c => c.name).join(", ") || "none"}`
      );
    }

    let userData;
    try {
      userData = JSON.parse(decodeURIComponent(userCookie.value));
    } catch (parseError) {
      console.error("Auth Debug - Cookie parse error:", parseError);
      throw new Error("Invalid authentication data. Please log in again.");
    }
    
    const firebaseUserId = userData.uid;
    
    if (!firebaseUserId) {
      throw new Error("Invalid user data in authentication cookie. Please log in again.");
    }
    
    console.log("Auth Debug - Firebase UID:", firebaseUserId);

    const user = await db.user.findUnique({
      where: { firebaseUserId },
    });

    console.log("Auth Debug - User found in DB:", !!user);
    console.log("Auth Debug - User data:", user ? {
      id: user.id,
      email: user.email,
      name: user.name,
      hasPhone: !!user.phone,
      hasAddress: !!user.address
    } : null);

    if (!user) {
      throw new Error(
        `User profile not found. Your Firebase account (${firebaseUserId}) exists but no profile was created. ` +
        "Please complete the onboarding process or contact support."
      );
    }

    return user;
  } catch (error) {
    console.error("Authentication error details:", {
      message: error.message,
      stack: error.stack
    });
    throw new Error(`Unauthorized: ${error.message}`);
  }
}