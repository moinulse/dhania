import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(3, "Project name must be at least 3 characters"),
  key: z
    .string()
    .min(2, "Key must be at least 2 characters")
    .max(8, "Key must be at most 8 characters")
    .regex(/^[A-Z0-9]+$/, "Key must be uppercase alphanumeric"),
  description: z.string().optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
