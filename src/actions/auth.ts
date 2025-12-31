"use server";

import { loginSchema, registerSchema } from "@/schemas/auth";
import { z } from "zod";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function loginAction(data: z.infer<typeof loginSchema>) {
  const result = loginSchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      error: "Invalid data",
    };
  }

  try {
    const response = await auth.api.signInEmail({
      body: {
        email: result.data.email,
        password: result.data.password,
      },
      headers: await headers(),
    });

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to sign in",
    };
  }
}

export async function registerAction(data: z.infer<typeof registerSchema>) {
  const result = registerSchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      error: "Invalid data",
    };
  }

  try {
    await auth.api.signUpEmail({
      body: {
        name: result.data.name,
        email: result.data.email,
        password: result.data.password,
      },
      headers: await headers(),
    });

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create account",
    };
  }
}
