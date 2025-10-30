"use server";

import { db } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { revalidatePath } from "next/cache";
import { generateAIInsights } from "./dashboard";

export async function updateUser(data) {
  try {
    const user = await getAuthenticatedUser();
    
    if (!user) {
      throw new Error("User not found");
    }

    console.log("Updating user with data:", data);

    // First, just update the user without transaction
    const updatedUser = await db.user.update({
      where: {
        id: user.id,
      },
      data: {
        industry: data.industry,
        experience: data.experience,
        bio: data.bio,
        skills: data.skills,
      },
    });

    console.log("User updated successfully:", updatedUser.id);

    // Then handle industry insights separately (non-blocking)
    try {
      let industryInsight = await db.industryInsight.findUnique({
        where: {
          industry: data.industry,
        },
      });

      if (!industryInsight) {
        console.log("Creating new industry insight for:", data.industry);
        const insights = await generateAIInsights(data.industry);

        await db.industryInsight.create({
          data: {
            industry: data.industry,
            ...insights,
            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });
      }
    } catch (insightError) {
      console.error("Error with industry insights (non-critical):", insightError);
      // Don't fail the update if industry insights fail
    }

    revalidatePath("/profile");
    revalidatePath("/dashboard");
    return updatedUser;
  } catch (error) {
    console.error("Error updating user:", error);
    console.error("Error stack:", error.stack);
    throw new Error(error.message || "Failed to update profile");
  }
}

export async function getUserProfile() {
  try {
    const user = await getAuthenticatedUser();
    
    if (!user) {
      throw new Error("User not found");
    }

    return user;
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw new Error("Failed to get user profile");
  }
}

export async function getUserOnboardingStatus() {
  try {
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return { isOnboarded: false };
    }

    return {
      isOnboarded: !!user?.industry,
    };
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    return { isOnboarded: false };
  }
}
