"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createProjectSchema, CreateProjectInput } from "@/schemas/project";
import { createProject } from "@/app/(app)/projects/_actions/create-project";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

export function CreateProjectForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      key: "",
      description: "",
    },
  });

  async function onSubmit(data: CreateProjectInput) {
    setIsSubmitting(true);
    try {
      const result = await createProject(data);
      if (result.error) {
        toast.error(result.error);
      } else if (result.success && result.projectKey) {
        toast.success("Project created successfully");
        router.push(`/projects/${result.projectKey}`);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Auto-generate key from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    form.setValue("name", name);
    
    // Only auto-generate if key hasn't been manually edited (simple heuristic: if key is empty or matches previous auto-gen)
    // For simplicity, just auto-gen if key is empty or we can be smarter later.
    // Here: just a simple transformation for suggestion.
    const suggestedKey = name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 4);
      
    if (!form.getValues("key") || form.getValues("key").length < 2) {
         form.setValue("key", suggestedKey);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Create New Project</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input 
                        placeholder="e.g. Payment Gateway Redesign" 
                        {...field} 
                        onChange={(e) => {
                            field.onChange(e);
                            handleNameChange(e);
                        }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Key</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. PAY" {...field} />
                  </FormControl>
                  <FormDescription>
                    Unique identifier for the project (uppercase, 2-10 chars).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Briefly describe the project goals..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
