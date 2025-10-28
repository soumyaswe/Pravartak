import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const firebaseUserId = searchParams.get("userId");

    if (!firebaseUserId) {
      return NextResponse.json(
        { error: "User ID required" },
        { status: 400 }
      );
    }

    // Find user
    const user = await db.user.findUnique({
      where: { firebaseUserId },
      include: {
        profile: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get counts
    const [
      resumeCount,
      coverLetterCount,
      mockInterviewCount,
      interviewPrepCount,
      jobApplicationCount,
      recentActivity,
    ] = await Promise.all([
      db.resume.count({ where: { userId: user.id } }),
      db.coverLetter.count({ where: { userId: user.id } }),
      db.mockInterview.count({ where: { userId: user.id } }),
      db.interviewPrep.count({ where: { userId: user.id } }),
      db.jobApplication.count({ where: { userId: user.id } }),
      db.userActivity.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          activityType: true,
          description: true,
          createdAt: true,
        },
      }),
    ]);

    // Calculate profile completion
    const profile = user.profile;
    let completionSteps = 0;
    let totalSteps = 7;

    if (profile) {
      if (profile.hasBasicInfo) completionSteps++;
      if (profile.hasExperience) completionSteps++;
      if (profile.hasEducation) completionSteps++;
      if (profile.hasSkills) completionSteps++;
      if (profile.hasResume) completionSteps++;
      if (profile.hasCoverLetter) completionSteps++;
      if (profile.hasCompletedMockInterview) completionSteps++;
    }

    // Check if user has basic info
    if (user.name && user.email) completionSteps++;
    if (user.skills && user.skills.length > 0 && !profile?.hasSkills) completionSteps++;
    if (resumeCount > 0 && !profile?.hasResume) completionSteps++;
    if (coverLetterCount > 0 && !profile?.hasCoverLetter) completionSteps++;

    const profileCompletion = Math.min(Math.round((completionSteps / totalSteps) * 100), 100);

    // Calculate documents created
    const documentsCreated = resumeCount + coverLetterCount;

    // Calculate interview sessions
    const interviewSessions = mockInterviewCount + interviewPrepCount;

    // Get latest mock interview score
    const latestMockInterview = await db.mockInterview.findFirst({
      where: { userId: user.id, overallScore: { not: null } },
      orderBy: { completedAt: "desc" },
      select: { overallScore: true },
    });

    // Get active days (days with activity)
    const firstActivity = await db.userActivity.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
    });

    let activeDays = 0;
    if (firstActivity) {
      const daysSinceFirst = Math.floor(
        (Date.now() - firstActivity.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      activeDays = Math.min(daysSinceFirst + 1, 30); // Cap at 30 for display
    }

    // Get application status breakdown
    const jobApplicationsByStatus = await db.jobApplication.groupBy({
      by: ["status"],
      where: { userId: user.id },
      _count: true,
    });

    const stats = {
      profileCompletion,
      documentsCreated,
      interviewSessions,
      resumeCount,
      coverLetterCount,
      mockInterviewCount,
      interviewPrepCount,
      jobApplicationCount,
      activeDays,
      latestMockScore: latestMockInterview?.overallScore || null,
      recentActivity,
      jobApplicationsByStatus: jobApplicationsByStatus.map((item) => ({
        status: item.status,
        count: item._count,
      })),
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
