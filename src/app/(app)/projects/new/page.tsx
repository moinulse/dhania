import { CreateProjectForm } from "@/components/projects/create-project-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Project",
  description: "Start a new project to track your work.",
};

export default function CreateProjectPage() {
  return (
    <div className="container py-10">
      <CreateProjectForm />
    </div>
  );
}
