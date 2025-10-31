import ResumeBuilder from "../_components/resume-builder";

export const dynamic = 'force-dynamic';

export default function NewResumePage() {
  return (
    <div className="container mx-auto py-6">
      <ResumeBuilder mode="create" />
    </div>
  );
}