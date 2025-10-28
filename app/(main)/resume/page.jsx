import { getResume } from "@/actions/resume";
import ResumeBuilder from "./_components/resume-builder";

export const dynamic = 'force-dynamic';

export default async function ResumePage({ searchParams }) {
  // If resumeId is provided, we could load that specific resume
  // For now, just load the latest resume
  const resume = await getResume();

  return (
    <div className="container mx-auto py-6">
      <ResumeBuilder initialResume={resume} />
    </div>
  );
}
