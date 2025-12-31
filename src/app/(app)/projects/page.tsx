import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Plus } from "lucide-react";
import { getUserProjects } from "@/server/projects";

export default async function ProjectsPage() {
  const userProjects = await getUserProjects();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Manage your projects and linked repositories.
          </p>
        </div>
        <Button asChild>
          <Link href="/projects/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Project
          </Link>
        </Button>
      </div>

      {userProjects.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">No projects found</h3>
            <p className="text-muted-foreground">
              You haven&apos;t created or joined any projects yet.
            </p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/projects/new">Create your first project</Link>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {userProjects.map((project) => (
            <Link key={project.id} href={`/projects/${project.key}`}>
              <Card className="h-full hover:bg-accent/50 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground px-2 py-1 bg-muted rounded">
                      {project.key}
                    </span>
                    <span className="text-xs capitalize text-muted-foreground">
                      {project.role}
                    </span>
                  </div>
                  <CardTitle className="mt-2">{project.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {project.description || "No description provided."}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
