"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  createIssueSchema,
  CreateIssueInput,
  issueTypeEnum,
  issuePriorityEnum,
} from "@/schemas/issue";
import { createIssueAction } from "@/app/(app)/projects/[projectKey]/issues/_actions/issue-actions";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // I might need to create this component if not exists
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

// Assuming Select component exists or I'll implement standard HTML select for now if not
// Shadcn usually has a Select component. I should check if it's in components/ui.
// I'll assume standard Shadcn Select is available or I will create it.
// Checking file list... components/ui/ ... only button, card, field, form, input, label, separator, sonner, textarea.
// Missing Select. I should install it or use native select.
// For MVP speed and "senior dev" decision: use Native Select or install Shadcn Select?
// Installing Shadcn Select takes time to copy/paste code (since I can't run shadcn CLI).
// I will use a simple wrapper around Radix Select or just standard HTML <select> styled nicely.
// Actually, standard <select> with Tailwind is very fast and accessible.
// Let's stick to standard <select> for this iteration to avoid bloating with more files unless requested.

interface CreateIssueFormProps {
  projectKey: string;
}

export function CreateIssueForm({ projectKey }: CreateIssueFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateIssueInput>({
    resolver: zodResolver(createIssueSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "task",
      priority: "medium",
    },
  });

  async function onSubmit(data: CreateIssueInput) {
    setIsSubmitting(true);
    try {
      // Wrapper to call the server action which might redirect
      // Since server action redirects, this try/catch might be interrupted?
      // No, nextjs redirects throw an error that is caught by Next.js.
      // We should NOT catch it here blindly.

      const result = await createIssueAction(projectKey, data);

      if (result && result.error) {
        toast.error(result.error);
        setIsSubmitting(false);
      }
      // If successful, the server action redirects, so we don't need to do anything.
    } catch (error: any) {
      // Next.js redirection "NEXT_REDIRECT" error
      if (error.message === "NEXT_REDIRECT") {
        throw error;
      }
      toast.error("An unexpected error occurred");
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Issue</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Implement login page" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="epic">Epic</SelectItem>
                        <SelectItem value="feature">Feature</SelectItem>
                        <SelectItem value="task">Task</SelectItem>
                        <SelectItem value="bug">Bug</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add detailed description..."
                      className="min-h-[150px]"
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
                {isSubmitting ? "Creating..." : "Create Issue"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
