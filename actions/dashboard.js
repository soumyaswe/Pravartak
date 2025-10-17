"use server";

import { db } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export const generateAIInsights = async (industry) => {
  const prompt = `
          Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
          {
            "salaryRanges": [
              { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
            ],
            "growthRate": number,
            "demandLevel": "High" | "Medium" | "Low",
            "topSkills": ["skill1", "skill2"],
            "marketOutlook": "Positive" | "Neutral" | "Negative",
            "keyTrends": ["trend1", "trend2"],
            "recommendedSkills": ["skill1", "skill2"]
          }
          
          IMPORTANT: Return ONLY the JSON. No additional text, notes, or markdown formatting.
          Include at least 5 common roles for salary ranges.
          Growth rate should be a percentage.
          Include at least 5 skills and trends.
        `;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

  return JSON.parse(cleanedText);
};

export async function getIndustryInsights() {
  try {
    const user = await getAuthenticatedUser();

    // Get user with industry insights
    const userWithInsights = await db.user.findUnique({
      where: { firebaseUserId: user.firebaseUserId },
      include: {
        industryInsight: true,
      },
    });

    if (!userWithInsights) throw new Error("User not found");

    // If no insights exist, generate them
    if (!userWithInsights.industryInsight && userWithInsights.industry) {
      const insights = await generateAIInsights(userWithInsights.industry);

      const industryInsight = await db.industryInsight.create({
        data: {
          industry: userWithInsights.industry,
          ...insights,
          nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      return industryInsight;
    }

    return userWithInsights.industryInsight;
  } catch (error) {
    console.error("Error in getIndustryInsights:", error);
    throw new Error("Failed to get industry insights");
  }
}
