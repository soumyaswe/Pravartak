import { getIndustryInsights } from "@/actions/dashboard";
import DashboardView from "./_component/dashboard-view";
import { getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  try {
    const { isOnboarded } = await getUserOnboardingStatus();

    // If not onboarded, redirect to onboarding page
    // Skip this check if already on the onboarding page
    if (!isOnboarded) {
      redirect("/onboarding");
    }

    const insights = await getIndustryInsights();

    return (
      <div className="w-full">
        <DashboardView insights={insights} />
      </div>
    );
  } catch (error) {
    // If authentication fails, redirect to sign-in
    redirect("/sign-in");
  }
}
