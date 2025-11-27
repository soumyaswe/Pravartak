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

    try {
      // Test database connection first
      try {
        await db.$connect();
      } catch (connectError) {
        const errorMessage = connectError.message || String(connectError);
        if (errorMessage.includes("Can't reach database") || 
            errorMessage.includes("connection") ||
            errorMessage.includes("ECONNREFUSED") ||
            errorMessage.includes("localhost:5432")) {
          throw new Error(
            `Database connection failed: Can't reach database server at localhost:5432\n\n` +
            `Please make sure your database server is running at localhost:5432.`
          );
        }
        throw connectError;
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
    } catch (dbError) {
      // Check if it's a database connection error
      if (dbError.message?.includes("Database connection failed") ||
          dbError.message?.includes("Can't reach database") ||
          dbError.message?.includes("DATABASE_URL") || 
          dbError.message?.includes("Environment variable not found") ||
          dbError.message?.includes("connection") ||
          dbError.message?.includes("ECONNREFUSED")) {
        throw new Error(`Database connection failed: ${dbError.message}`);
      }
      // Re-throw other database errors
      throw dbError;
    }
  } catch (error) {
    // Preserve the original error message for better debugging
    if (error.message?.includes("Database connection failed")) {
      throw error;
    }
    throw new Error(`Unauthorized: ${error.message}`);
  }
}